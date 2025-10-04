import type { ActivityLog, ResponseRecord } from '@deepcrawl/db-d1';
import type {
  LinksErrorResponse,
  LinksResponse,
  LinksSuccessResponse,
  LinksTree,
} from '@deepcrawl/types/routers/links/types';
import type {
  ReadErrorResponse,
  ReadPostResponse,
  ReadStringResponse,
  ReadSuccessResponse,
} from '@deepcrawl/types/routers/read/types';
import type {
  LinksDynamics,
  LinksStableWithoutTree,
  LinksStableWithTree,
  LinksTreeWithoutDynamics,
  ReadDynamics,
  ReadSuccessResponseWithoutDynamics,
} from './dynamics-handling';

/**
 * Reconstructs the original response by combining data from response_record and activity_log
 * This reverses the extraction done by extractDynamicsForHash in dynamics-handling.ts
 */
export function reconstructResponse(
  responseRecord: ResponseRecord | null,
  activityLog: ActivityLog,
):
  | ReadStringResponse
  | ReadSuccessResponse
  | ReadPostResponse
  | LinksResponse
  | ReadErrorResponse
  | LinksErrorResponse {
  const path = activityLog.path;

  // Handle error responses
  if (!activityLog.success) {
    // For error responses, the full error is stored in responseMetadata
    return activityLog.responseMetadata as
      | ReadErrorResponse
      | LinksErrorResponse;
  }

  // If no response record, return error
  if (!responseRecord) {
    throw new Error(
      `No response record found for activity log ${activityLog.id}`,
    );
  }

  const responseContent = responseRecord.responseContent;
  const dynamics = activityLog.responseMetadata;

  // Handle getMarkdown endpoint (returns string)
  if (path === 'read-getMarkdown') {
    return responseContent as ReadStringResponse;
  }

  // Handle readUrl endpoint
  if (path === 'read-readUrl') {
    const baseResponse = responseContent as ReadSuccessResponseWithoutDynamics;
    const readDynamics = dynamics as ReadDynamics | undefined;

    return {
      ...baseResponse,
      requestId: activityLog.id, // put back requestId which is the same as the activity log id
      timestamp: readDynamics?.timestamp ?? new Date().toISOString(),
      metrics: readDynamics?.metrics,
    } as ReadSuccessResponse;
  }

  // Handle links endpoints (getLinks and extractLinks)
  if (path === 'links-getLinks' || path === 'links-extractLinks') {
    const baseResponse = responseContent as
      | LinksStableWithoutTree
      | LinksStableWithTree;
    const linksDynamics = dynamics as LinksDynamics | undefined;

    // Check if response has tree data
    const hasTree =
      typeof responseContent === 'object' &&
      responseContent !== null &&
      'tree' in responseContent &&
      responseContent.tree;

    if (!hasTree) {
      // No tree - simple reconstruction
      return {
        ...baseResponse,
        requestId: activityLog.id, // put back requestId which is the same as the activity log id
        timestamp: linksDynamics?.timestamp ?? new Date().toISOString(),
        metrics: linksDynamics?.metrics,
      } as LinksSuccessResponse;
    }

    // Has tree - need to restore tree dynamics
    const treeDynamics = linksDynamics?.treeDynamics;
    const strippedTree = (responseContent as LinksStableWithTree).tree;

    if (!strippedTree) {
      throw new Error('Expected tree in response content but found none');
    }

    const restoredTree = restoreTreeDynamics(strippedTree, treeDynamics);

    return {
      ...baseResponse,
      requestId: activityLog.id, // put back requestId which is the same as the activity log id
      tree: restoredTree,
      timestamp: linksDynamics?.timestamp ?? new Date().toISOString(),
      metrics: linksDynamics?.metrics,
    } as LinksSuccessResponse;
  }

  throw new Error(`Unknown path: ${path}`);
}

/**
 * Restores dynamic/temporal fields to a stripped LinksTree using extracted dynamics.
 *
 * **Restoration Logic:**
 * 1. **Root node restoration**:
 *    - Adds `lastUpdated` from `treeDynamics.root.lastUpdated`
 *    - Conditionally adds `lastVisited` from `treeDynamics.root.lastVisited` (only if exists)
 * 2. **Children restoration**: Recursively processes all child nodes via `restoreChildNode()`
 * 3. **Preserves exact structure**: Only adds fields that existed in the original response
 *
 * **Critical behavior:**
 * - `lastVisited` is only added when it exists in treeDynamics (optional field)
 * - This ensures the restored tree exactly matches the original structure
 * - Avoids adding `lastVisited: undefined` to nodes that were never visited
 *
 * @param strippedTree - Tree with only stable fields (no lastUpdated/lastVisited)
 * @param treeDynamics - Extracted dynamics containing timestamps and visited node metadata
 * @returns Complete LinksTree with all dynamic fields restored, or original if no dynamics
 */
function restoreTreeDynamics(
  strippedTree: LinksTreeWithoutDynamics,
  treeDynamics?: LinksDynamics['treeDynamics'],
): LinksTree | LinksTreeWithoutDynamics {
  if (!treeDynamics) {
    return strippedTree;
  }

  // Restore children first if present
  const restoredChildren: LinksTree[] | undefined = strippedTree.children
    ? strippedTree.children.map((child) =>
        restoreChildNode(child, treeDynamics),
      )
    : undefined;

  // Restore root dynamics with properly typed children
  const restoredRoot: LinksTree = {
    ...strippedTree,
    lastUpdated: treeDynamics.root.lastUpdated,
    children: restoredChildren,
  };

  // Only add lastVisited to root if it exists in treeDynamics
  if (treeDynamics.root.lastVisited !== undefined) {
    restoredRoot.lastVisited = treeDynamics.root.lastVisited;
  }

  return restoredRoot;
}

/**
 * Recursively restores dynamic fields to child nodes in the tree hierarchy.
 *
 * **Restoration Logic for Children:**
 * 1. **Recursive traversal**: Processes children depth-first before restoring current node
 * 2. **Common timestamp**: Uses `treeDynamics.childrenLastUpdated` for all children's `lastUpdated`
 *    - This is the most common timestamp extracted during dynamics extraction
 *    - Reduces storage by avoiding repetitive timestamp data
 * 3. **Visited node lookup**: Checks if node's URL exists in `treeDynamics.visitedNodes`
 *    - Only adds `lastVisited` when the URL is present in the visited nodes map
 *    - Preserves exact structure where unvisited nodes don't have `lastVisited` field
 *
 * **Critical data integrity:**
 * - Does NOT add `lastVisited` to unvisited nodes (avoids `lastVisited: undefined`)
 * - Ensures restored tree matches original response exactly
 * - Handles null values correctly (some visited nodes may have `lastVisited: null`)
 *
 * @param node - Stripped child node without dynamic fields
 * @param treeDynamics - Extracted dynamics with common child timestamp and visited node map
 * @returns Complete LinksTree node with all dynamic fields restored
 */
function restoreChildNode(
  node: LinksTreeWithoutDynamics,
  treeDynamics: NonNullable<LinksDynamics['treeDynamics']>,
): LinksTree {
  // Recursively restore children first
  const restoredChildren: LinksTree[] | undefined = node.children
    ? node.children.map((child) => restoreChildNode(child, treeDynamics))
    : undefined;

  // Build the base restored node with required fields
  const restoredNode: LinksTree = {
    ...node,
    lastUpdated: treeDynamics.childrenLastUpdated ?? '',
    children: restoredChildren,
  };

  // Only add lastVisited if this node's URL is in visitedNodes
  if (node.url && treeDynamics.visitedNodes?.[node.url] !== undefined) {
    restoredNode.lastVisited = treeDynamics.visitedNodes[node.url];
  }

  return restoredNode;
}

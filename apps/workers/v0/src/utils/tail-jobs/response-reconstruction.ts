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
    const strippedTree = (responseContent as { tree?: LinksTree }).tree;

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
 * Restores dynamic fields to tree nodes using the extracted treeDynamics
 * This reverses the stripLinksTreeDynamics function
 */
function restoreTreeDynamics(
  strippedTree: LinksTree,
  treeDynamics?: LinksDynamics['treeDynamics'],
): LinksTree {
  if (!treeDynamics) {
    return strippedTree;
  }

  // Restore root dynamics
  const restoredRoot: LinksTree = {
    ...strippedTree,
    lastUpdated: treeDynamics.root.lastUpdated,
    lastVisited: treeDynamics.root.lastVisited,
  };

  // Restore children dynamics if present
  if (strippedTree.children && strippedTree.children.length > 0) {
    restoredRoot.children = strippedTree.children.map((child) =>
      restoreChildNode(child, treeDynamics),
    );
  }

  return restoredRoot;
}

/**
 * Recursively restore dynamics to child nodes
 */
function restoreChildNode(
  node: LinksTree,
  treeDynamics: NonNullable<LinksDynamics['treeDynamics']>,
): LinksTree {
  const restoredNode: LinksTree = {
    ...node,
    // Use the most common timestamp as default for children
    lastUpdated: treeDynamics.childrenLastUpdated ?? '',
  };

  // Restore lastVisited if this node's URL is in visitedNodes
  if (node.url && treeDynamics.visitedNodes?.[node.url] !== undefined) {
    restoredNode.lastVisited = treeDynamics.visitedNodes[node.url];
  }

  // Recursively restore children
  if (node.children && node.children.length > 0) {
    restoredNode.children = node.children.map((child) =>
      restoreChildNode(child, treeDynamics),
    );
  }

  return restoredNode;
}

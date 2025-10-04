import type {
  LinksErrorResponse,
  LinksResponse,
  LinksSuccessResponse,
  LinksSuccessResponseWithTree,
  LinksTree,
} from '@deepcrawl/types/routers/links/types';
import type {
  ReadErrorResponse,
  ReadPostResponse,
  ReadStringResponse,
  ReadSuccessResponse,
} from '@deepcrawl/types/routers/read/types';
import {
  isLinksResponseWithoutTree,
  isLinksResponseWithTree,
} from '@/routers/links/links.processor';

export interface DynamicsBase {
  timestamp: string;
}

export interface LinksDynamics extends DynamicsBase {
  metrics?: LinksSuccessResponse['metrics'];
  treeDynamics?: {
    root: {
      lastUpdated: string;
      lastVisited?: string | null;
    };
    childrenLastUpdated?: string;
    visitedNodes?: { [url: string]: string | null };
  };
}

export interface ReadDynamics extends DynamicsBase {
  metrics?: ReadSuccessResponse['metrics'];
}

export type Dynamics = ReadDynamics | LinksDynamics | null;

type ReadSuccessResponseWithoutDynamics = Omit<
  ReadSuccessResponse,
  'metrics' | 'timestamp'
>;

type LinksSuccessResponseWithoutRootDynamics = Omit<
  LinksSuccessResponse,
  'timestamp' | 'metrics'
>;
type LinksStableWithoutTree = Omit<
  LinksSuccessResponseWithoutRootDynamics,
  'tree'
>;

export type AnyResponseTypes =
  | ReadStringResponse
  | ReadPostResponse
  | LinksResponse;

export interface ExtractedDynamicsForHashResult {
  responseForHash:
    | AnyResponseTypes
    | ReadSuccessResponseWithoutDynamics
    | LinksStableWithoutTree
    | LinksStableWithTree;
  dynamics: Dynamics;
}

// Discriminated union type

type SuccessGetMarkdown = {
  success: true;
  path: readonly ['read', 'getMarkdown'];
  response: ReadStringResponse;
};

type SuccessReadUrl = {
  success: true;
  path: readonly ['read', 'readUrl'];
  response: ReadSuccessResponse;
};

type SuccessLinks = {
  success: true;
  path: readonly ['links', 'getLinks'] | ['links', 'extractLinks'];
  response: LinksSuccessResponse;
};

type Failure = {
  success: false;
  path: readonly string[];
  response: ReadErrorResponse | LinksErrorResponse;
};

type ExtractParams =
  | SuccessGetMarkdown
  | SuccessReadUrl
  | SuccessLinks
  | Failure;

// single implementation can use the raw shape
export function extractDynamicsForHash(
  params:
    | ExtractParams
    | { success: boolean; path: readonly string[]; response: AnyResponseTypes }, // RAW overload
): ExtractedDynamicsForHashResult {
  if (!params.success) {
    return { responseForHash: params.response, dynamics: null };
  }

  switch (params.path[0]) {
    // read endpoints, readUrl only for now
    case 'read': {
      // gracfully handle other read paths if exists
      if (params.path[1] !== 'readUrl') {
        const fallback = params.response;
        return { responseForHash: fallback, dynamics: null };
      }

      // Only 'read/readUrl' is handled
      const {
        metrics,
        timestamp,
        requestId: _ignored, // ignored since it's not needed in dynamics
        ...rest
      } = params.response as ReadSuccessResponse;
      return {
        responseForHash: rest as ReadSuccessResponseWithoutDynamics,
        dynamics: { metrics, timestamp },
      };
    }

    // links endpoints, getLinks and extractLinks
    case 'links': {
      // gracfully handle other links paths if exists
      if (params.path[1] !== 'getLinks' && params.path[1] !== 'extractLinks') {
        const fallback = params.response;
        return { responseForHash: fallback, dynamics: null };
      }

      const r = params.response as LinksSuccessResponse;
      if (isLinksResponseWithoutTree(r)) {
        // links without tree: simple timestamp stripping
        const { timestamp, metrics, ...rest } = r;
        return {
          responseForHash: rest as LinksStableWithoutTree,
          dynamics: { timestamp, metrics },
        };
      }

      if (isLinksResponseWithTree(r)) {
        // links with tree: use stripped response content for consistent hashing
        const strippedResponse = stripLinksTreeDynamics(r);

        // extract tree dynamics
        const treeDynamics = extractTreeDynamics(r.tree);

        return {
          responseForHash: strippedResponse as LinksStableWithTree,
          dynamics: {
            timestamp: r.timestamp,
            metrics: r.metrics,
            treeDynamics,
          },
        };
      }

      // Fallback case (should not happen with proper discriminated union)
      throw new Error(
        'Invalid LinksSuccessResponse: neither tree nor non-tree variant',
      );
    }
    default: {
      const fallback = params.response;
      return { responseForHash: fallback, dynamics: null };
    }
  }
}

// Helpers mirrored from post-processing to avoid import cycles
function extractTreeDynamics(tree: LinksTree): LinksDynamics['treeDynamics'] {
  const treeDynamics: LinksDynamics['treeDynamics'] = {
    root: {
      lastUpdated: tree.lastUpdated,
      lastVisited: tree.lastVisited,
    },
  };

  const childTimestamps = new Set<string>();
  const visitedNodes: { [url: string]: string | null } = {};
  let mostCommonTimestamp: string | undefined;
  let timestampCount = 0;

  const queue: LinksTree[] = [];
  if (tree.children) {
    queue.push(...tree.children);
  }

  while (queue.length > 0) {
    const node = queue.shift();
    if (!node) {
      continue;
    }

    if (node.lastUpdated) {
      childTimestamps.add(node.lastUpdated);
    }

    if (node.lastVisited && node.url) {
      visitedNodes[node.url] = node.lastVisited;
    }

    if (node.children) {
      queue.push(...node.children);
    }
  }

  const timestampCounts: { [timestamp: string]: number } = {};
  for (const timestamp of childTimestamps) {
    timestampCounts[timestamp] = (timestampCounts[timestamp] || 0) + 1;
    if (timestampCounts[timestamp] > timestampCount) {
      timestampCount = timestampCounts[timestamp];
      mostCommonTimestamp = timestamp;
    }
  }

  if (mostCommonTimestamp && childTimestamps.size > 0) {
    treeDynamics.childrenLastUpdated = mostCommonTimestamp;
  }

  if (Object.keys(visitedNodes).length > 0) {
    treeDynamics.visitedNodes = visitedNodes;
  }

  return treeDynamics;
}

type LinksTreeWithoutDynamics = Omit<
  LinksTree,
  'lastVisited' | 'lastUpdated' | 'children'
> & { children?: LinksTreeWithoutDynamics[] };

type LinksStableWithTree = Omit<
  LinksSuccessResponseWithTree,
  'timestamp' | 'metrics' | 'tree'
> & {
  tree?: LinksTreeWithoutDynamics;
};

function stripLinksTreeDynamics(
  response: LinksSuccessResponseWithTree,
): LinksStableWithTree {
  // remove dynamics from each tree node if present; always drop root-level timestamp
  function sanitizeNode(node: LinksTree): LinksTree {
    const { children, ...rest } = node;
    const sanitized = {
      ...rest,
      lastVisited: undefined as unknown as LinksTree['lastVisited'],
      lastUpdated: undefined as unknown as LinksTree['lastUpdated'],
    } as LinksTree;

    if (children && Array.isArray(children)) {
      sanitized.children = children.map(sanitizeNode);
    }

    return sanitized;
  }

  const { timestamp: _ts, metrics: _metrics, ...rootRest } = response; // top-level timestamp and metrics are not needed for hashing

  const sanitizedTree = response.tree ? sanitizeNode(response.tree) : undefined;

  return {
    ...rootRest,
    tree: sanitizedTree,
  } as LinksStableWithTree;
}

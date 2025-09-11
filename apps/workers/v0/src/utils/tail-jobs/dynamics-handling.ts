import type {
  LinksErrorResponse,
  LinksResponse,
  LinksSuccessResponse,
} from '@deepcrawl/types/routers/links/types';
import type {
  ReadErrorResponse,
  ReadPostResponse,
  ReadStringResponse,
  ReadSuccessResponse,
} from '@deepcrawl/types/routers/read/types';

type ReadSuccessResponseWithoutMetrics = Omit<ReadSuccessResponse, 'metrics'>;

type LinksSuccessResponseWithoutRootDynamics = Omit<
  LinksSuccessResponse,
  'timestamp'
>;
type LinksStableWithoutTree = Omit<
  LinksSuccessResponseWithoutRootDynamics,
  'tree'
>;

interface LinksDynamics {
  timestamp: string;
  treeDynamics?: {
    root: {
      lastUpdated: string;
      lastVisited?: string | null;
    };
    childrenLastUpdated?: string;
    visitedNodes?: { [url: string]: string | null };
  };
}

type Dynamics =
  | { metrics?: ReadSuccessResponse['metrics'] }
  | { timestamp?: string }
  | LinksDynamics
  | null;

export type AnyResponseTypes =
  | ReadStringResponse
  | ReadPostResponse
  | LinksResponse;

export interface ExtractedDynamicsForHashResult {
  responseForHash:
    | AnyResponseTypes
    | ReadSuccessResponseWithoutMetrics
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
      const { metrics, ...rest } = params.response as ReadSuccessResponse;
      return {
        responseForHash: rest as ReadSuccessResponseWithoutMetrics,
        dynamics: { metrics },
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
        const { timestamp, ...rest } = r;
        return {
          responseForHash: rest as LinksStableWithoutTree,
          dynamics: { timestamp },
        };
      }

      // links with tree: use stripped response content for consistent hashing
      const strippedResponse = stripLinksTreeDynamics(r);

      // extract tree dynamics
      const treeDynamics = extractTreeDynamics(r.tree);

      return {
        responseForHash: strippedResponse as LinksStableWithTree,
        dynamics: { timestamp: r.timestamp, treeDynamics },
      };
    }
    default: {
      const fallback = params.response;
      return { responseForHash: fallback, dynamics: null };
    }
  }
}

// Helpers mirrored from post-processing to avoid import cycles
function extractTreeDynamics(
  tree: NonNullable<LinksSuccessResponse['tree']>,
): LinksDynamics['treeDynamics'] {
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

  const queue: NonNullable<LinksSuccessResponse['tree']>[] = [];
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
  'timestamp' | 'tree'
> & {
  tree?: LinksTreeWithoutDynamics;
};

function stripLinksTreeDynamics(
  response: LinksSuccessResponse,
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

  const { timestamp: _ts, ...rootRest } = response; // top-level timestamp is not needed for hashing

  const sanitizedTree = response.tree ? sanitizeNode(response.tree) : undefined;

  return {
    ...rootRest,
    tree: sanitizedTree,
  } as LinksStableWithTree;
}

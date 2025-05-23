import type { LinkService } from "@/services/link/link.service";
import type { ExtractedLinks, LinkExtractionOptions } from "@deepcrawl/types";
import type {
	SkippedLinks,
	SkippedUrl,
	Tree,
	Visited,
} from "@deepcrawl/types/routers/links";
import type { ScrapedData } from "@deepcrawl/types/services/cheerio";

import { PLATFORM_URLS } from "@/config/constants";

export function getTreeNameForUrl(url: string): string {
	try {
		const urlObj = new URL(url);
		const host = urlObj.hostname;
		const normalizedUrl = `${urlObj.protocol}//${host}`;
		const isPlatform = PLATFORM_URLS.some(
			(platform) => normalizedUrl === platform,
		);
		if (isPlatform) {
			const segments = urlObj.pathname.split("/").filter(Boolean);
			// For GitHub and other platforms, use org/repo if present, or org if only one segment
			if (segments.length >= 2) {
				return `${host}/${segments[0]}/${segments[1]}`;
			}
			if (segments.length === 1) {
				return `${host}/${segments[0]}`;
			}
			// Fallback: just host if not enough segments
			return host;
		}
		return host;
	} catch {
		return url;
	}
}

export function setToArrayOrUndefined(set: Set<string>) {
	return set.size > 0 ? Array.from(set) : undefined;
}

/**
 * Recursively counts the total number of nodes in a tree
 * @param node The tree node to count
 * @returns The total number of nodes in the tree (including the root)
 */
export function countTreeLinks(node: Tree | undefined): number {
	if (!node) {
		return 0;
	}

	// Count the current node
	let count = 1;

	// Recursively count all children
	if (node.children && node.children.length > 0) {
		for (const child of node.children) {
			count += countTreeLinks(child);
		}
	}

	return count;
}

/**
 * Recursively collects all URLs from a link tree into a Set for efficient lookup
 * @param node The tree node to collect URLs from
 * @param urlSet The Set to collect URLs into
 */
export function collectAllUrls(node: Tree, urlSet: Set<string>): void {
	// Add the current node's URL if it exists
	if (node.url) {
		urlSet.add(node.url);
	}

	// Recursively process children
	if (node.children && node.children.length > 0) {
		for (const child of node.children) {
			collectAllUrls(child, urlSet);
		}
	}
}

/**
 * Sorts node children to ensure folders (nodes with children) appear before leaf nodes
 * This implements a VS Code-like folder-first display
 * @param children The array of LinksTree nodes to sort
 * @param folderFirst Whether to group folders before leaf nodes
 * @param linksOrder How to order links within each folder: 'page' or 'alphabetical'
 * @returns The sorted array with folders first, then leaf nodes
 */
export function sortNodeChildren(
	children: Tree[],
	folderFirst = true,
	linksOrder: "page" | "alphabetical" = "page",
): Tree[] {
	if (!children || children.length <= 1) {
		return children;
	}

	// Non-folder-first behavior
	if (!folderFirst) {
		if (linksOrder === "alphabetical") {
			// Simple alphabetical sort by last path segment
			const cmp = (a: Tree, b: Tree) => {
				const seg = (n: Tree) =>
					n.url
						? new URL(n.url).pathname.split("/").filter(Boolean).pop() || ""
						: "";
				return seg(a).localeCompare(seg(b));
			};
			return [...children].sort(cmp);
		}
		return children;
	}

	// Folder-first grouping
	const folders = children.filter((c) =>
		Boolean(c.children && c.children.length > 0),
	);
	const leaves = children.filter((c) => !(c.children && c.children.length > 0));

	if (linksOrder === "alphabetical") {
		const cmp = (a: Tree, b: Tree) => {
			const seg = (n: Tree) =>
				n.url
					? new URL(n.url).pathname.split("/").filter(Boolean).pop() || ""
					: "";
			return seg(a).localeCompare(seg(b));
		};
		folders.sort(cmp);
		leaves.sort(cmp);
	}

	return [...folders, ...leaves];
}

/**
 * Builds a hierarchical parent-child tree from a flat list of internal URLs.
 *
 * @param internalLinks - Array of all unique internal URLs found.
 * @param rootUrl - The absolute root URL of the domain (e.g., "https://nextjs.org").
 * @param linkService - The LinkService instance to use for URL operations.
 * @param visitedUrls - Optional Set of visited URLs with timestamps.
 * @param metadataCache - Optional Record of scraped data for URLs.
 * @param extractedLinksMap - Optional Record of extracted links for URLs.
 * @param includeExtractedLinks - Optional flag to control whether to include extracted links in the tree.
 * @param folderFirst - Whether to group folders before leaf nodes
 * @param linksOrder - How to order links within each folder: 'page' or 'alphabetical'
 * @returns The root TreeLinks of the constructed hierarchy, or null if no links.
 */

interface BuildLinksTreeOptions {
	internalLinks: string[] | undefined;
	rootUrl: string;
	linkService: LinkService;
	visitedUrls?: Set<Visited>;
	metadataCache?: Record<string, ScrapedData["metadata"]>;
	extractedLinksMap?: Record<string, ExtractedLinks>;
	includeExtractedLinks?: boolean;
	folderFirst?: boolean;
	linksOrder?: "page" | "alphabetical";
}

export function buildLinksTree({
	internalLinks,
	rootUrl,
	linkService,
	visitedUrls,
	metadataCache,
	extractedLinksMap,
	includeExtractedLinks,
	folderFirst = true,
	linksOrder = "page",
}: BuildLinksTreeOptions): Tree | undefined {
	// Create a Map for faster lookups of visited URLs
	const visitedUrlsMap = new Map<string, string | null | undefined>();
	if (visitedUrls) {
		for (const visited of visitedUrls) {
			visitedUrlsMap.set(visited.url, visited.lastVisited || undefined);
		}
	}

	// Normalize the root URL for consistent comparison
	const normalizedRootUrl = linkService.normalizeUrl(rootUrl, rootUrl, true);

	// Current timestamp for lastUpdated
	const now = new Date().toISOString();

	const rootNode: Tree = {
		totalUrls: 1, // Start with 1 to count the root node itself
		executionTime: undefined,
		name: getTreeNameForUrl(normalizedRootUrl),
		url: normalizedRootUrl,
		rootUrl: normalizedRootUrl,
		lastVisited: visitedUrlsMap.get(normalizedRootUrl) || undefined,
		lastUpdated: now, // Set timestamp for root node creation
		metadata:
			metadataCache && normalizedRootUrl in metadataCache
				? metadataCache[normalizedRootUrl]
				: undefined,
		// Add extracted links if available and the flag is true
		extractedLinks:
			includeExtractedLinks &&
			extractedLinksMap &&
			normalizedRootUrl in extractedLinksMap
				? extractedLinksMap[normalizedRootUrl]
				: undefined,
		children: [],
	};

	// If no internal links, return just the root node
	if (!internalLinks || internalLinks.length === 0) {
		return rootNode;
	}

	// urlMap stores nodes already created, keyed by their FULL normalized URL
	const urlMap: Map<string, Tree> = new Map();
	urlMap.set(rootNode.url, rootNode);

	// --- 2. Sort Links for Efficient Processing (Optional but helpful) ---
	/* NO-PRESORTING. DEPRECATED AND SHOULD BE REMOVED IN FUTURE VERSIONS */
	// Sorting by length/depth helps ensure parent paths are likely processed before children
	// const sortedLinks = [...internalLinks].sort((a, b) => a.length - b.length);

	const sortedLinks = internalLinks;

	// --- 3. Process Each Link and Place in Tree ---
	for (const linkUrl of sortedLinks) {
		try {
			// Skip if already processed (shouldn't happen often with sorting, but good safeguard)
			if (urlMap.has(linkUrl)) {
				continue;
			}

			// --- a. Basic Validation and Normalization ---
			// Use the same normalization as used during extraction
			const normalizedLinkUrl = linkService.normalizeUrl(
				linkUrl,
				rootUrl,
				true,
			);

			// Skip if already processed (shouldn't happen often with sorting, but good safeguard)
			if (urlMap.has(normalizedLinkUrl)) {
				continue;
			}

			// --- b. Determine Path Segments Relative to Root ---
			const linkUrlObj = new URL(normalizedLinkUrl);
			const rootUrlObj = new URL(normalizedRootUrl);
			const segments: string[] = [];

			// Handle Subdomain differences e.g., https://sub.example.com -> https://example.com
			if (linkUrlObj.hostname !== rootUrlObj.hostname) {
				if (
					linkUrlObj.hostname.endsWith(
						`.${linkService.extractRootDomain(rootUrlObj.hostname)}`,
					)
				) {
					const subParts = linkUrlObj.hostname.split(".");
					const rootParts = rootUrlObj.hostname.split(".");
					// Prepend the differing subdomain parts
					segments.push(
						...subParts.slice(0, subParts.length - rootParts.length),
					);
				} else {
					// Different root domain entirely - should technically not be in internalLinks, but skip if it is
					console.warn(`Skipping link with different root domain: ${linkUrl}`);
					continue;
				}
			}

			// Add pathname segments
			segments.push(...linkUrlObj.pathname.split("/").filter(Boolean)); // filter(Boolean) removes empty strings

			// --- c. Traverse/Create Nodes ---
			let currentNode = rootNode;
			let currentPathUrl = normalizedRootUrl; // Start building path from root

			for (let i = 0; i < segments.length; i++) {
				const segment = segments[i];
				let nextNodeUrl: string;

				// Construct the URL for the *next* node level
				try {
					// Is this the first segment AND does it represent the subdomain part?
					if (
						i === 0 &&
						linkUrlObj.hostname !== rootUrlObj.hostname &&
						segment === linkUrlObj.hostname.split(".")[0]
					) {
						// Construct subdomain URL
						nextNodeUrl = `${linkUrlObj.protocol}//${segment}.${linkService.extractRootDomain(rootUrlObj.hostname)}`;
					} else {
						// Append path segment, avoiding double slashes
						const separator = currentPathUrl.endsWith("/") ? "" : "/";
						nextNodeUrl = `${currentPathUrl}${separator}${segment}`;
						// Re-normalize intermediate paths to handle potential trailing slashes etc.
						nextNodeUrl = linkService.normalizeUrl(nextNodeUrl, rootUrl, true);
					}
				} catch (e) {
					console.error(
						`Error building intermediate URL for segment '${segment}' from ${currentPathUrl}:`,
						e,
					);
					break; // Stop processing this link if URL construction fails
				}

				let nextNode = urlMap.get(nextNodeUrl);

				if (!nextNode) {
					// Node doesn't exist, create it
					nextNode = {
						name: segment,
						url: nextNodeUrl,
						lastVisited: visitedUrlsMap.get(nextNodeUrl) || undefined,
						lastUpdated: now, // Set timestamp for new node creation
						metadata:
							metadataCache && nextNodeUrl in metadataCache
								? metadataCache[nextNodeUrl]
								: undefined,
						// Add extracted links if available and the flag is true
						extractedLinks:
							includeExtractedLinks &&
							extractedLinksMap &&
							nextNodeUrl in extractedLinksMap
								? extractedLinksMap[nextNodeUrl]
								: undefined,
						children: [],
					};
					urlMap.set(nextNodeUrl, nextNode); // Add to map

					// Ensure the parent's children array exists
					if (!currentNode?.children) {
						currentNode.children = [];
					}
					currentNode?.children.push(nextNode);

					// Sort children per folderFirst/linksOrder
					if (currentNode?.children && currentNode.children.length > 1) {
						currentNode.children = sortNodeChildren(
							currentNode.children,
							folderFirst,
							linksOrder,
						);
					}
				}

				// Move to the next node for the next segment
				currentNode = nextNode;
				currentPathUrl = nextNode.url; // Update currentPathUrl for the next segment's base
			}
			// After loop, currentNode is the node for the original linkUrl
		} catch (error) {
			console.error(`Failed to process link: ${linkUrl}`, error);
			// Optionally add to a list of failed links
		}
	}

	// --- 4. Optional: Prune empty children arrays from leaf nodes ---
	pruneEmptyChildren(rootNode);

	// Final sort of all levels to ensure consistent folder-first display
	const sortQueue: Tree[] = [rootNode];
	while (sortQueue.length > 0) {
		const node = sortQueue.shift();
		if (node?.children && node.children.length > 1) {
			node.children = sortNodeChildren(node.children, folderFirst, linksOrder);
			sortQueue.push(...node.children);
		}
	}

	// Sort children at each level for consistent display
	if (rootNode.children && rootNode.children.length > 0) {
		rootNode.children = sortNodeChildren(
			rootNode.children,
			folderFirst,
			linksOrder,
		);
	}

	// Add the total count of URLs in the tree
	rootNode.totalUrls = countTreeLinks(rootNode);

	return rootNode;
}

/**
 * Merges new links into an existing tree structure.
 *
 * @param existingTree - The existing tree to merge into.
 * @param newLinks - Array of new internal links to merge.
 * @param rootUrl - The root URL of the site.
 * @param linkService - The LinkService instance to use.
 * @param visitedUrls - Optional Set of visited URLs with timestamps.
 * @param metadataCache - Optional Record of scraped metadata for URLs.
 * @param cleanedHtmlCache - Optional Record of cleaned HTML for URLs.
 * @param extractedLinksMap - Optional Record of extracted links for URLs.
 * @param includeExtractedLinks - Optional flag to control whether to include extracted links in the tree.
 * @param folderFirst - Whether to group folders before leaf nodes
 * @param linksOrder - How to order links within each folder: 'page' or 'alphabetical'
 * @returns The updated tree with new links merged in.
 */
interface MergeNewLinksIntoTreeOptions {
	existingTree: Tree;
	newLinks: string[];
	rootUrl: string;
	linkService: LinkService;
	visitedUrls?: Set<Visited>;
	metadataCache?: Record<string, ScrapedData["metadata"]>;
	cleanedHtmlCache?: Record<string, ScrapedData["cleanedHtml"]>;
	extractedLinksMap?: Record<string, ExtractedLinks>;
	includeExtractedLinks?: boolean;
	folderFirst?: boolean;
	linksOrder?: "page" | "alphabetical";
}

export async function mergeNewLinksIntoTree({
	existingTree,
	newLinks,
	rootUrl,
	linkService,
	visitedUrls,
	metadataCache,
	cleanedHtmlCache,
	extractedLinksMap,
	includeExtractedLinks,
	folderFirst = true,
	linksOrder = "page",
}: MergeNewLinksIntoTreeOptions): Promise<Tree> {
	// Create a Map for faster lookups of visited URLs
	const visitedUrlsMap = new Map<string, string | null | undefined>();
	if (visitedUrls) {
		for (const visited of visitedUrls) {
			visitedUrlsMap.set(visited.url, visited.lastVisited || undefined);
		}
	}

	// Current timestamp for lastUpdated
	const now = new Date().toISOString();

	// Create a new tree object with properties in the desired order
	const updatedTree: Tree = {
		totalUrls: existingTree.totalUrls || 1, // Start with 1 to count the root node itself
		executionTime: existingTree.executionTime || undefined,
		name:
			existingTree.name ||
			(existingTree.url ? getTreeNameForUrl(existingTree.url) : undefined),
		url: existingTree.url,
		rootUrl: existingTree.rootUrl,
		lastUpdated: now,
		lastVisited:
			existingTree.url && visitedUrlsMap.has(existingTree.url)
				? visitedUrlsMap.get(existingTree.url) || undefined
				: existingTree.lastVisited,
		children: existingTree.children,
		error: existingTree.error,
		metadata: existingTree.metadata,
		cleanedHtml: existingTree.cleanedHtml,
		extractedLinks: existingTree.extractedLinks,
		skippedUrls: existingTree.skippedUrls,
	};

	// Replace the existing tree with our updated version
	existingTree = updatedTree;

	// Ensure root node has a name property if it doesn't already
	if (existingTree.url && !existingTree.name) {
		existingTree.name = new URL(existingTree.url).hostname;
	}

	// Ensure root node has a rootUrl property if it doesn't already
	if (existingTree.url && !existingTree.rootUrl) {
		existingTree.rootUrl = new URL(existingTree.url).origin;
	}

	// Merge metadata and cleanedHtml to root node if available and not already present
	if (existingTree.url) {
		// Add metadata if available and not already present
		if (
			metadataCache &&
			existingTree.url in metadataCache &&
			!existingTree.metadata
		) {
			existingTree.metadata = metadataCache[existingTree.url];
		}

		// Add cleanedHtml if available in cleanedHtmlCache and not already present
		if (
			cleanedHtmlCache &&
			existingTree.url in cleanedHtmlCache &&
			!existingTree.cleanedHtml
		) {
			existingTree.cleanedHtml = cleanedHtmlCache[existingTree.url];
		}

		// Add extractedLinks if available and the flag is true
		if (
			includeExtractedLinks &&
			extractedLinksMap &&
			existingTree.url in extractedLinksMap
		) {
			existingTree.extractedLinks = extractedLinksMap[existingTree.url];
		}
	}

	// *IMPORTANT*: overwrite metadata and cleanedHtml to all nodes when there are no new links to merge - this is usually only used for returning metadata and cleanedHtml with existing tree not for KV updates
	if (
		newLinks.length === 0 &&
		existingTree.url &&
		(metadataCache || cleanedHtmlCache)
	) {
		const queue: Tree[] = [existingTree];
		while (queue.length > 0) {
			const node = queue.shift();
			if (node?.url) {
				// update metadata
				if (metadataCache === undefined) {
					node.metadata = metadataCache?.[node.url];
				}

				// update cleanedHtmlif available and not already present
				if (
					cleanedHtmlCache &&
					node.url in cleanedHtmlCache &&
					!node.cleanedHtml
				) {
					node.cleanedHtml = cleanedHtmlCache[node.url];
				}

				// update extractedLinks if available and the flag is true
				if (
					includeExtractedLinks &&
					extractedLinksMap &&
					node.url in extractedLinksMap
				) {
					node.extractedLinks = extractedLinksMap[node.url];
				}
			}
			if (node?.children) {
				queue.push(...node.children);
			}
		}
	}

	// 1. Collect all URLs currently in the existingTree
	const existingUrls = new Set<string>();
	collectAllUrls(existingTree, existingUrls); // Use your existing helper

	// 2. Identify only the links that are genuinely new
	const newLinksToMerge = newLinks.filter((link) => {
		try {
			// Normalize the link the same way buildLinksTree does before checking
			const normalized = linkService.normalizeUrl(link, rootUrl, true);
			return !existingUrls.has(normalized);
		} catch {
			console.warn(
				`Skipping potentially invalid link during merge check: ${link}`,
			);
			return false; // Skip invalid URLs
		}
	});

	if (newLinksToMerge.length === 0) {
		return existingTree; // No changes needed
	}

	// 3. Create a map for quick node lookup from the existing tree (like in buildLinksTree)
	const urlMap: Map<string, Tree> = new Map();
	const queue: Tree[] = [existingTree];
	while (queue.length > 0) {
		const node = queue.shift();
		if (node?.url) {
			// Should always have url except maybe hypothetical root?
			urlMap.set(node.url, node);

			// Update existing nodes with lastVisited if available
			if (visitedUrlsMap.has(node.url)) {
				node.lastVisited = visitedUrlsMap.get(node.url) || undefined;
			}

			// Add metadata if available in metadataCache and not already present
			if (!node.metadata && metadataCache && node.url in metadataCache) {
				const nodeMetadata = metadataCache[node.url];
				if (nodeMetadata) {
					node.metadata = nodeMetadata;
				}
			}

			// Add cleanedHtml if available in cleanedHtmlCache
			if (cleanedHtmlCache && node.url in cleanedHtmlCache) {
				node.cleanedHtml = cleanedHtmlCache[node.url];
			}

			// Add extractedLinks if available and the flag is true
			if (
				includeExtractedLinks &&
				extractedLinksMap &&
				node.url in extractedLinksMap
			) {
				node.extractedLinks = extractedLinksMap[node.url];
			}
		}
		if (node?.children) {
			queue.push(...node.children);
		}
	}

	// 4. Process each *new* link and insert it (similar logic to buildLinksTree step 3)
	/* NO-PRESORTING. DEPRECATED AND SHOULD BE REMOVED IN FUTURE VERSIONS */
	// const sortedNewLinks = [...newLinksToMerge].sort(
	//   (a, b) => a.length - b.length,
	// );
	const sortedNewLinks = newLinksToMerge;

	const normalizedRootUrl = linkService.normalizeUrl(rootUrl, rootUrl, true); // Get normalized root once

	for (const linkUrl of sortedNewLinks) {
		try {
			const normalizedLinkUrl = linkService.normalizeUrl(
				linkUrl,
				rootUrl,
				true,
			);

			// Double-check it's not somehow already added in this merge batch
			if (urlMap.has(normalizedLinkUrl)) {
				continue;
			}

			// Determine segments relative to root (copy/adapt logic from buildLinksTree)
			const linkUrlObj = new URL(normalizedLinkUrl);
			const rootUrlObj = new URL(normalizedRootUrl);
			const segments: string[] = [];
			// --- Add subdomain segment logic from buildLinksTree ---
			if (linkUrlObj.hostname !== rootUrlObj.hostname) {
				if (
					linkUrlObj.hostname.endsWith(
						`.${linkService.extractRootDomain(rootUrlObj.hostname)}`,
					)
				) {
					const subParts = linkUrlObj.hostname.split(".");
					const rootParts = rootUrlObj.hostname.split(".");
					// Prepend the differing subdomain parts
					segments.push(
						...subParts.slice(0, subParts.length - rootParts.length),
					);
				} else {
					// Different root domain entirely - should technically not be in internalLinks, but skip if it is
					continue;
				}
			}
			// --- Add path segment logic from buildLinksTree ---
			segments.push(...linkUrlObj.pathname.split("/").filter(Boolean));

			// Traverse/Create Nodes, starting from the existing root
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			let currentNode = urlMap.get(normalizedRootUrl)!; // Should exist
			let currentPathUrl = normalizedRootUrl; // Start building path from root

			for (let i = 0; i < segments.length; i++) {
				const segment = segments[i];
				let nextNodeUrl: string;

				// --- Construct nextNodeUrl logic (copy/adapt from buildLinksTree) ---
				try {
					if (
						i === 0 &&
						linkUrlObj.hostname !== rootUrlObj.hostname &&
						segment === linkUrlObj.hostname.split(".")[0]
					) {
						// Construct subdomain URL
						nextNodeUrl = `${linkUrlObj.protocol}//${segment}.${linkService.extractRootDomain(rootUrlObj.hostname)}`;
					} else {
						// Append path segment, avoiding double slashes
						const separator = currentPathUrl.endsWith("/") ? "" : "/";
						nextNodeUrl = `${currentPathUrl}${separator}${segment}`;
						nextNodeUrl = linkService.normalizeUrl(nextNodeUrl, rootUrl, true);
					}
				} catch (e) {
					console.error(
						`Error building intermediate URL for segment '${segment}' from ${currentPathUrl}:`,
						e,
					);
					break;
				}

				let nextNode = urlMap.get(nextNodeUrl);

				if (!nextNode) {
					// Create new node *and add it to the parent*
					nextNode = {
						name: segment,
						url: nextNodeUrl,
						lastVisited: visitedUrlsMap.get(nextNodeUrl) || undefined,
						lastUpdated: now, // Set timestamp for new node creation during merge
						metadata:
							metadataCache && nextNodeUrl in metadataCache
								? metadataCache[nextNodeUrl]
								: undefined,
						cleanedHtml:
							cleanedHtmlCache && nextNodeUrl in cleanedHtmlCache
								? cleanedHtmlCache[nextNodeUrl]
								: undefined,
						// Add extracted links if available and the flag is true
						extractedLinks:
							includeExtractedLinks &&
							extractedLinksMap &&
							nextNodeUrl in extractedLinksMap
								? extractedLinksMap[nextNodeUrl]
								: undefined,
						children: [],
					};

					urlMap.set(nextNodeUrl, nextNode); // Add to map

					if (!currentNode?.children) {
						currentNode.children = [];
					}
					currentNode?.children.push(nextNode);

					// Sort children per folderFirst/linksOrder
					if (currentNode?.children && currentNode.children.length > 1) {
						currentNode.children = sortNodeChildren(
							currentNode.children,
							folderFirst,
							linksOrder,
						);
					}
				}

				currentNode = nextNode;
				currentPathUrl = nextNode.url;
			}
		} catch (error) {
			console.error(`Failed to merge link: ${linkUrl}`, error);
		}
	}

	// 5. Optional: Prune empty children arrays (can reuse prune logic if needed)
	pruneEmptyChildren(existingTree); // Assuming pruneEmptyChildren is accessible

	// Final sort of all levels to ensure consistent folder-first display
	const mergeSortQueue: Tree[] = [existingTree];
	while (mergeSortQueue.length > 0) {
		const node = mergeSortQueue.shift();
		if (node?.children && node.children.length > 1) {
			node.children = sortNodeChildren(node.children, folderFirst, linksOrder);
			mergeSortQueue.push(...node.children);
		}
	}

	// Sort children at each level for consistent display
	if (existingTree.children && existingTree.children.length > 0) {
		existingTree.children = sortNodeChildren(
			existingTree.children,
			folderFirst,
			linksOrder,
		);
	}

	// Add the total count of URLs in the tree
	existingTree.totalUrls = countTreeLinks(existingTree);

	return existingTree;
}

/**
 * Processes extractedLinks in a tree based on the linksFromTarget flag and link options
 *
 * @param tree - The tree to process
 * @param includeExtractedLinks - Whether to include extracted links in the tree
 * @param linkOptions - Options for which types of links to include
 * @returns The processed tree with extractedLinks conditionally filtered
 */
export function processExtractedLinksInTree(
	tree: Tree | undefined,
	includeExtractedLinks: boolean,
	linkOptions?: LinkExtractionOptions,
): Tree | undefined {
	if (!tree) {
		return undefined;
	}

	// Create a queue for breadth-first traversal
	const queue: Tree[] = [tree];

	while (queue.length > 0) {
		const node = queue.shift();
		if (!node) continue;

		// Process extractedLinks based on options
		if (node.extractedLinks) {
			if (!includeExtractedLinks) {
				// If linksFromTarget is false, remove all extracted links
				node.extractedLinks = undefined;
			} else if (linkOptions) {
				// If linksFromTarget is true but some link types are disabled,
				// selectively filter the extractedLinks
				const filteredLinks: ExtractedLinks = {};

				// Always include internal links
				filteredLinks.internal = node.extractedLinks.internal;

				// Only include external links if specified
				if (linkOptions.includeExternal && node.extractedLinks.external) {
					filteredLinks.external = node.extractedLinks.external;
				}

				// Only include media links if specified
				if (linkOptions.includeMedia && node.extractedLinks.media) {
					filteredLinks.media = node.extractedLinks.media;
				}

				// Replace with filtered links or undefined if empty
				const hasLinks = Object.keys(filteredLinks).length > 0;
				node.extractedLinks = hasLinks ? filteredLinks : undefined;
			}
		}

		// Add children to the queue
		if (node.children && node.children.length > 0) {
			queue.push(...node.children);
		}
	}

	return tree;
}

/**
 * Extracts all visited URLs from a LinksTree
 * @param tree The LinksTree to extract visited URLs from
 * @returns A Set of objects containing url and lastVisited timestamp
 */
export function extractVisitedUrlsFromTree(
	tree: Tree,
): Set<{ url: string; lastVisited: string }> {
	const visitedUrls = new Set<{ url: string; lastVisited: string }>();

	// Use BFS to traverse the tree
	const queue: Tree[] = [tree];
	while (queue.length > 0) {
		const node = queue.shift();
		if (node?.url && node.lastVisited) {
			visitedUrls.add({
				url: node.url,
				lastVisited: node.lastVisited,
			});
		}
		if (node?.children) {
			queue.push(...node.children);
		}
	}

	return visitedUrls;
}

/**
 * Categorize skipped URLs into internal, external, and media
 * @param skippedUrls Map of URLs with reasons they were skipped
 * @param rootUrl The root URL to determine if a URL is internal
 * @param existingChildren Optional existing tree children to check against
 * @returns Object with categorized skipped URLs
 */
export function categorizeSkippedUrls(
	skippedUrlsMap: Map<string, string>,
	rootUrl: string,
	children?: Tree[],
): SkippedLinks {
	// Initialize the categorized structure
	const categorized: SkippedLinks = {};

	// Filter out URLs that are already in children with errors
	const filteredEntries = Array.from(skippedUrlsMap.entries()).filter(
		([url]) => !children?.some((child) => child.url === url && child.error),
	);

	// Arrays to hold different categories
	const internal: SkippedUrl[] = [];
	const external: SkippedUrl[] = [];
	const mediaImages: SkippedUrl[] = [];
	const mediaVideos: SkippedUrl[] = [];
	const mediaDocuments: SkippedUrl[] = [];
	const other: SkippedUrl[] = [];

	let rootHostname: string | undefined;
	try {
		rootHostname = new URL(rootUrl).hostname;
	} catch {
		console.error(
			"Invalid rootUrl provided to categorizeSkippedUrls:",
			rootUrl,
		);
		// Cannot determine internal/external without a valid root URL
	}

	// Process each skipped URL
	for (const [url, reason] of filteredEntries) {
		// Skip undefined or null URLs
		if (!url) continue;

		// Create the base skipped URL object
		const skippedUrl: SkippedUrl = { url, reason };

		// Categorize based on URL patterns and reason
		if (reason.includes("Media URL (image)")) {
			mediaImages.push(skippedUrl);
		} else if (reason.includes("Media URL (video)")) {
			mediaVideos.push(skippedUrl);
		} else if (reason.includes("Media URL (document)")) {
			mediaDocuments.push(skippedUrl);
		} else if (
			url.endsWith(".jpg") ||
			url.endsWith(".jpeg") ||
			url.endsWith(".png") ||
			url.endsWith(".gif") ||
			url.endsWith(".svg") ||
			url.includes("/image") ||
			url.includes("/img/")
		) {
			mediaImages.push(skippedUrl);
		} else if (
			url.endsWith(".mp4") ||
			url.endsWith(".webm") ||
			url.endsWith(".avi") ||
			url.endsWith(".mov")
		) {
			mediaVideos.push(skippedUrl);
		} else if (
			url.endsWith(".pdf") ||
			url.endsWith(".doc") ||
			url.endsWith(".docx") ||
			url.endsWith(".xls") ||
			url.endsWith(".xlsx") ||
			url.endsWith(".ppt") ||
			url.endsWith(".pptx")
		) {
			mediaDocuments.push(skippedUrl);
		} else {
			// Determine if internal or external based on domain comparison
			let isInternal = false;
			if (rootHostname) {
				try {
					const skippedHostname = new URL(url).hostname;
					// Check if hostnames match or if skipped is a subdomain of root
					if (
						skippedHostname === rootHostname ||
						skippedHostname.endsWith(`.${rootHostname}`)
					) {
						isInternal = true;
					}
				} catch {
					// If URL is invalid, treat as external (or could be 'other')
					console.warn(`Invalid URL encountered in skippedUrls: ${url}`);
				}
			}
			if (isInternal) {
				internal.push(skippedUrl);
			} else {
				external.push(skippedUrl); // Defaults to external if rootHostname is invalid or URL is invalid/different domain
			}
		}
	}

	// Add non-empty categories to the result
	if (internal.length > 0) categorized.internal = internal;
	if (external.length > 0) categorized.external = external;

	// Add media if any media types exist
	if (
		mediaImages.length > 0 ||
		mediaVideos.length > 0 ||
		mediaDocuments.length > 0
	) {
		categorized.media = {};
		if (mediaImages.length > 0) categorized.media.images = mediaImages;
		if (mediaVideos.length > 0) categorized.media.videos = mediaVideos;
		if (mediaDocuments.length > 0) categorized.media.documents = mediaDocuments;
	}

	// Add other category if needed
	if (other.length > 0) categorized.other = other;

	return categorized;
}

function pruneEmptyChildren(node: Tree) {
	if (node.children) {
		if (node.children.length === 0) {
			node.children = undefined; // Remove empty array for leaf nodes
		} else {
			node.children.forEach(pruneEmptyChildren); // Recurse
		}
	}
}

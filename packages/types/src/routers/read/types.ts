import type { ScrapedData } from "@/services/cheerio";
import { MetadataOptionsSchema } from "@/services/metadata";
import z from "zod";

export const readOptionsSchema = z.object({
	/**
	 * The URL to scrape.
	 * Must be a valid URL string.
	 */
	url: z.string(),

	/**
	 * Whether to extract metadata from the page.
	 * Default: true
	 */
	// default true if not set
	metadata: z.preprocess(
		(val) => val !== "false" && val !== false,
		z.boolean().optional(),
	),

	/**
	 * Whether to extract markdown from the page.
	 * Default: true
	 */
	// default true if not set
	markdown: z.preprocess(
		(val) => val !== "false" && val !== false,
		z.boolean().optional(),
	),

	/**
	 * Whether to return cleaned HTML.
	 * Default: true
	 */
	cleanedHtml: z.preprocess(
		(val) => val !== "false" && val !== false,
		z.boolean().optional(),
	),

	/**
	 * Whether to fetch and parse robots.txt.
	 * Default: false
	 */
	robots: z.preprocess(
		(val) => val === "true" || val === true,
		z.boolean().optional(),
	),

	/**
	 * Whether to return raw HTML.
	 * Default: false
	 */
	rawHtml: z.preprocess(
		(val) => val !== "false" && val !== false,
		z.boolean().optional(),
	),

	/**
	 * Options for metadata extraction.
	 * Controls how metadata like title, description, etc. are extracted.
	 */
	metadataOptions: MetadataOptionsSchema.optional(),

	/** DEPRECATED: AS WE ARE NOT USING HTMLREWRITE FOR CLEANING THE HTML FOR NOW, MAY BE REUSED THIS IN THE FUTURE
	 * Options for HTML cleaning.
	 * Controls how HTML is sanitized and cleaned.
	 */
	// cleanedHtmlOptions: HTMLCleaningOptionsSchema.optional(),
});

export type ReadOptions = z.infer<typeof readOptionsSchema>;

export type ReadResponseBase = {
	success: boolean;
	targetUrl: string;
};

export type ReadErrorResponse = ReadResponseBase & {
	success: false;
	error: string;
};

export type ReadSuccessResponse = ReadResponseBase &
	Omit<ScrapedData, "rawHtml"> & {
		success: true;
		cached: boolean;
		markdown?: string;
		rawHtml?: string;
		metrics?: {
			readableDuration: string;
			duration: number;
			startTime: number;
			endTime: number;
		};
	};

export type ReadStringResponse = string;

export type ReadPostResponse = ReadSuccessResponse | ReadErrorResponse;

export type ReadResponse = ReadStringResponse | ReadPostResponse;

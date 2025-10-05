import { DeepcrawlApp } from 'deepcrawl';

export const DEEPCRAWL_API_KEY = process.env.DEEPCRAWL_API_KEY as string;

export const deepcrawlClient = new DeepcrawlApp({ apiKey: DEEPCRAWL_API_KEY });

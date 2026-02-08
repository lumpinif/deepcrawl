import { resolveBrandName } from '@deepcrawl/runtime';

// Single source of truth for visible branding in the dashboard app.
export const brandName = resolveBrandName(process.env.NEXT_PUBLIC_BRAND_NAME);

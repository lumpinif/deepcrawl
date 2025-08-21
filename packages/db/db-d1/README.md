# @deepcrawl/db-d1

**D1 database** package for DeepCrawl data preservation using Cloudflare D1 and Drizzle ORM.

## Features

- ✅ **Cloudflare D1 Database** - Edge-optimized SQLite database
- ✅ **Drizzle ORM** - Type-safe database operations and migrations
- ✅ **Data Preservation** - Long-term storage of crawled content
- ✅ **Edge Performance** - Ultra-fast access from Cloudflare Workers
- ✅ **Development Tools** - Drizzle Studio for database visualization

## Database Schema

### **Core Tables**
- `crawl_results` - Stored web scraping results
- `extracted_links` - Link relationships and metadata
- `content_cache` - Cached processed content
- `metadata_index` - Searchable content metadata

### **Features**
- **Content Archiving** - Long-term storage of scraped web content
- **Link Analysis** - Relationship mapping between URLs
- **Metadata Search** - Indexed content for fast retrieval
- **Cache Management** - Intelligent content caching strategies

## Development Commands

```bash
# Navigate to the package directory
cd packages/db/db-d1

# Create new D1 database
pnpm db:create

# Generate database migrations
pnpm db:generate

# Push database schema changes
pnpm db:push

# Run Drizzle Studio (database GUI)
pnpm db:studio

# Run database migrations
pnpm db:migrate

# Full database sync (generate + migrate)
pnpm db:sync
```

## Configuration

The D1 database is configured for use with:

- **Cloudflare D1** - Edge-distributed SQLite database
- **DeepCrawl Worker** - Primary consumer of stored data
- **Environment Variables** - D1 binding configuration
- **Production Deployment** - Automatic replication across edge locations

## Usage

```typescript
import { db } from '@deepcrawl/db-d1';
import { crawlResults, extractedLinks } from '@deepcrawl/db-d1/schema';

// Store crawl result
const result = await db.insert(crawlResults).values({
  url: 'https://example.com',
  content: 'Processed content...',
  metadata: { title: 'Example Page' },
  timestamp: new Date(),
}).returning();

// Query stored content
const storedContent = await db
  .select()
  .from(crawlResults)
  .where(eq(crawlResults.url, 'https://example.com'));
```

## Schema Design

The D1 schema is optimized for:

- **Fast Retrieval** - Indexed content for quick access
- **Content Relationships** - Link structure preservation
- **Metadata Search** - Searchable content attributes
- **Cache Efficiency** - Optimized storage patterns
- **Edge Performance** - Minimal query complexity

## Architecture Benefits

### **Edge Performance**
- **Global Distribution** - Data replicated across Cloudflare's edge
- **Low Latency** - Sub-millisecond database queries
- **Auto-scaling** - Handles traffic spikes automatically

### **Developer Experience**
- **Type Safety** - Full TypeScript integration with Drizzle
- **Local Development** - Works with local D1 instances
- **Migration System** - Version-controlled schema evolution

### **Cost Efficiency**
- **Serverless Billing** - Pay only for operations performed
- **Edge Caching** - Reduced database load through intelligent caching
- **Resource Optimization** - Efficient storage and query patterns

## Development Workflow

1. **Schema Design** - Define tables in `src/db/schema.ts`
2. **Generate Migration** - Run `pnpm db:generate`
3. **Local Testing** - Use local D1 instance for development
4. **Deploy Schema** - Push to production D1 database
5. **Monitor Performance** - Use Cloudflare analytics for optimization
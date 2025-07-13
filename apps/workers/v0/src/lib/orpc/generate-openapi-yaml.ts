import { writeFileSync } from 'node:fs';
import { contract } from '@deepcrawl/contracts';
import { OpenAPIGenerator } from '@orpc/openapi';
import * as yaml from 'js-yaml';
import {
  OpenAPISpecGenerateOptions,
  SchemaConverters,
} from './openapi.handler';

// NOTE: REQUIRE COMMENT OUT env FROM cloudflare:workers IN openapi.handler.ts TO GENERATE OPENAPI YAML

const openAPIGenerator = new OpenAPIGenerator({
  schemaConverters: SchemaConverters,
});

async function generateOpenAPI() {
  const specFromContract = await openAPIGenerator.generate(contract, {
    ...OpenAPISpecGenerateOptions,
  });

  const yamlString = yaml.dump(specFromContract);

  // Save the YAML string to a file
  writeFileSync('openapi_orpc.yaml', yamlString);

  console.log('✅ OpenAPI YAML generated successfully at openapi_orpc.yaml');
}

generateOpenAPI().catch((error) => {
  console.error('❌ Failed to generate OpenAPI YAML:', error);
  process.exit(1);
});

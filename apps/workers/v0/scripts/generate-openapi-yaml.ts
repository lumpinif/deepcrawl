import { writeFileSync } from 'node:fs';
import { contract } from '@deepcrawl/contracts';
import {
  OpenAPIGenerator,
  type OpenAPIGeneratorGenerateOptions,
} from '@orpc/openapi';
import * as yaml from 'js-yaml';
import {
  OpenAPISpecBaseOptions,
  SchemaConverters,
} from '@/lib/openapi/configs';

const openAPIGenerator = new OpenAPIGenerator({
  schemaConverters: SchemaConverters,
});

const OpenAPISpecGenOptions = {
  ...OpenAPISpecBaseOptions,
} satisfies OpenAPIGeneratorGenerateOptions;

async function generateOpenAPI() {
  const specFromContract = await openAPIGenerator.generate(contract, {
    ...OpenAPISpecGenOptions,
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

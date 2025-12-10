// sanity.config.ts
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {apiVersion, dataset, projectId} from './env'
import {schema} from './schemaTypes'    // <--- use `schema` (matches your file)
import {structure} from './structure'

export default defineConfig({
  name: 'default',
  title: 'tv10-news',

  projectId,
  dataset,
  apiVersion,

  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion })
  ],

  // `schema` already has shape { types: SchemaTypeDefinition[] }
  schema,
})

import { type SchemaTypeDefinition } from 'sanity'

// We assume your actual schema files are inside a 'schemas' folder
// If your folder is named differently, adjust these imports
import post from './schemaTypes/post'
// import category from './schemas/category'
// import author from './schemas/author' // Uncomment if you have this
// import blockContent from './schemas/blockContent' // Uncomment if you have this

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    post,
    // category,
    // author,
    // blockContent,
  ],
}
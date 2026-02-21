import { type SchemaTypeDefinition } from 'sanity'

// Import your schemas from the same folder
import post from './post'
import webStory from './webStory' 
// import category from './category' // Uncomment if you have this file

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    post,
    webStory,
    // category,
  ],
}
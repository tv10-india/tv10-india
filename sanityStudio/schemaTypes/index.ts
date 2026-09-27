import { type SchemaTypeDefinition } from 'sanity'

// Import your schemas from the same folder
import post from './post'
import webStory from './webStory'
import advertisement from './advertisement'
import author from './author'
import editorialEvent from './editorialEvent'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    post,
    webStory,
    advertisement,
    author,
    // Object type, not a document — it only exists inside post.editorialHistory,
    // but it still has to be registered for the array to resolve it.
    editorialEvent,
  ],
}

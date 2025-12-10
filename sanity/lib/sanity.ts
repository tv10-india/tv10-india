import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'

// 1. HARDCODED CONFIGURATION (Bypasses the missing file error)
export const projectId = 'uh81euwc'
export const dataset = 'production'
export const apiVersion = '2024-01-01'

// 2. CREATE CLIENT
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, 
})

// 3. HELPER FOR IMAGES
const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}
import {createClient} from '@sanity/client'

export const sanityClient = createClient({
  projectId: 'xmf58cl9',
  dataset: 'production',
  apiVersion: '2026-09-09',
  useCdn: true,
})
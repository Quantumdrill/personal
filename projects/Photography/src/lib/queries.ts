import {sanityClient} from './sanity'


export async function getAlbums() {
  const query = `
    *[_type == "album"]{
      _id,
      name,
      comment,

      sets[]->{
        _id,
        name,
        time,
        location,
        comment,

        tags[]->{
          _id,
          name
        },

        photos[]{
          comment,
          isThumbnail,

          asset->{
            _id,
            url,
            metadata {
              dimensions
            }
          }
        }
      }
    }
  `

  return await sanityClient.fetch(query)
}


export async function getSets() {
  const query = `
    *[_type == "set"]{
      _id,
      name,
      time,
      location,
      comment,

      tags[]->{
        _id,
        name
      },

      photos[]{
        comment,
        isThumbnail,

        asset->{
          _id,
          url,
          metadata {
            dimensions
          }
        }
      }
    }
  `

  return await sanityClient.fetch(query)
}


export async function getSet(id: string) {
  const query = `
    *[_type == "set" && _id == $id][0]{
      _id,
      name,
      time,
      location,
      comment,

      tags[]->{
        _id,
        name
      },

      photos[]{
        comment,
        isThumbnail,

        asset->{
          _id,
          url,
          metadata {
            dimensions
          }
        }
      }
    }
  `

  return await sanityClient.fetch(query, { id })
}


export async function getTags() {
  const query = `
    *[_type == "tag"]{
      _id,
      name
    }
  `

  return await sanityClient.fetch(query)
}


export async function getImages() {
  const query = `
    *[_type == "sanity.imageAsset"]{
      _id,
      originalFilename,
      url,
      metadata {
        dimensions
      }
    }
  `

  return await sanityClient.fetch(query)
}

export async function getTagsWithSets() {
    const query = `
      *[_type == "tag"]{
        _id,
        name,
  
        "sets": *[
          _type == "set" &&
          references(^._id)
        ]{
          _id,
          name,
          time,
          location,
          comment,
  
          photos[]{
            comment,
            isThumbnail,
            asset->{
              _id,
              url
            }
          }
        }
      }
    `
  
    return sanityClient.fetch(query)
  }
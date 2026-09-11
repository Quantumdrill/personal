<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { urlFor } from '../lib/image'

const props = defineProps({
  set: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['photoenter', 'photoleave'])
const router = useRouter()

const thumbnail = computed(() => {
  const photos = props.set.photos
  if (!photos || photos.length === 0) return null

  const marked = photos.find((photo) => photo.isThumbnail === true)
  if (marked) return marked

  return photos[0]
})

const thumbnailDimensions = computed(() => {
  return thumbnail.value?.asset?.metadata?.dimensions
})

const isPortrait = computed(() => {
  const dimensions = thumbnailDimensions.value
  return dimensions ? dimensions.height > dimensions.width : false
})

const thumbnailSrc = computed(() => {
  if (!thumbnail.value) return ''

  const image = urlFor(thumbnail.value).auto('format').quality(85)
  return isPortrait.value ? image.height(640).url() : image.width(640).url()
})

const thumbnailSrcSet = computed(() => {
  if (!thumbnail.value) return ''

  const ratio = thumbnailDimensions.value?.aspectRatio ?? 1
  const sizes = [360, 640, 960]

  return sizes
    .map((size) => {
      const image = urlFor(thumbnail.value).auto('format').quality(85)

      if (isPortrait.value) {
        const resultingWidth = Math.round(size * ratio)
        return `${image.height(size).url()} ${resultingWidth}w`
      }

      return `${image.width(size).url()} ${size}w`
    })
    .join(', ')
})

const thumbnailSizes = computed(() => {
  if (!isPortrait.value) return '17vw'

  const ratio = thumbnailDimensions.value?.aspectRatio ?? 1
  return `${Math.round(17 * ratio * 100) / 100}vw`
})

function enterPhoto(event) {
  emit('photoenter', event.currentTarget)
}

function leavePhoto(event) {
  emit('photoleave', event)
}

function openSet() {
  router.push(`/set/${props.set._id}`)
}
</script>

<template>
  <div class="photoCard">
    <span class="photoCardDot photoCardDotTL"></span>
    <span class="photoCardDot photoCardDotTR"></span>
    <span class="photoCardDot photoCardDotBL"></span>
    <span class="photoCardDot photoCardDotBR"></span>
    <img
      v-if="thumbnail && thumbnail.asset"
      class="photoCardImage"
      v-bind:src="thumbnailSrc"
      v-bind:srcset="thumbnailSrcSet"
      v-bind:sizes="thumbnailSizes"
      v-bind:width="thumbnailDimensions && thumbnailDimensions.width"
      v-bind:height="thumbnailDimensions && thumbnailDimensions.height"
      v-bind:alt="set.name"
      v-on:mouseenter="enterPhoto"
      v-on:mouseleave="leavePhoto"
      v-on:click="openSet"
    />
  </div>
</template>

<style scoped>
.photoCard {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc((100% - 3 * var(--gallery-gap)) / 4);
  aspect-ratio: 1;
  padding: 0.8vw;
  background: rgba(0, 0, 0, 0.1);
}

.photoCardDot {
  position: absolute;
  width: 2px;
  height: 2px;
  background: rgb(255 255 255 / 20%);
  pointer-events: none;
}

.photoCardDotTL {
  top: 0;
  left: 0;
}

.photoCardDotTR {
  top: 0;
  right: 0;
}

.photoCardDotBL {
  bottom: 0;
  left: 0;
}

.photoCardDotBR {
  bottom: 0;
  right: 0;
}

.photoCardImage {
  display: block;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  cursor: pointer;
  filter: drop-shadow(0 0 0 hsl(0, 0%, 0%, 0));
  transition: filter 0.2s cubic-bezier(0.215, 0.61, 0.355, 1);
}

</style>

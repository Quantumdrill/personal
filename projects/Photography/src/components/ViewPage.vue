<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getSet } from '../lib/queries'
import { urlFor } from '../lib/image'

const route = useRoute()
const set = ref(null)
const photoScroll = ref(null)
const isPaging = ref(false)
const isLoading = ref(true)

const setDate = computed(() => formatSetDate(set.value && set.value.time))

const logoSrc = `${import.meta.env.BASE_URL}logo-white.svg`

onMounted(async () => {
  set.value = await getSet(route.params.id)
  if (!set.value || !set.value.photos || set.value.photos.length === 0) {
    isLoading.value = false
  }
})

function formatSetDate(time) {
  if (!time) return ''

  const [year, month, day] = time.split('-').map(Number)
  const monthName = new Intl.DateTimeFormat('en', {
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1)))

  return `${year} ${monthName} ${day}`
}

function photoDimensions(photo) {
  return photo.asset?.metadata?.dimensions
}

function isPortrait(photo) {
  const dimensions = photoDimensions(photo)
  return dimensions ? dimensions.height > dimensions.width : false
}

function photoSrc(photo) {
  const image = urlFor(photo).auto('format').quality(100)
  return isPortrait(photo) ? image.height(1600).url() : image.width(1600).url()
}

function photoSrcSet(photo) {
  const dimensions = photoDimensions(photo)
  const ratio = dimensions?.aspectRatio ?? 1
  const sizes = isPortrait(photo) ? [900, 1600, 2400, 3600] : [960, 1600, 2400, 3600]

  return sizes
    .map((size) => {
      const image = urlFor(photo).auto('format').quality(100)

      if (isPortrait(photo)) {
        const resultingWidth = Math.round(size * ratio)
        return `${image.height(size).url()} ${resultingWidth}w`
      }

      return `${image.width(size).url()} ${size}w`
    })
    .join(', ')
}

function photoSizes(photo) {
  if (!isPortrait(photo)) return '80vw'

  const ratio = photoDimensions(photo)?.aspectRatio ?? 1
  return `${Math.round(100 * ratio * 100) / 100}vh`
}

function onPhotoLoad() {
  isLoading.value = false
}

function onPhotoWheel(event) {
  event.preventDefault()
  if (isPaging.value || !photoScroll.value) return

  const direction = event.deltaY > 0 ? 1 : -1
  const pageHeight = photoScroll.value.clientHeight
  const maxScroll = photoScroll.value.scrollHeight - pageHeight
  const nextTop = Math.min(
    maxScroll,
    Math.max(0, photoScroll.value.scrollTop + direction * pageHeight),
  )

  if (nextTop === photoScroll.value.scrollTop) return

  isPaging.value = true
  photoScroll.value.scrollTo({
    top: nextTop,
    behavior: 'smooth',
  })

  window.setTimeout(() => {
    isPaging.value = false
  }, 400)
}
</script>

<template>
  <div
    ref="photoScroll"
    class="view"
    v-on:wheel="onPhotoWheel"
  >
    <img class="viewLogo" v-bind:src="logoSrc" alt="" />
    <span class="photoSectionDot photoSectionDotTL"></span>
    <span class="photoSectionDot photoSectionDotTR"></span>
    <span class="photoSectionDot photoSectionDotBL"></span>
    <span class="photoSectionDot photoSectionDotBR"></span>
    <section class="infoSection" v-on:wheel="onPhotoWheel">
      <div class="infoMeta">
        <p v-if="setDate" class="infoTime">{{ setDate }}</p>
        <p v-if="set && set.location" class="infoLocation">{{ set.location }}</p>
        <p v-if="set && set.comment" class="infoComment">{{ set.comment }}</p>
      </div>
    </section>
    <p v-if="isLoading" class="photoLoading">loading</p>
    <div class="photoSlides">
      <div
        v-for="(photo, index) in set && set.photos ? set.photos : []"
        v-bind:key="photo.asset ? photo.asset._id : index"
        class="photoSlide"
      >
        <img
          v-if="photo.asset"
          class="photoSlideImage"
          v-bind:src="photoSrc(photo)"
          v-bind:srcset="photoSrcSet(photo)"
          v-bind:sizes="photoSizes(photo)"
          v-bind:width="photoDimensions(photo) && photoDimensions(photo).width"
          v-bind:height="photoDimensions(photo) && photoDimensions(photo).height"
          v-bind:alt="set.name"
          v-on:load="onPhotoLoad"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.view {
  --photo-pad: 0.8vw;
  box-sizing: border-box;
  width: 100vw;
  height: 100svh;
  overflow-x: hidden;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  background: hsl(0, 0%, 20%);
  scrollbar-width: thin;
  scrollbar-color: rgb(255 255 255 / 20%) transparent;
}

.view::-webkit-scrollbar {
  width: 9px;
}

.view::-webkit-scrollbar-track {
  background: transparent;
}

.view::-webkit-scrollbar-thumb {
  background: rgb(255 255 255 / 20%);
  border-radius: 4.5px;
}

.view::-webkit-scrollbar-button {
  display: none;
}

.viewLogo {
  position: fixed;
  z-index: 4;
  top: 1vw;
  right: 1vw;
  width: 3vw;
  height: auto;
  opacity: 0.2;
  pointer-events: none;
}

.photoSectionDot {
  position: fixed;
  z-index: 1;
  width: 2px;
  height: 2px;
  background: rgb(255 255 255 / 50%);
  pointer-events: none;
}

.photoSectionDotTL {
  top: var(--photo-pad);
  left: var(--photo-pad);
}

.photoSectionDotTR {
  top: var(--photo-pad);
  right: calc(20vw + var(--photo-pad));
}

.photoSectionDotBL {
  bottom: var(--photo-pad);
  left: var(--photo-pad);
}

.photoSectionDotBR {
  bottom: var(--photo-pad);
  right: calc(20vw + var(--photo-pad));
}

.photoLoading {
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80vw;
  height: 100%;
  margin: 0;
  color: hsl(0, 0%, 60%);
  font-family: "Petrona", serif;
  font-size: 1.3vw;
  font-weight: 400;
  pointer-events: none;
}

.photoSlides {
  width: 100%;
}

.photoSlide {
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 80vw;
  height: 100svh;
  padding: var(--photo-pad);
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

.photoSlideImage {
  display: block;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.infoSection {
  position: fixed;
  z-index: 2;
  top: 0;
  right: 0;
  width: 20vw;
  height: 100%;
}

.infoMeta {
  position: absolute;
  right: 1.5vw;
  bottom: 1.5vw;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  max-width: 17vw;
  text-align: right;
}

.infoTime,
.infoLocation,
.infoComment {
  margin: 0;
  color: hsl(0, 0%, 80%);
  font-family: "Petrona", serif;
  line-height: 1.2;
}

.infoTime {
  font-size: 1.6vw;
  font-weight: 700;
}

.infoLocation,
.infoComment {
  margin-top: 0.6vw;
  font-size: 1.3vw;
  font-weight: 400;
}

.infoComment {
  white-space: pre-wrap;
}
</style>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getSet } from '../lib/queries'
import { urlFor } from '../lib/image'

const route = useRoute()
const set = ref(null)
const photoScroll = ref(null)
const isPaging = ref(false)

const setDate = computed(() => formatSetDate(set.value && set.value.time))

const logoSrc = `${import.meta.env.BASE_URL}logo-white.svg`

onMounted(async () => {
  set.value = await getSet(route.params.id)
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
  <div class="view">
    <img class="viewLogo" v-bind:src="logoSrc" alt="" />
    <section class="photoSection">
      <span class="photoSectionDot photoSectionDotTL"></span>
      <span class="photoSectionDot photoSectionDotTR"></span>
      <span class="photoSectionDot photoSectionDotBL"></span>
      <span class="photoSectionDot photoSectionDotBR"></span>
      <div
        ref="photoScroll"
        class="photoSectionScroll"
        v-on:wheel="onPhotoWheel"
      >
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
          />
        </div>
      </div>
    </section>

    <section class="infoSection">
      <div class="infoMeta">
        <p v-if="setDate" class="infoTime">{{ setDate }}</p>
        <p v-if="set && set.location" class="infoLocation">{{ set.location }}</p>
        <p v-if="set && set.comment" class="infoComment">{{ set.comment }}</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.view {
  display: flex;
  width: 100vw;
  height: 100svh;
  overflow: hidden;
  background: hsl(0, 0%, 20%);
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

.photoSection {
  --photo-pad: 0.8vw;
  position: relative;
  width: 80vw;
  height: 100%;
  overflow: hidden;
}

.photoSectionDot {
  position: absolute;
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
  right: var(--photo-pad);
}

.photoSectionDotBL {
  bottom: var(--photo-pad);
  left: var(--photo-pad);
}

.photoSectionDotBR {
  bottom: var(--photo-pad);
  right: var(--photo-pad);
}

.photoSectionScroll {
  height: 100%;
  overflow-y: auto;
  direction: rtl;
  scroll-snap-type: y mandatory;
  scrollbar-width: thin;
  scrollbar-color: rgb(255 255 255 / 20%) transparent;
}

.photoSectionScroll::-webkit-scrollbar {
  width: 9px;
}

.photoSectionScroll::-webkit-scrollbar-track {
  background: transparent;
}

.photoSectionScroll::-webkit-scrollbar-thumb {
  background: rgb(255 255 255 / 20%);
  border-radius: 4.5px;
}

.photoSectionScroll::-webkit-scrollbar-button {
  display: none;
}

.photoSlide {
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: var(--photo-pad);
  direction: ltr;
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
  position: relative;
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

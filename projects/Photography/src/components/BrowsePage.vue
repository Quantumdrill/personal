<script setup>
import { computed, ref, nextTick, onMounted } from 'vue'
import gsap from 'gsap'
import { getAlbums, getTagsWithSets, getSets } from '../lib/queries'
import PhotoCards from './PhotoCards.vue'

const sets = ref([])
const albums = ref([])
const tagsWithSets = ref([])

onMounted(async () => {
  const [fetchedSets, fetchedAlbums, fetchedTags] = await Promise.all([
    getSets(),
    getAlbums(),
    getTagsWithSets(),
  ])

  sets.value = fetchedSets
  albums.value = fetchedAlbums
  tagsWithSets.value = fetchedTags

  console.log(sets.value)
})

const sortBy = ref(null)
const sortByTitle = ref(null)
const sortByPanel = ref(null)
const sortByLineV = ref(null)
const sortByLineH = ref(null)
const photoLineL = ref(null)
const photoLineR = ref(null)
const photoLineT = ref(null)
const photoLineB = ref(null)
const hoveredPhoto = ref(null)
const isOpen = ref(false)
const isSortReady = ref(false)
const isGalleryReady = ref(true)
const showSortTitle = ref(true)
const isHoveringGallery = ref(false)
const sortByMode = ref('Random')

function shuffleSets(list) {
  const shuffled = [...list]
  for (let index = shuffled.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const currentSet = shuffled[index]
    shuffled[index] = shuffled[randomIndex]
    shuffled[randomIndex] = currentSet
  }
  return shuffled
}

const galleryGroups = computed(() => {
  if (sortByMode.value === 'Random') {
    return [
      {
        key: 'random',
        label: '',
        sets: shuffleSets(sets.value),
      },
    ]
  }

  if (sortByMode.value === 'Tag') {
    return tagsWithSets.value
      .filter((tag) => tag.sets && tag.sets.length > 0)
      .map((tag) => ({
        key: tag._id,
        label: tag.name,
        sets: tag.sets,
      }))
  }

  if (sortByMode.value === 'Album') {
    return [...albums.value]
      .sort((firstAlbum, secondAlbum) => {
        return (secondAlbum.time ?? '').localeCompare(firstAlbum.time ?? '')
      })
      .map((album) => ({
        key: album._id,
        label: album.name,
        sets: (album.sets || []).filter((set) => set),
      }))
      .filter((group) => group.sets.length > 0)
  }

  if (sortByMode.value !== 'Time') {
    return []
  }

  const groupsByMonth = new Map()
  const setsByNewestDate = [...sets.value].sort((firstSet, secondSet) => {
    return (secondSet.time ?? '').localeCompare(firstSet.time ?? '')
  })

  setsByNewestDate.forEach((set) => {
    const monthKey = set.time ? set.time.slice(0, 7) : 'no-date'

    if (!groupsByMonth.has(monthKey)) {
      groupsByMonth.set(monthKey, [])
    }

    groupsByMonth.get(monthKey).push(set)
  })

  return Array.from(groupsByMonth, ([key, groupedSets]) => ({
    key,
    label: formatMonth(key),
    sets: groupedSets,
  }))
})

function formatMonth(monthKey) {
  if (monthKey === 'no-date') return 'No date'

  const [year, month] = monthKey.split('-').map(Number)
  const monthName = new Intl.DateTimeFormat('en', {
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1)))

  return `${year} ${monthName}`
}

function fadeTitleIn() {
  if (isOpen.value) return
  gsap.to(sortByTitle.value, {
    opacity: 0.8,
    duration: 0.2,
    ease: 'power2.out',
  })
}

function fadeTitleOut() {
  if (isOpen.value) return
  gsap.to(sortByTitle.value, {
    opacity: 0.1,
    duration: 0.2,
    ease: 'power2.out',
  })
}

function openSortBy() {
  if (isOpen.value) return
  isOpen.value = true
  isGalleryReady.value = false
  parkPhotoLines()
  gsap.to(sortBy.value, {
    marginLeft: 0,
    duration: 0.35,
    ease: 'power2.out',
    onComplete: () => {
      if (!isOpen.value) return
      isSortReady.value = true
      showSortTitle.value = false
      nextTick(() => {
        moveLinesToHit(currentHit(), false, 0)
        gsap.to([sortByLineV.value, sortByLineH.value], {
          opacity: 1,
          duration: 0.2,
          ease: 'power2.out',
        })
      })
    },
  })
  gsap.to(sortByTitle.value, {
    opacity: 0,
    duration: 0.12,
    ease: 'power2.out',
  })
  gsap.to(sortByPanel.value, {
    opacity: 1,
    duration: 0.35,
    ease: 'power2.out',
  })
}

function closeSortBy() {
  if (!isOpen.value) return
  isOpen.value = false
  isSortReady.value = false
  showSortTitle.value = true
  gsap.to(sortBy.value, {
    marginLeft: '-45vw',
    duration: 0.35,
    ease: 'power2.out',
    onComplete: () => {
      if (isOpen.value) return
      isGalleryReady.value = true
    },
  })
  nextTick(() => {
    gsap.to(sortByTitle.value, {
      opacity: 0.1,
      duration: 0.35,
      ease: 'power2.out',
    })
  })
  gsap.to(sortByPanel.value, {
    opacity: 0,
    duration: 0.2,
    ease: 'power2.out',
  })
  gsap.to([sortByLineV.value, sortByLineH.value], {
    opacity: 0,
    duration: 0.2,
    ease: 'power2.out',
  })
  resetOptions()
}

function currentHit() {
  return sortByPanel.value.querySelector('.sortByOptionHit.isCurrent')
}

function moveLinesToHit(hit, highlighted, duration) {
  if (!hit || !sortByLineV.value || !sortByLineH.value) return
  const text = hit.querySelector('.sortByOption')
  const fontSize = parseFloat(getComputedStyle(text).fontSize)
  const gap = fontSize * 0.1
  let leftV
  let topH
  if (highlighted) {
    const hitBox = hit.getBoundingClientRect()
    const shift = hit.dataset.mode === sortByMode.value ? 0 : window.innerWidth * 0.008
    leftV = hitBox.left + shift + text.offsetWidth + gap
    topH = hitBox.top + (hitBox.height - text.offsetHeight) / 2 + text.offsetHeight
  } else {
    const textBox = text.getBoundingClientRect()
    leftV = -8
    topH = textBox.bottom
  }
  const tween = {
    duration,
    ease: 'power2.out',
    x: 0,
    y: 0,
  }
  if (duration === 0) {
    gsap.set(sortByLineV.value, { left: leftV, x: 0 })
    gsap.set(sortByLineH.value, { top: topH, y: 0 })
    return
  }
  gsap.to(sortByLineV.value, {
    left: leftV,
    ...tween,
  })
  gsap.to(sortByLineH.value, {
    top: topH,
    ...tween,
  })
}

function highlightOption(event) {
  if (!isSortReady.value) return
  const hits = sortByPanel.value.querySelectorAll('.sortByOptionHit')
  const hoveringCurrent = event.currentTarget.dataset.mode === sortByMode.value
  hits.forEach((hit) => {
    const isCurrent = hit.dataset.mode === sortByMode.value
    const isHighlighted = hit === event.currentTarget && !isCurrent
    gsap.to(hit, {
      x: isCurrent ? '1.5em' : 0,
      duration: 0.2,
      ease: 'power2.out',
    })
    gsap.to(hit.querySelector('.sortByOption'), {
      opacity: isCurrent ? (hoveringCurrent ? 0.8 : 0.2) : isHighlighted ? 0.8 : 0.2,
      x: isHighlighted ? '0.8vw' : 0,
      duration: 0.2,
      ease: 'power2.out',
    })
  })
  moveLinesToHit(event.currentTarget, !hoveringCurrent, 0.2)
}

function selectSortBy(mode) {
  if (mode !== sortByMode.value) {
    sortByMode.value = mode
  }
  closeSortBy()
}

function resetOptions(event) {
  if (event && event.relatedTarget && event.relatedTarget.closest('.sortByOptionHit')) {
    return
  }
  const hits = sortByPanel.value.querySelectorAll('.sortByOptionHit')
  hits.forEach((hit) => {
    const isCurrent = hit.dataset.mode === sortByMode.value
    gsap.to(hit, {
      x: isCurrent ? '1.5em' : 0,
      duration: 0.2,
      ease: 'power2.out',
    })
    gsap.to(hit.querySelector('.sortByOption'), {
      opacity: isCurrent ? 0.8 : 0.2,
      x: 0,
      duration: 0.2,
      ease: 'power2.out',
    })
  })
  nextTick(() => {
    moveLinesToHit(currentHit(), false, 0.2)
  })
}

function placePhotoLines(photoBox, duration) {
  if (duration === 0) {
    gsap.killTweensOf([
      photoLineL.value,
      photoLineR.value,
      photoLineT.value,
      photoLineB.value,
    ])
    gsap.set(photoLineL.value, { left: photoBox.left })
    gsap.set(photoLineR.value, { left: photoBox.right - 2 })
    gsap.set(photoLineT.value, { top: photoBox.top })
    gsap.set(photoLineB.value, { top: photoBox.bottom - 2 })
    return
  }

  const tween = {
    duration,
    ease: 'power2.out',
  }

  gsap.to(photoLineL.value, { left: photoBox.left, ...tween })
  gsap.to(photoLineR.value, { left: photoBox.right - 2, ...tween })
  gsap.to(photoLineT.value, { top: photoBox.top, ...tween })
  gsap.to(photoLineB.value, { top: photoBox.bottom - 2, ...tween })
}

function parkPhotoLines() {
  hoveredPhoto.value = null
  gsap.killTweensOf([
    photoLineL.value,
    photoLineR.value,
    photoLineT.value,
    photoLineB.value,
  ])
  gsap.set(photoLineL.value, { left: -2 })
  gsap.set(photoLineR.value, { left: window.innerWidth })
  gsap.set(photoLineT.value, { top: -2 })
  gsap.set(photoLineB.value, { top: window.innerHeight })
}

function showPhotoLines(photoEl) {
  if (!isGalleryReady.value) return
  hoveredPhoto.value = photoEl
  placePhotoLines(photoEl.getBoundingClientRect(), 0.35)
}

function hidePhotoLines(event) {
  if (event && event.relatedTarget && event.relatedTarget.closest('.photoCardImage')) {
    return
  }

  hoveredPhoto.value = null

  const tween = {
    duration: 0.35,
    ease: 'power2.in',
  }

  gsap.to(photoLineL.value, { left: -2, ...tween })
  gsap.to(photoLineR.value, { left: window.innerWidth, ...tween })
  gsap.to(photoLineT.value, { top: -2, ...tween })
  gsap.to(photoLineB.value, { top: window.innerHeight, ...tween })
}

function onGalleryScroll() {
  if (!hoveredPhoto.value) return
  placePhotoLines(hoveredPhoto.value.getBoundingClientRect(), 0)
}

function enterGallery() {
  isHoveringGallery.value = true
}

function leaveGallery() {
  isHoveringGallery.value = false
}

const logoSrc = `${import.meta.env.BASE_URL}logo-white.svg`
</script>

<template>
  <div class="browse">
    <img class="browseLogo" v-bind:src="logoSrc" alt="" />
    <section ref="sortBy" class="sortBy">
      <div
        ref="sortByPanel"
        class="sortByPanel"
        v-bind:style="{ pointerEvents: isSortReady ? 'auto' : 'none' }"
      >
        <p class="sortByHeading">Sort photo sets by:</p>
        <div class="sortByOptions">
          <div
            class="sortByOptionHit"
            data-mode="Tag"
            v-bind:class="{ isCurrent: sortByMode === 'Tag' }"
            v-on:mouseenter="highlightOption"
            v-on:mouseleave="resetOptions"
            v-on:click="selectSortBy('Tag')"
          >
            <button class="sortByOption" type="button">Tag</button>
          </div>
          <div
            class="sortByOptionHit"
            data-mode="Time"
            v-bind:class="{ isCurrent: sortByMode === 'Time' }"
            v-on:mouseenter="highlightOption"
            v-on:mouseleave="resetOptions"
            v-on:click="selectSortBy('Time')"
          >
            <button class="sortByOption" type="button">Time</button>
          </div>
          <div
            class="sortByOptionHit"
            data-mode="Album"
            v-bind:class="{ isCurrent: sortByMode === 'Album' }"
            v-on:mouseenter="highlightOption"
            v-on:mouseleave="resetOptions"
            v-on:click="selectSortBy('Album')"
          >
            <button class="sortByOption" type="button">Album</button>
          </div>
          <div
            class="sortByOptionHit"
            data-mode="Random"
            v-bind:class="{ isCurrent: sortByMode === 'Random' }"
            v-on:mouseenter="highlightOption"
            v-on:mouseleave="resetOptions"
            v-on:click="selectSortBy('Random')"
          >
            <button class="sortByOption" type="button">Random</button>
          </div>
        </div>
      </div>
      <div class="sortByTitleWrap">
        <button
          ref="sortByTitle"
          class="sortByTitle"
          type="button"
          v-show="showSortTitle"
          v-on:click="openSortBy"
          v-on:mouseenter="fadeTitleIn"
          v-on:mouseleave="fadeTitleOut"
        >
          Sort By...
        </button>
      </div>
    </section>

    <section
      class="photoGallery"
      v-bind:class="{ isSortOpen: isOpen }"
      v-on:click="closeSortBy"
      v-on:mouseenter="enterGallery"
      v-on:mouseleave="leaveGallery"
    >
      <div
        class="photoGalleryScroll"
        v-bind:style="{ pointerEvents: isGalleryReady ? 'auto' : 'none' }"
        v-on:scroll="onGalleryScroll"
      >
        <template v-for="group in galleryGroups" v-bind:key="group.key">
          <div v-if="group.label" class="photoGalleryDivider">
            {{ group.label }}
          </div>
          <div class="photoGalleryGroup">
            <PhotoCards
              v-for="set in group.sets"
              v-bind:key="set._id"
              v-bind:set="set"
              v-on:photoenter="showPhotoLines"
              v-on:photoleave="hidePhotoLines"
            />
          </div>
        </template>
      </div>
    </section>

    <div
      class="galleryBackDim"
      v-bind:class="{ isVisible: isOpen && isHoveringGallery }"
    ></div>
    <p
      class="galleryBack"
      v-bind:class="{ isVisible: isOpen && isHoveringGallery }"
    >
      back
    </p>
    <div ref="sortByLineV" class="sortByLineV"></div>
    <div ref="sortByLineH" class="sortByLineH"></div>
    <div ref="photoLineL" class="photoLineL"></div>
    <div ref="photoLineR" class="photoLineR"></div>
    <div ref="photoLineT" class="photoLineT"></div>
    <div ref="photoLineB" class="photoLineB"></div>
  </div>
</template>

<style scoped>
.browse {
  display: flex;
  width: 100vw;
  height: 100svh;
  overflow: hidden;
  background: hsl(0, 0%, 20%);
}

.browseLogo {
  position: fixed;
  z-index: 4;
  top: 1vw;
  left: 1vw;
  width: 3vw;
  height: auto;
  opacity: 0.2;
  pointer-events: none;
}

.sortBy {
  position: relative;
  z-index: 2;
  box-sizing: border-box;
  flex-shrink: 0;
  width: 60vw;
  margin-left: -45vw;
}

.sortByPanel {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  padding: 4vw 6vw 4vw 2vw;
  opacity: 0;
  pointer-events: none;
}

.sortByHeading {
  margin: 0 0 3vw;
  color: #fff;
  font-family: "Neuton", serif;
  font-size: 2.5vw;
  opacity: 0.2;
  font-weight: 400;
}

.sortByOptions {
  --option-row: 7vw;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: max-content;
  gap: 0;
}

.sortByOptionHit {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: max-content;
  height: var(--option-row);
  font-size: 8vw;
  cursor: pointer;
}

.sortByOptionHit.isCurrent {
  transform: translateX(1.5em);
}

.sortByOptionHit.isCurrent .sortByOption {
  opacity: 0.8;
  cursor: pointer;
}

.sortByLineV,
.sortByLineH {
  position: fixed;
  z-index: 0;
  background: rgb(255 255 255 / 10%);
  pointer-events: none;
  opacity: 0;
}

.sortByLineV {
  top: 0;
  left: 0;
  width: 2px;
  height: 100vh;
}

.sortByLineH {
  left: 0;
  width: 100vw;
  height: 2px;
}

.photoLineL,
.photoLineR,
.photoLineT,
.photoLineB {
  position: fixed;
  z-index: 0;
  background: rgb(255 255 255 / 10%);
  pointer-events: none;
}

.photoLineL,
.photoLineR {
  top: 0;
  width: 2px;
  height: 100vh;
}

.photoLineT,
.photoLineB {
  left: 0;
  width: 100vw;
  height: 2px;
}

.photoLineL {
  left: -2px;
}

.photoLineR {
  left: 100vw;
}

.photoLineT {
  top: -2px;
}

.photoLineB {
  top: 100vh;
}

.sortByOption {
  display: block;
  width: max-content;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  color: #fff;
  font-family: "Neuton", serif;
  font-size: 8vw;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
  opacity: 0.2;
  pointer-events: none;
}

.sortByTitleWrap {
  position: absolute;
  top: 0;
  right: 0;
  width: 15vw;
  height: 100%;
  pointer-events: none;
}

.sortByTitle {
  position: absolute;
  left: -1vw;
  top: calc(100% - 1vw);
  pointer-events: auto;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  color: #fff;
  font-family: "Neuton", serif;
  font-size: 7vw;
  font-weight: 800;
  font-style: normal;
  letter-spacing: 0.02em;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  opacity: 0.1;
  transform: rotate(-90deg);
  transform-origin: left top;
}

.photoGallery {
  --gallery-gap: 2vw;
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  width: 85vw;
  height: 100%;
  overflow: hidden;
}

.photoGallery.isSortOpen {
  cursor: pointer;
}

.galleryBackDim {
  position: fixed;
  z-index: 5;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100svh;
  background: #000;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.215, 0.61, 0.355, 1);
}

.galleryBackDim.isVisible {
  opacity: 0.2;
}

.galleryBack {
  position: fixed;
  z-index: 6;
  top: auto;
  right: -50vw;
  bottom: calc(4vw - (8vw - 7vw) / 2);
  margin: 0;
  padding: 0;
  color: #fff;
  font-family: "Neuton", serif;
  font-size: 45vw;
  font-weight: 800;
  line-height: 0.75;
  letter-spacing: 0.02em;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transform: translateX(-50%);
  transition: opacity 0.2s cubic-bezier(0.215, 0.61, 0.355, 1);
}

.galleryBack.isVisible {
  opacity: 0.1;
}

.photoGalleryScroll {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: var(--gallery-gap);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgb(255 255 255 / 20%) transparent;
}

.photoGalleryScroll::-webkit-scrollbar {
  width: 9px;
}

.photoGalleryScroll::-webkit-scrollbar-track {
  background: transparent;
}

.photoGalleryScroll::-webkit-scrollbar-thumb {
  background: rgb(255 255 255 / 20%);
  border-radius: 4.5px;
}

.photoGalleryScroll::-webkit-scrollbar-button {
  display: none;
}

.photoGalleryDivider {
  box-sizing: border-box;
  flex-shrink: 0;
  width: 100%;
  margin-top: 1.6vw;
  margin-bottom: 0.6vw;
  padding-left: 0.3vw;
  background: none;
  color: hsl(0, 0%, 80%);
  font-family: "Neuton", serif;
  font-size: 3vw;
  font-weight: 600;
  line-height: 1;
}

.photoGalleryGroup {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gallery-gap);
  margin-top: 1vw;
  margin-bottom: 1vw;
}
</style>

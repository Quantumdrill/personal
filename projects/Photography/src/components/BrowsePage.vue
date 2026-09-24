<script setup>
import { computed, ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import gsap from 'gsap'
import { getAlbums, getTagsWithSets, getSets } from '../lib/queries'
import PhotoCards from './PhotoCards.vue'

const route = useRoute()
const router = useRouter()
const sets = ref([])
const albums = ref([])
const tagsWithSets = ref([])
const groupingModes = ['Random', 'Tag', 'Time', 'Album']
const phoneIntroStorageKey = 'photography:phone-layout-accepted'

function groupingModeFromQuery(queryValue) {
  const value = Array.isArray(queryValue) ? queryValue[0] : queryValue
  return (
    groupingModes.find((mode) => mode.toLowerCase() === String(value).toLowerCase()) ??
    'Random'
  )
}

const groupByMode = ref(groupingModeFromQuery(route.query.group))
const showPhoneIntro = ref(
  isPortraitPhoneMode() && sessionStorage.getItem(phoneIntroStorageKey) !== 'true',
)

onMounted(async () => {
  const normalizedGroup = groupByMode.value.toLowerCase()
  if (route.query.group !== normalizedGroup) {
    await router.replace({
      query: { ...route.query, group: normalizedGroup },
    })
  }

  const [fetchedSets, fetchedAlbums, fetchedTags] = await Promise.all([
    getSets(),
    getAlbums(),
    getTagsWithSets(),
  ])

  sets.value = fetchedSets
  albums.value = fetchedAlbums
  tagsWithSets.value = fetchedTags

  console.log(sets.value)

  await nextTick()
  restoreGalleryScroll()
})

const groupBy = ref(null)
const groupByTitle = ref(null)
const groupByPanel = ref(null)
const groupByLineV = ref(null)
const groupByLineH = ref(null)
const photoGalleryScroll = ref(null)
const photoLineL = ref(null)
const photoLineR = ref(null)
const photoLineT = ref(null)
const photoLineB = ref(null)
const hoveredPhoto = ref(null)
const isOpen = ref(false)
const isGroupReady = ref(false)
const isGalleryReady = ref(true)
const showGroupTitle = ref(true)
const isHoveringGallery = ref(false)

onBeforeUnmount(() => {
  saveGalleryScroll()
})

function galleryScrollStorageKey() {
  return `photography:browse-scroll:${groupByMode.value.toLowerCase()}`
}

function saveGalleryScroll() {
  if (!photoGalleryScroll.value) return

  sessionStorage.setItem(
    galleryScrollStorageKey(),
    String(photoGalleryScroll.value.scrollTop),
  )
}

function restoreGalleryScroll() {
  if (!photoGalleryScroll.value) return

  const savedScroll = Number(sessionStorage.getItem(galleryScrollStorageKey()))
  if (Number.isFinite(savedScroll)) {
    photoGalleryScroll.value.scrollTop = savedScroll
  }
}

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
  if (groupByMode.value === 'Random') {
    return [
      {
        key: 'random',
        label: '',
        sets: shuffleSets(sets.value),
      },
    ]
  }

  if (groupByMode.value === 'Tag') {
    return tagsWithSets.value
      .filter((tag) => tag.sets && tag.sets.length > 0)
      .map((tag) => ({
        key: tag._id,
        label: tag.name,
        sets: tag.sets,
      }))
  }

  if (groupByMode.value === 'Album') {
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

  if (groupByMode.value !== 'Time') {
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
  gsap.to(groupByTitle.value, {
    opacity: 0.8,
    duration: 0.2,
    ease: 'power2.out',
  })
}

function fadeTitleOut() {
  if (isOpen.value) return
  gsap.to(groupByTitle.value, {
    opacity: groupByRestingOpacity(),
    duration: 0.2,
    ease: 'power2.out',
  })
}

function openGroupBy() {
  if (isOpen.value) return
  isOpen.value = true
  isGalleryReady.value = false
  if (!isPortraitPhoneMode()) {
    parkPhotoLines()
  }
  gsap.to(groupBy.value, {
    marginLeft: 0,
    duration: 0.35,
    ease: 'power2.out',
    onComplete: () => {
      if (!isOpen.value) return
      isGroupReady.value = true
      nextTick(() => {
        if (isPortraitPhoneMode()) return
        moveLinesToHit(currentHit(), false, 0)
        gsap.to([groupByLineV.value, groupByLineH.value], {
          opacity: 1,
          duration: 0.2,
          ease: 'power2.out',
        })
      })
    },
  })
  gsap.killTweensOf(groupByTitle.value)
  gsap.to(groupByTitle.value, {
    opacity: 0,
    duration: 0.12,
    ease: 'power2.out',
    onComplete: () => {
      if (isOpen.value) {
        showGroupTitle.value = false
      }
    },
  })
  gsap.to(groupByPanel.value, {
    opacity: 1,
    duration: 0.35,
    ease: 'power2.out',
  })
}

function isPortraitPhoneMode() {
  return window.matchMedia(
    '(max-width: 767px) and (orientation: portrait)',
  ).matches
}

function groupByClosedMargin() {
  return isPortraitPhoneMode() ? '-75vw' : '-45vw'
}

function groupByRestingOpacity() {
  return isPortraitPhoneMode() ? 0.3 : 0.1
}

function closeGroupBy() {
  if (!isOpen.value) return
  isOpen.value = false
  isGroupReady.value = false
  gsap.killTweensOf(groupByTitle.value)
  gsap.set(groupByTitle.value, { opacity: 0 })
  showGroupTitle.value = true
  gsap.to(groupBy.value, {
    marginLeft: groupByClosedMargin(),
    duration: 0.35,
    ease: 'power2.out',
    onComplete: () => {
      if (isOpen.value) return
      isGalleryReady.value = true
    },
  })
  nextTick(() => {
    if (isOpen.value) return
    gsap.to(groupByTitle.value, {
      opacity: groupByRestingOpacity(),
      duration: 0.35,
      ease: 'power2.out',
    })
  })
  gsap.to(groupByPanel.value, {
    opacity: 0,
    duration: 0.2,
    ease: 'power2.out',
  })
  if (!isPortraitPhoneMode()) {
    gsap.to([groupByLineV.value, groupByLineH.value], {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.out',
    })
  }
  resetOptions()
}

function currentHit() {
  return groupByPanel.value.querySelector('.groupByOptionHit.isCurrent')
}

function moveLinesToHit(hit, highlighted, duration) {
  if (isPortraitPhoneMode()) return
  if (!hit || !groupByLineV.value || !groupByLineH.value) return
  const text = hit.querySelector('.groupByOption')
  const fontSize = parseFloat(getComputedStyle(text).fontSize)
  const gap = fontSize * 0.1
  let leftV
  let topH
  if (highlighted) {
    const hitBox = hit.getBoundingClientRect()
    const shift = hit.dataset.mode === groupByMode.value ? 0 : window.innerWidth * 0.008
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
    gsap.set(groupByLineV.value, { left: leftV, x: 0 })
    gsap.set(groupByLineH.value, { top: topH, y: 0 })
    return
  }
  gsap.to(groupByLineV.value, {
    left: leftV,
    ...tween,
  })
  gsap.to(groupByLineH.value, {
    top: topH,
    ...tween,
  })
}

function highlightOption(event) {
  if (!isGroupReady.value) return
  const hits = groupByPanel.value.querySelectorAll('.groupByOptionHit')
  const hoveringCurrent = event.currentTarget.dataset.mode === groupByMode.value
  hits.forEach((hit) => {
    const isCurrent = hit.dataset.mode === groupByMode.value
    const isHighlighted = hit === event.currentTarget && !isCurrent
    gsap.to(hit, {
      x: isCurrent ? '1.5em' : 0,
      duration: 0.2,
      ease: 'power2.out',
    })
    gsap.to(hit.querySelector('.groupByOption'), {
      opacity: isCurrent ? (hoveringCurrent ? 0.8 : 0.2) : isHighlighted ? 0.8 : 0.2,
      x: isHighlighted ? '0.8vw' : 0,
      duration: 0.2,
      ease: 'power2.out',
    })
  })
  moveLinesToHit(event.currentTarget, !hoveringCurrent, 0.2)
}

function selectGroupBy(mode) {
  if (mode !== groupByMode.value) {
    saveGalleryScroll()
    groupByMode.value = mode
    sessionStorage.setItem(galleryScrollStorageKey(), '0')
    router.replace({
      query: { ...route.query, group: mode.toLowerCase() },
    })
    nextTick(() => {
      if (photoGalleryScroll.value) {
        photoGalleryScroll.value.scrollTop = 0
      }
    })
  }
  closeGroupBy()
}

function resetOptions(event) {
  if (event && event.relatedTarget && event.relatedTarget.closest('.groupByOptionHit')) {
    return
  }
  const hits = groupByPanel.value.querySelectorAll('.groupByOptionHit')
  hits.forEach((hit) => {
    const isCurrent = hit.dataset.mode === groupByMode.value
    gsap.to(hit, {
      x: isCurrent ? '1.5em' : 0,
      duration: 0.2,
      ease: 'power2.out',
    })
    gsap.to(hit.querySelector('.groupByOption'), {
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
  if (isPortraitPhoneMode()) return
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
  if (isPortraitPhoneMode()) return
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
  if (isPortraitPhoneMode()) return
  if (!isGalleryReady.value) return
  hoveredPhoto.value = photoEl
  placePhotoLines(photoEl.getBoundingClientRect(), 0.35)
}

function hidePhotoLines(event) {
  if (isPortraitPhoneMode()) {
    hoveredPhoto.value = null
    return
  }
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

function continueWithPhoneLayout() {
  sessionStorage.setItem(phoneIntroStorageKey, 'true')
  showPhoneIntro.value = false
}

const logoSrc = `${import.meta.env.BASE_URL}logo-white.svg`
</script>

<template>
  <div class="browse">
    <div v-if="showPhoneIntro" class="phoneIntro">
      <p class="phoneIntroText">
        Please use a large screen/desktop for the best experience.
      </p>
      <button
        class="phoneIntroButton"
        type="button"
        v-on:click="continueWithPhoneLayout"
      >
        Continue with phone layout
      </button>
    </div>

    <img class="browseLogo" v-bind:src="logoSrc" alt="" />
    <section ref="groupBy" class="groupBy">
      <div
        ref="groupByPanel"
        class="groupByPanel"
        v-bind:style="{ pointerEvents: isGroupReady ? 'auto' : 'none' }"
      >
        <p class="groupByHeading">Group photo sets by:</p>
        <div class="groupByOptions">
          <div
            class="groupByOptionHit"
            data-mode="Tag"
            v-bind:class="{ isCurrent: groupByMode === 'Tag' }"
            v-on:mouseenter="highlightOption"
            v-on:mouseleave="resetOptions"
            v-on:click="selectGroupBy('Tag')"
          >
            <button class="groupByOption" type="button">Tag</button>
          </div>
          <div
            class="groupByOptionHit"
            data-mode="Time"
            v-bind:class="{ isCurrent: groupByMode === 'Time' }"
            v-on:mouseenter="highlightOption"
            v-on:mouseleave="resetOptions"
            v-on:click="selectGroupBy('Time')"
          >
            <button class="groupByOption" type="button">Time</button>
          </div>
          <div
            class="groupByOptionHit"
            data-mode="Album"
            v-bind:class="{ isCurrent: groupByMode === 'Album' }"
            v-on:mouseenter="highlightOption"
            v-on:mouseleave="resetOptions"
            v-on:click="selectGroupBy('Album')"
          >
            <button class="groupByOption" type="button">Album</button>
          </div>
          <div
            class="groupByOptionHit"
            data-mode="Random"
            v-bind:class="{ isCurrent: groupByMode === 'Random' }"
            v-on:mouseenter="highlightOption"
            v-on:mouseleave="resetOptions"
            v-on:click="selectGroupBy('Random')"
          >
            <button class="groupByOption" type="button">Random</button>
          </div>
        </div>
      </div>
      <div class="groupByTitleWrap">
        <button
          ref="groupByTitle"
          class="groupByTitle"
          type="button"
          v-show="showGroupTitle"
          v-on:click="openGroupBy"
          v-on:mouseenter="fadeTitleIn"
          v-on:mouseleave="fadeTitleOut"
        >
          Group By...
        </button>
      </div>
    </section>

    <section
      class="photoGallery"
      v-bind:class="{ isGroupOpen: isOpen }"
      v-on:click="closeGroupBy"
      v-on:mouseenter="enterGallery"
      v-on:mouseleave="leaveGallery"
    >
      <div
        ref="photoGalleryScroll"
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
    <div ref="groupByLineV" class="groupByLineV"></div>
    <div ref="groupByLineH" class="groupByLineH"></div>
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

.phoneIntro {
  position: fixed;
  z-index: 10;
  inset: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8vw;
  padding: 8vw;
  background: hsl(0, 0%, 20%);
  text-align: center;
}

.phoneIntroText {
  max-width: 80vw;
  margin: 0;
  color: hsl(0, 0%, 80%);
  font-family: "Petrona", serif;
  font-size: clamp(18px, 5vw, 28px);
  line-height: 1.3;
}

.phoneIntroButton {
  margin: 0;
  padding: 3vw 4vw;
  border: 1px solid rgb(255 255 255 / 30%);
  background: rgb(0 0 0 / 0%);
  color: hsl(0, 0%, 80%);
  font-family: "Petrona", serif;
  font-size: clamp(16px, 4vw, 22px);
  line-height: 1.2;
  cursor: pointer;
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

.groupBy {
  position: relative;
  z-index: 2;
  box-sizing: border-box;
  flex-shrink: 0;
  width: 60vw;
  margin-left: -45vw;
}

.groupByPanel {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  padding: 4vw 6vw 2vw 2vw;
  opacity: 0;
  pointer-events: none;
}

.groupByHeading {
  margin: 0 0 3vw;
  color: #fff;
  font-family: "Young Serif", serif;
  font-size: 2.25vw;
  opacity: 0.2;
  font-weight: 400;
}

.groupByOptions {
  --option-row: 7.6vw;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: max-content;
  gap: 0;
}

.groupByOptionHit {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: max-content;
  height: var(--option-row);
  font-size: 7.2vw;
  cursor: pointer;
}

.groupByOptionHit.isCurrent {
  transform: translateX(1.5em);
}

.groupByOptionHit.isCurrent .groupByOption {
  opacity: 0.8;
  cursor: pointer;
}

.groupByLineV,
.groupByLineH {
  position: fixed;
  z-index: 0;
  background: rgb(255 255 255 / 10%);
  pointer-events: none;
  opacity: 0;
}

.groupByLineV {
  top: 0;
  left: 0;
  width: 2px;
  height: 100vh;
}

.groupByLineH {
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

.groupByOption {
  display: block;
  width: max-content;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  color: #fff;
  font-family: "Young Serif", serif;
  font-size: 7.2vw;
  font-weight: 400;
  line-height: 1;
  cursor: pointer;
  opacity: 0.2;
  pointer-events: none;
}

.groupByTitleWrap {
  position: absolute;
  z-index: 3;
  top: 0;
  right: 0;
  width: 15vw;
  height: 100%;
  pointer-events: none;
}

.groupByTitle {
  position: absolute;
  left: -1vw;
  top: calc(100% - 1vw);
  pointer-events: auto;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  color: #fff;
  font-family: "Young Serif", serif;
  font-size: 6.3vw;
  font-weight: 400;
  font-style: normal;
  letter-spacing: -0.01em;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  opacity: 0.1;
  transform: rotate(-90deg);
  transform-origin: left top;
}

.photoGallery {
  --gallery-gap: 2vw;
  --gallery-card-width: calc((100% - 2 * var(--gallery-gap)) / 3);
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  width: 85vw;
  height: 100%;
  overflow: hidden;
}

.photoGallery.isGroupOpen {
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
  right: -60vw;
  bottom: calc(4vw - (8vw - 7vw) / 2);
  margin: 0;
  padding: 0;
  color: #fff;
  font-family: "Young Serif", serif;
  font-size: 45vw;
  font-weight: 400;
  line-height: 0.75;
  letter-spacing: -0.02em;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transform: translateX(-50%);
  transition: opacity 0.2s cubic-bezier(0.215, 0.61, 0.355, 1);
}

.galleryBack.isVisible {
  opacity: 0.05;
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
  font-family: "Young Serif", serif;
  font-size: 2.7vw;
  font-weight: 400;
  line-height: 1;
}

.photoGalleryGroup {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gallery-gap);
  margin-top: 1vw;
  margin-bottom: 1vw;
}

@media (min-width: 1280px) {
  .photoGallery {
    --gallery-card-width: calc((100% - 3 * var(--gallery-gap)) / 4);
  }
}

@media (max-width: 767px) and (orientation: portrait) {
  .browse {
    flex-direction: row;
  }

  .browseLogo {
    top: auto;
    left: auto;
    right: 4vw;
    bottom: 4vw;
    width: 10vw;
  }

  .groupBy {
    position: relative;
    z-index: 2;
    left: auto;
    bottom: auto;
    width: 75vw;
    height: 100%;
    margin-left: -75vw;
    background: hsl(0, 0%, 20%);
  }

  .groupByPanel {
    padding: 6vw 5vw 3vw;
  }

  .groupByHeading {
    margin-bottom: 4vw;
    font-size: 6vw;
    opacity: 0.4;
  }

  .groupByOptions {
    --option-row: 16vw;
  }

  .groupByOptionHit,
  .groupByOption {
    font-size: 12.6vw;
  }

  .groupByTitleWrap {
    top: auto;
    right: auto;
    left: 75vw;
    bottom: 0;
    width: 75vw;
    height: 18vw;
  }

  .groupByTitle {
    top: auto;
    left: 4vw;
    bottom: 4vw;
    font-size: 10.8vw;
    opacity: 0.3;
    transform: none;
  }

  .galleryBack {
    display: none;
  }

  .photoGallery {
    --gallery-gap: 3vw;
    --gallery-card-width: calc((100% - var(--gallery-gap)) / 2);
    order: initial;
    width: 100vw;
    height: calc(100svh - 18vw);
  }

  .groupByLineV,
  .groupByLineH,
  .photoLineL,
  .photoLineR,
  .photoLineT,
  .photoLineB {
    display: none;
  }

  .photoGalleryDivider {
    margin-top: 4vw;
    margin-bottom: 2vw;
    padding-left: 1vw;
    font-size: 6.3vw;
  }

  .photoGalleryGroup {
    margin-top: 2vw;
    margin-bottom: 2vw;
  }
}
</style>

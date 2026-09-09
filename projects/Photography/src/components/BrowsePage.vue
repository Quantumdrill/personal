<script setup>
import { computed, ref, nextTick, onMounted } from 'vue'
import gsap from 'gsap'
import { getAlbums, getTagsWithSets, getSets } from '../lib/queries'

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
})

const sortBy = ref(null)
const sortByTitle = ref(null)
const sortByPanel = ref(null)
const sortByLineV = ref(null)
const sortByLineH = ref(null)
const isOpen = ref(false)
const sortByMode = ref('Time')

const galleryGroups = computed(() => {
  if (sortByMode.value !== 'Time') {
    return [
      {
        key: 'all',
        label: '',
        sets: sets.value,
      },
    ]
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
  gsap.to(sortBy.value, {
    marginLeft: 0,
    duration: 0.35,
    ease: 'power2.out',
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
  gsap.to([sortByLineV.value, sortByLineH.value], {
    opacity: 1,
    duration: 0.35,
    ease: 'power2.out',
  })
  nextTick(() => {
    moveLinesToHit(currentHit(), false, 0)
  })
}

function closeSortBy() {
  if (!isOpen.value) return
  isOpen.value = false
  gsap.to(sortBy.value, {
    marginLeft: '-45vw',
    duration: 0.35,
    ease: 'power2.out',
  })
  gsap.to(sortByTitle.value, {
    opacity: 0.1,
    duration: 0.35,
    ease: 'power2.out',
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
    const shift = window.innerWidth * 0.008
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
  const hits = sortByPanel.value.querySelectorAll('.sortByOptionHit')
  hits.forEach((hit) => {
    const isCurrent = hit.dataset.mode === sortByMode.value
    const isHighlighted = hit === event.currentTarget && !isCurrent
    gsap.to(hit.querySelector('.sortByOption'), {
      opacity: isCurrent ? 0.2 : isHighlighted ? 0.8 : 0.2,
      x: isCurrent ? '1.5em' : isHighlighted ? '0.8vw' : 0,
      duration: 0.2,
      ease: 'power2.out',
    })
  })
  moveLinesToHit(event.currentTarget, true, 0.2)
}

function selectSortBy(mode) {
  if (mode === sortByMode.value) return
  sortByMode.value = mode
  closeSortBy()
}

function resetOptions(event) {
  if (event && event.relatedTarget && event.relatedTarget.closest('.sortByOptionHit')) {
    return
  }
  const hits = sortByPanel.value.querySelectorAll('.sortByOptionHit')
  hits.forEach((hit) => {
    const isCurrent = hit.dataset.mode === sortByMode.value
    gsap.to(hit.querySelector('.sortByOption'), {
      opacity: isCurrent ? 0.8 : 0.5,
      x: isCurrent ? '1.5em' : 0,
      duration: 0.2,
      ease: 'power2.out',
    })
  })
  nextTick(() => {
    moveLinesToHit(currentHit(), false, 0.2)
  })
}
</script>

<template>
  <div class="browse">
    <section ref="sortBy" class="sortBy">
      <div
        ref="sortByPanel"
        class="sortByPanel"
        v-bind:style="{ pointerEvents: isOpen ? 'auto' : 'none' }"
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
          v-on:click="openSortBy"
          v-on:mouseenter="fadeTitleIn"
          v-on:mouseleave="fadeTitleOut"
        >
          Sort By...
        </button>
      </div>
    </section>

    <section class="photoGallery" v-on:click="closeSortBy">
      <div class="photoGalleryScroll">
        <template v-for="group in galleryGroups" v-bind:key="group.key">
          <div class="photoGalleryDivider">
            {{ group.label }}
          </div>
          <div class="photoGalleryGroup">
            <div
              v-for="set in group.sets"
              v-bind:key="set._id"
              class="photoCard"
            >
              {{ set.name }}
            </div>
          </div>
        </template>
      </div>
    </section>

    <div ref="sortByLineV" class="sortByLineV"></div>
    <div ref="sortByLineH" class="sortByLineH"></div>
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
  font-weight: 600;
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
  cursor: default;
  pointer-events: none;
}

.sortByOptionHit.isCurrent .sortByOption {
  opacity: 0.8;
  cursor: default;
  transform: translateX(1.5em);
}

.sortByLineV,
.sortByLineH {
  position: fixed;
  z-index: 3;
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
  opacity: 0.5;
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
  left: -0.5vw;
  top: calc(100% - 1.5vw);
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
  flex-shrink: 0;
  width: 100%;
  margin-top: 1vw;
  margin-bottom: 1vw;
  background: none;
  color: hsl(0, 0%, 80%);
  font-family: "Neuton", serif;
  font-size: 4vw;
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

.photoCard {
  box-sizing: border-box;
  width: calc((100% - 3 * var(--gallery-gap)) / 4);
  aspect-ratio: 1;
  padding: 0.8vw;
  background: none;
  color: hsl(0, 0%, 80%);
  font-family: "Neuton", serif;
  font-size: 1vw;
  font-weight: 800;
  line-height: 1;
}
</style>

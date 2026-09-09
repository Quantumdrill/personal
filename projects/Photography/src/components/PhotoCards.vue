<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

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
      v-bind:src="thumbnail.asset.url"
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
  background: none;
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

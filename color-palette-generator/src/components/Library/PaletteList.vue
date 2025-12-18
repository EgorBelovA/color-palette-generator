<template>
  <div class="palette-list" @click="$emit('select', palette)">
    <PaletteItem
      v-for="palette in palettes"
      :key="palette.id"
      :palette="palette"
      @delete="removePalette(palette.id)"
      @toggleFavorite="togglePaletteFavorite(palette.id)"
      @select="$emit('select', $event)"
    />

    <div v-if="!palettes.length" class="empty">No palettes yet</div>
  </div>
</template>

<script setup>
import PaletteItem from './PaletteItem.vue';
import { usePaletteLibrary } from '@/composables/usePaletteLibrary';

const props = defineProps({
  palettes: Array,
  collectionId: String,
});

const {
  removePalette: removePaletteFromLibrary,
  togglePaletteFavorite: togglePaletteFavoriteInLibrary,
} = usePaletteLibrary();

function removePalette(id) {
  removePaletteFromLibrary(props.collectionId, id);
}
function togglePaletteFavorite(id) {
  togglePaletteFavoriteInLibrary(props.collectionId, id);
}
</script>

<style scoped>
.palette-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}
.empty {
  text-align: center;
  color: #888;
  padding: 20px;
}
</style>

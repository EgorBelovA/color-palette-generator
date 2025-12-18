import { ref } from 'vue';
import { useStorage } from '@/composables/useStorage';

const { load, save } = useStorage('paletteCollections');

const collections = ref(load() || []);

function persist() {
  save(collections.value);
}

export function usePaletteLibrary() {
  function createCollection(name) {
    collections.value.push({
      id: crypto.randomUUID(),
      name,
      palettes: [],
      favorite: false,
      createdAt: Date.now(),
    });
    persist();
  }

  function deleteCollection(id) {
    collections.value = collections.value.filter((c) => c.id !== id);
    persist();
  }

  function addPalette(collectionId, palette) {
    const col = collections.value.find((c) => c.id === collectionId);
    if (!col) return;

    col.palettes.push({
      id: crypto.randomUUID(),
      name: palette.name || 'Untitled palette',
      colors: palette.colors || [],
      baseColor: palette.baseColor,
      harmony: palette.harmony,
      count: palette.count,
      tags: palette.tags || [],
      favorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    persist();
  }

  function updatePalette(collectionId, paletteId, patch) {
    const col = collections.value.find((c) => c.id === collectionId);
    if (!col) return;

    const palette = col.palettes.find((p) => p.id === paletteId);
    if (!palette) return;

    Object.assign(palette, patch, {
      updatedAt: Date.now(),
    });

    persist();
  }

  function removePalette(collectionId, paletteId) {
    const col = collections.value.find((c) => c.id === collectionId);
    if (!col) return;

    col.palettes = col.palettes.filter((p) => p.id !== paletteId);
    persist();
  }

  function toggleCollectionFavorite(collectionId) {
    const col = collections.value.find((c) => c.id === collectionId);
    if (!col) return;

    col.favorite = !col.favorite;
    persist();
  }

  function togglePaletteFavorite(collectionId, paletteId) {
    const col = collections.value.find((c) => c.id === collectionId);
    if (!col) return;

    const palette = col.palettes.find((p) => p.id === paletteId);
    if (!palette) return;

    palette.favorite = !palette.favorite;
    persist();
  }

  return {
    collections,

    createCollection,
    deleteCollection,

    addPalette,
    updatePalette,
    removePalette,

    toggleCollectionFavorite,
    togglePaletteFavorite,
  };
}

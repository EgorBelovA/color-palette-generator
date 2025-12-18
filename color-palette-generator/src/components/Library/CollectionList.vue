<template>
  <section class="collection-list">
    <header class="toolbar">
      <input
        v-model="search"
        class="search"
        placeholder="Search collections or tags"
      />
      <button class="create" @click="create">+ New collection</button>
    </header>

    <div class="filters">
      <label>
        <input type="checkbox" v-model="favoritesOnly" />
        Favorites only
      </label>
    </div>

    <div v-if="filtered.length" class="grid">
      <CollectionCard
        v-for="collection in filtered"
        :key="collection.id"
        :collection="collection"
        :isOpen="activeCollectionId === collection.id"
        @toggle="toggleCollection(collection.id)"
      >
        <template #palettes>
          <PaletteList
            :palettes="collection.palettes"
            :collectionId="collection.id"
            @select="loadPalette"
          />
        </template>
      </CollectionCard>
    </div>

    <div v-else class="empty">No collections found</div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { usePaletteLibrary } from '@/composables/usePaletteLibrary';
import CollectionCard from './CollectionCard.vue';
import PaletteList from './PaletteList.vue';

const { collections, createCollection } = usePaletteLibrary();

const emit = defineEmits();

function loadPalette(palette) {
  emit('selectPalette', palette);
}

const search = ref('');
const favoritesOnly = ref(false);
const activeCollectionId = ref(null);

const filtered = computed(() => {
  const q = search.value.toLowerCase();
  return collections.value.filter((c) => {
    if (favoritesOnly.value && !c.favorite) return false;
    if (!q) return true;
    if (c.name.toLowerCase().includes(q)) return true;
    return c.palettes?.some(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });
});

function create() {
  const name = prompt('Collection name');
  if (!name) return;
  createCollection(name);
}

function toggleCollection(id) {
  activeCollectionId.value = activeCollectionId.value === id ? null : id;
}
</script>

<style scoped>
.collection-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 15px;
}

.toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search {
  flex: 1;
  height: 36px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: inherit;
}

.create {
  height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  background: #5325ebff;
  color: white;
  font-weight: 500;
}

.filters {
  font-size: 0.85rem;
  width: fit-content;

  background: var(--bg);
  border-radius: 10px;
  border: 1px solid var(--border);
  padding: 3px 10px;

  label {
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 4px;
    user-select: none;

    input[type='checkbox'] {
      border: 1px solid var(--border);
      border-radius: 99px;
      background: var(--bg);
      color: inherit;
    }
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}

.empty {
  text-align: center;
  opacity: 0.6;
  padding: 40px 0;
}
</style>

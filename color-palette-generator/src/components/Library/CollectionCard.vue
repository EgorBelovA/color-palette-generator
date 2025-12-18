<template>
  <div class="collection-card">
    <header class="header">
      <h3 class="title">{{ collection.name }}</h3>
      <button
        class="favorite"
        :class="{ active: collection.favorite }"
        @click.stop="toggleFavorite"
        title="Favorite"
      >
        ★
      </button>
      <button class="open-btn" @click="$emit('toggle')">
        {{ isOpen ? 'Close' : 'Open' }}
      </button>
    </header>

    <div v-if="isOpen" class="palettes-container">
      <slot name="palettes" />
    </div>

    <footer class="actions">
      <button class="danger" @click="removeCollection">
        Delete Collection
      </button>
    </footer>
  </div>
</template>

<script setup>
import { usePaletteLibrary } from '@/composables/usePaletteLibrary';

const props = defineProps({
  collection: Object,
  isOpen: Boolean,
});

const { deleteCollection, toggleCollectionFavorite } = usePaletteLibrary();

function removeCollection() {
  deleteCollection(props.collection.id);
}

function toggleFavorite() {
  toggleCollectionFavorite(props.collection.id);
}
</script>

<style scoped>
.collection-card {
  background: var(--bg);
  border-radius: 16px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid var(--border);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.collection-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.title {
  font-size: 1rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.favorite {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: #555;
}

.favorite.active {
  color: gold;
}

.open-btn {
  padding: 4px 10px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background: #2563eb;
  color: white;
}

.palettes-container {
  margin-top: 10px;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.actions .danger {
  background: #3f1d1d;
  color: #fecaca;
  border: none;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
}
</style>

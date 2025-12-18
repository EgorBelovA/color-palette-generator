<template>
  <div class="palette-item" @click="$emit('select', palette)">
    <div class="palette-header">
      <span class="palette-name">{{ palette.name }}</span>
      <div class="actions">
        <button @click.stop="$emit('toggleFavorite', palette.id)">
          <span v-if="palette.favorite">★</span>
          <span v-else>☆</span>
        </button>
        <button @click.stop="$emit('delete', palette.id)">🗑</button>
      </div>
    </div>
    <div class="palette-colors">
      <div
        v-for="(color, i) in palette.colors"
        :key="i"
        class="color-swatch"
        :style="{ background: color }"
      ></div>
    </div>
    <div class="palette-meta">
      <small>Base: {{ palette.baseColor }}</small>
      <small>Harmony: {{ palette.harmony }}</small>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  palette: Object,
});
</script>

<style scoped>
.palette-item {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--bg);
}

.palette-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.palette-name {
  font-weight: 600;
  font-size: 1rem;
}

.actions button {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  margin-left: 5px;
}

.palette-colors {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.palette-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  opacity: 0.7;
}
</style>

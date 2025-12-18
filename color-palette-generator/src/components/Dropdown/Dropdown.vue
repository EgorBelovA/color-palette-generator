<template>
  <div class="dropdown" ref="root">
    <button class="dropdown__trigger" @click="toggle" :aria-expanded="open">
      <span>{{ selectedLabel }}</span>
      <span class="arrow" :class="{ open }">▾</span>
    </button>

    <div v-if="open" class="dropdown__menu">
      <div
        v-for="item in items"
        :key="item.value"
        class="dropdown__item"
        :class="{ active: item.value === modelValue }"
        @click="select(item.value)"
      >
        {{ item.label }}
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

type Item = {
  label: string;
  value: string | number;
};

const props = defineProps<{
  items: Item[];
  modelValue: string | number;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void;
}>();

const open = ref(false);
const root = ref<HTMLElement | null>(null);

const selectedLabel = computed(() => {
  return (
    props.items.find((i) => i.value === props.modelValue)?.label ?? 'Select'
  );
});

function toggle() {
  open.value = !open.value;
}

function select(value: string | number) {
  emit('update:modelValue', value);
  open.value = false;
}

function onClickOutside(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) {
    open.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside);
});
</script>
<style scoped>
.dropdown {
  position: relative;
  width: 200px;
  font-family: inherit;
}

.dropdown__trigger {
  width: 100%;
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: 0.5px solid var(--border-color);
  background: var(--bg-button);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.arrow {
  transition: transform 0.2s;
}
.arrow.open {
  transform: rotate(180deg);
}

.dropdown__menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  width: 100%;
  background: var(--bg);
  border-radius: 8px;
  border: 0.5px solid var(--border-color);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  padding: 4px 0;
  z-index: 100;
}

.dropdown__item {
  padding: 8px 12px;
  cursor: pointer;
}

.dropdown__item:hover {
  /* background: #f3f4f6; */
}

.dropdown__item.active {
  /* background: #e5e7eb; */
  font-weight: 600;
}
</style>

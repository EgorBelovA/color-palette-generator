<template>
  <div
    ref="cardEl"
    @click="copyColor"
    class="card"
    :style="{ background: localColor, '--card-height': `${props.height}px` }"
  >
    <div class="card-content">
      <span class="code" :style="{ color: contrastColor }">{{
        localColor
      }}</span>

      <button class="edit-btn" @click="handleClick">Open MockUp</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useAccessibility } from '@/composables/useAccessibility';
import { useSnackbar } from '@/composables/useSnackbar';

const snackbar = useSnackbar();

const props = defineProps<{ color: string; height: number }>();
const emit = defineEmits<{
  (e: 'update', value: string): void;
  (e: 'click', pos: { x: number; y: number }): void;
}>();

const { wcag } = useAccessibility();
const localColor = ref(props.color);
const cardEl = ref<HTMLElement>();

const contrastColor = ref('#ffffff');

const result = computed(() =>
  wcag(localColor.value || '#ffffff', '#ffffff', 'normalText', 'AA')
);

defineExpose({
  $el: cardEl,
});

function handleClick(e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation();

  if (cardEl.value) {
    cardEl.value.classList.add('frozen');
    const rect = cardEl.value.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    emit('click', { x: centerX, y: centerY });
  }
}
function getContrastColor(bgColor: string) {
  const c = bgColor.substring(1);
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = rgb & 0xff;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 125 ? '#000000' : '#ffffff';
}

watch(localColor, (newVal) => {
  contrastColor.value = getContrastColor(newVal || '#ffffff');
  emit('update', newVal);
});

watch(
  () => props.color,
  (newVal) => {
    localColor.value = newVal;
  }
);

function copyColor() {
  navigator.clipboard
    .writeText(localColor.value || '')
    .then(() => {
      snackbar.success(`Copied ${localColor.value}`);
    })
    .catch(console.error);
}
</script>

<style scoped>
.card {
  width: 100%;
  padding: 12px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: space-between;
  color: #ffffff;
  font-weight: 500;
  cursor: pointer;
  transition: height 0.2s ease-in-out;
  overflow: hidden;
  height: var(--card-height);

  &:hover {
    height: calc(var(--card-height) * 1.5);
  }
}

.code {
  font-weight: 500;
  font-size: 1.5rem;
}

.bad {
  color: #dc2626;
  font-weight: 600;
}

.copy-btn {
  cursor: pointer;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  align-self: flex-start;
}

.edit-btn {
  cursor: pointer;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  align-self: flex-start;
  font-weight: 600;
  color: #ffffff;
}

.card:hover {
  /* height: 100px; */
  transition: height 0.2s ease-in-out;
}

.card.frozen {
  pointer-events: none;
}

.card-content {
  display: flex;
  justify-content: space-between;
}
</style>

<template>
  <div class="card" :style="{ background: localColor }">
    <span class="code">{{ localColor }}</span>
    <div class="mockup-input-container">
      <textarea
        @input="autoResize"
        ref="textarea"
        v-model="text"
        class="mockup-input"
        @keydown="limitLines"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        placeholder="Type something here..."
        >{{ localColor }}</textarea
      >
    </div>
    <small :class="{ bad: !result.passes }">
      <template v-if="result.passes">
        WCAG {{ result.level }} ({{ result.ratio }}:1)
      </template>
      <template v-else>
        Low contrast ({{ result.ratio }}:1, need ≥ {{ result.required }})
      </template>
    </small>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { useAccessibility } from '@/composables/useAccessibility';

const props = defineProps<{ color: string }>();
const emit = defineEmits<{ (e: 'update', value: string): void }>();

const { wcag } = useAccessibility();
const localColor = ref(props.color);

const result = computed(() =>
  wcag(localColor.value || '#ffffff', '#ffffff', 'normalText', 'AA')
);

watch(localColor, (newVal) => {
  emit('update', newVal);
});

watch(
  () => props.color,
  (newVal) => {
    localColor.value = newVal;
  }
);

const text = ref('');
const textarea = ref<HTMLTextAreaElement | null>(null);

function limitLines(e: KeyboardEvent) {
  if (!textarea.value) return;

  const el = textarea.value;
  const lines = el.value.split('\n').length;

  if (e.key === 'Enter' && lines >= 4) {
    e.preventDefault();
  }
}

function autoResize() {
  if (!textarea.value) return;

  const el = textarea.value;
  const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
  const maxHeight = lineHeight * 4;

  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px';
}

onMounted(() => {
  autoResize();
});
</script>

<style scoped>
.card {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  border-radius: var(--radius);
  background: #f3f4f6;
  color: #ffffff;
}

.code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    'Liberation Mono', 'Courier New', monospace;
}

.bad {
  color: #dc2626;
  font-weight: 600;
}

.mockup-input-container {
  width: 100%;
  margin: 15px 0;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.mockup-input {
  font-size: 2rem;
  font-weight: 600;
  height: auto;
  width: 100%;
  resize: none;
  overflow: hidden;
  line-height: 1.2;
  color: #ffffff;
}
</style>

<template>
  <section class="export">
    <div class="button-group">
      <button @click="set('css')">CSS</button>
      <button @click="set('scss')">SCSS</button>
      <button @click="set('tailwind')">Tailwind</button>
      <button @click="set('json')">JSON</button>
      <button @click="set('hex')">HEX</button>
      <button @click="set('hsl')">HSL</button>
      <button @click="set('oklch')">Oklch</button>
      <button @click="set('oklab')">Oklab</button>
    </div>
    <div class="output-container">
      <pre>{{ output }}</pre>
      <button class="copy-btn" @click="copyOutput" :disabled="!output">
        {{ isCopied ? 'Copied!' : 'Copy' }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { exportPalette } from '@/utils/export';
import { useSnackbar } from '@/composables/useSnackbar';

const props = defineProps({ palette: Array });
const output = ref('');
const isCopied = ref(false);
const snackbar = useSnackbar();

function set(type) {
  output.value = exportPalette(props.palette, type);
  isCopied.value = false;
}

async function copyOutput() {
  if (!output.value) return;
  try {
    await navigator.clipboard.writeText(output.value);
    isCopied.value = true;
    snackbar.success(`Copied ${output.value}`);
    setTimeout(() => (isCopied.value = false), 2000);
  } catch (err) {
    console.error('Copy failed:', err);
    fallbackCopy();
  }
}

function fallbackCopy() {
  const textArea = document.createElement('textarea');
  textArea.value = output.value || '';
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  document.execCommand('copy');
  textArea.remove();

  isCopied.value = true;
  snackbar.success('Copied to clipboard! 📋');
  setTimeout(() => (isCopied.value = false), 2000);
}

watch(
  () => props.palette,
  () => (output.value = exportPalette(props.palette, 'css')),
  { deep: true }
);

onMounted(() => {
  if (props.palette?.length) {
    output.value = exportPalette(props.palette, 'css');
  }
});
</script>

<style scoped>
.export {
  max-width: 100%;
  overflow: hidden;
  flex-shrink: 0;
  margin-top: 20px;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  max-width: 100%;
  overflow-x: auto;
}

.export button {
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: var(--bg-button);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  border-bottom: 1px solid var(--border-color);

  &:active {
    transform: scale(0.98);
  }
}

.output-container {
  position: relative;
}

.export pre {
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: var(--radius);
  margin: 0 0 0.5rem 0;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
  border: 2px solid rgba(0, 0, 0, 0.1);
}

.copy-btn {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-btn:active {
  transform: scale(0.98);
}
</style>

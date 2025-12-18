<template>
  <section class="palette-picker" ref="container">
    <div class="canvas-wrapper">
      <canvas
        ref="canvas"
        @mousedown="startPicking"
        @mousemove="pickColor"
        @mouseup="stopPicking"
        @touchstart="startPicking"
        @touchmove="pickColor"
        @touchend="stopPicking"
      ></canvas>
      <div
        class="pointer"
        :style="{
          left: pointerX + 'px',
          top: pointerY + 'px',
          background: currentColor,
        }"
      ></div>
    </div>

    <input
      type="range"
      min="0"
      max="360"
      v-model="hue"
      @input="onHueChange"
      class="hue-slider"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const canvas = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);
const container = ref<HTMLElement | null>(null);

const hue = ref(0);
const sat = ref(1);
const val = ref(1);
const currentColor = ref(props.modelValue || '#FF0000');

const palette = ref<string[]>([]);

let picking = false;
let dpr = window.devicePixelRatio || 1;

const pointerX = ref(1);
const pointerY = ref(0);

function HSVtoRGB(h: number, s: number, v: number) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0,
    g = 0,
    b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function RGBtoHSV(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }

  return {
    h: h < 0 ? h + 360 : h,
    s: max === 0 ? 0 : d / max,
    v: max,
  };
}

function resizeCanvas() {
  if (!canvas.value || !container.value) return;
  const rect = container.value.getBoundingClientRect();

  const logicalSize = canvas.value.clientWidth || rect.width;
  const size = Math.max(1, Math.round(logicalSize));

  canvas.value.width = size * dpr;
  canvas.value.height = size * dpr;

  canvas.value.style.width = `${size}px`;
  canvas.value.style.height = `${size}px`;

  ctx.value?.resetTransform();
  drawCanvas();
}

function drawCanvas() {
  if (!ctx.value || !canvas.value) return;

  const w = canvas.value.width;
  const h = canvas.value.height;
  const img = ctx.value.createImageData(w, h);

  for (let y = 0; y < h; y++) {
    const v = 1 - y / (h - 1 || 1);
    for (let x = 0; x < w; x++) {
      const s = x / (w - 1 || 1);
      const { r, g, b } = HSVtoRGB(hue.value, s, v);
      const i = (y * w + x) * 4;
      img.data[i] = r;
      img.data[i + 1] = g;
      img.data[i + 2] = b;
      img.data[i + 3] = 255;
    }
  }

  ctx.value.putImageData(img, 0, 0);
}

function startPicking(e: MouseEvent | TouchEvent) {
  picking = true;

  window.addEventListener('mousemove', pickColor);
  window.addEventListener('mouseup', stopPicking);

  window.addEventListener('touchmove', pickColor, { passive: false });
  window.addEventListener('touchend', stopPicking);

  pickColor(e);
}

function stopPicking() {
  picking = false;

  window.removeEventListener('mousemove', pickColor);
  window.removeEventListener('mouseup', stopPicking);

  window.removeEventListener('touchmove', pickColor);
  window.removeEventListener('touchend', stopPicking);
}

function pickColor(e: MouseEvent | TouchEvent) {
  if (!picking || !canvas.value) return;

  let clientX = 0;
  let clientY = 0;

  if (e instanceof MouseEvent) {
    clientX = e.clientX;
    clientY = e.clientY;
  } else if (e instanceof TouchEvent) {
    e.preventDefault();
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  }

  const rect = canvas.value.getBoundingClientRect();
  const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
  const y = Math.min(Math.max(clientY - rect.top, 0), rect.height);

  sat.value = x / rect.width;
  val.value = 1 - y / rect.height;
  pointerX.value = x;
  pointerY.value = y;
  updateColor();
}

let hueTimeout: ReturnType<typeof setTimeout>;

function drawCanvasDebounced() {
  clearTimeout(hueTimeout);
  hueTimeout = setTimeout(() => drawCanvas(), 16);
}

function onHueChange() {
  drawCanvasDebounced();
  updateColor();

  if (canvas.value) {
    pointerX.value = sat.value * canvas.value.clientWidth;
    pointerY.value = (1 - val.value) * canvas.value.clientHeight;
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (x: number) => x.toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function updateColor(newColor?: string) {
  if (newColor) {
    currentColor.value = newColor;
  } else {
    const { r, g, b } = HSVtoRGB(hue.value, sat.value, val.value);
    currentColor.value = rgbToHex(r, g, b);
  }
  emit('update:modelValue', currentColor.value);
}

function addColor() {
  if (!palette.value.includes(currentColor.value))
    palette.value.push(currentColor.value);
}

function removeColor(i: number) {
  palette.value.splice(i, 1);
}

watch(
  () => props.modelValue,
  (newColor) => {
    if (!newColor) return;
    currentColor.value = newColor;

    let r = 255,
      g = 0,
      b = 0;

    if (newColor.startsWith('#')) {
      const hex = newColor.replace('#', '');
      const h =
        hex.length === 3
          ? hex
              .split('')
              .map((ch) => ch + ch)
              .join('')
          : hex;
      r = parseInt(h.slice(0, 2), 16);
      g = parseInt(h.slice(2, 4), 16);
      b = parseInt(h.slice(4, 6), 16);
    } else {
      [r, g, b] = newColor.match(/\d+/g)?.map(Number) ?? [255, 0, 0];
    }

    const hsv = RGBtoHSV(r, g, b);
    hue.value = hsv.h;
    sat.value = hsv.s;
    val.value = hsv.v;

    if (canvas.value) {
      pointerX.value = sat.value * canvas.value.clientWidth;
      pointerY.value = (1 - val.value) * canvas.value.clientHeight;
    }

    drawCanvas();
  },
  { immediate: true }
);

onMounted(() => {
  ctx.value = canvas.value!.getContext('2d');
  resizeCanvas();
  new ResizeObserver(resizeCanvas).observe(container.value!);
  window
    .matchMedia(`(resolution: ${dpr}dppx)`)
    .addEventListener('change', () => {
      dpr = window.devicePixelRatio || 1;
      resizeCanvas();
    });
});
</script>

<style scoped>
.palette-picker {
  display: flex;
  flex-direction: column;
  max-width: 300px;
  width: 100%;
}

canvas {
  width: 100%;
  cursor: crosshair;
  border-radius: 15px 13px / 13px 15px;
  /* border: 1px solid #ccc; */

  &:active {
    cursor: none;
  }
}

.selected {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.current-color {
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
  text-align: center;
  min-width: 60px;
  /* border: 1px solid #ccc; */
}

.palette {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.palette-color {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60px;
  padding: 0.25rem;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
}

.palette-color button {
  font-size: 10px;
  margin-top: 2px;
}
.hue-slider {
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 10px;
  border-radius: 999px;
  border: none;
  padding: 0;
  margin-top: 15px;
  cursor: ew-resize;

  background: linear-gradient(
    to right,
    #ff0000 0%,
    #ffff00 17%,
    #00ff00 33%,
    #00ffff 50%,
    #0000ff 67%,
    #ff00ff 83%,
    #ff0000 100%
  );
}

.hue-slider::-webkit-slider-runnable-track {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
}
.hue-slider::-moz-range-track {
  background: transparent;
}

.hue-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3);
  background: transparent;
  cursor: ew-resize;
}
.hue-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3);
  background: #000;
  cursor: pointer;
}

.pointer {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
  transform: translate(-50%, -50%);
  pointer-events: none;
  cursor: none;
}
.canvas-wrapper {
  position: relative;
}
</style>

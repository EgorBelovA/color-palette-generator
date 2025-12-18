<template>
  <section class="panel">
    <div class="picker-export-container">
      <div class="picker-container">
        <ColorPalettePicker v-model="baseColor" />
        <div class="baseColorContainer">
          <input
            class="baseColorInput"
            v-model="baseColor"
            placeholder="HEX"
            inputmode="text"
            maxlength="7"
            spellcheck="false"
          />
        </div>
        <div class="colorPreviewContainer">
          <div class="baseColorPreviewContainer">
            <div
              class="baseColorPreview"
              :style="{ background: baseColor }"
            ></div>
            <div class="colorName">{{ colorName }}</div>
          </div>
          <div class="accents">
            <span>Accent Colors</span>
            <div class="accentsContainer">
              <div
                v-for="c in accents"
                :key="c"
                class="accent"
                :style="{ background: c }"
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div class="palette" ref="paletteContainer">
        <PaletteCard
          v-for="(c, i) in palette"
          :key="i"
          :color="c"
          :height="cardHeight"
          @update="updateColor(i, $event)"
          @click="openModal($event, i)"
        />
      </div>
    </div>

    <div class="controls-container">
      <div class="controls">
        <button ref="generateBtn" @click="onGenerate" class="generate-btn">
          <span class="generate-btn__text">Random Color</span>
        </button>
        <Dropdown v-model="harmony" :items="harmonies" />

        <Dropdown
          v-if="showCountSelect"
          v-model="count"
          :items="countOptions"
        />

        <Dropdown v-model="mood" :items="moods" />
      </div>

      <div class="controls-collection">
        <Dropdown
          v-model="selectedCollectionId"
          :items="collections.map((c) => ({ label: c.name, value: c.id }))"
        />
        <button @click="saveCurrentPalette" class="save-btn">
          Save to Collection
        </button>
      </div>
    </div>

    <ExportPanel :palette="palette" />

    <CollectionList @selectPalette="onPaletteSelect" />

    <div v-if="isModalOpen" class="backdrop" @click.self="closeModal">
      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        :style="{
          '--origin-x': `${modalStartPos.x}px`,
          '--origin-y': `${modalStartPos.y}px`,
        }"
      >
        <ColorPreviewCard :color="activeColor" @update="onModalColorUpdate" />
        <button class="close-btn" @click="closeModal">×</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { usePalette } from '@/composables/usePalette';
import {
  generateHarmony,
  harmonyPresets,
  type Harmony,
} from '@/composables/useHarmony';
import { useStorage } from '@/composables/useStorage';
import ColorPreviewCard from './ColorPreviewCard.vue';

import PaletteCard from './PaletteCard.vue';
import ExportPanel from '@/components/Export/ExportPanel.vue';
import ColorPalettePicker from '@/components/ColorPalettePicker/ColorPalettePicker.vue';
import Dropdown from '@/components/Dropdown/Dropdown.vue';
import { useRoute, useRouter } from 'vue-router';
import CollectionList from '@/components/Library/CollectionList.vue';

const route = useRoute();
const router = useRouter();

import { ref, onMounted, watch, computed, nextTick } from 'vue';

function randomInRange([min, max]: [number, number]) {
  return min + Math.random() * (max - min);
}

function generateBaseColorByMood(mood: Mood) {
  const preset = moodPresets[mood];

  const h = Math.random() * 360;
  const s = randomInRange(preset.saturation);
  const v = randomInRange(preset.value);

  return HSVtoHex(h, s, v);
}

const appState = ref({
  palette: [] as string[],
  baseColor: '#FF0000',
  harmony: 'analogous',
  count: 3,
});

const generateBtn = ref<HTMLButtonElement | null>(null);

function onGenerate() {
  generate();

  const btn = generateBtn.value;
  if (!btn) return;

  btn.classList.remove('spin-once');
  void btn.offsetWidth;
  btn.classList.add('spin-once');
}

const { palette, setPalette, updateColor } = usePalette();
const { load, save: persist } = useStorage('colorAppState');

const paletteContainer = ref<HTMLElement>();

const cardHeight = computed(() => {
  if (paletteContainer.value) {
    const containerHeight = paletteContainer.value.clientHeight;
    return containerHeight / count.value;
  }
  return 0;
});

const harmony = ref<Harmony>('analogous');
const baseColor = ref('#FF0000');

const count = ref(3);

const isModalOpen = ref(false);
const activeColor = ref<string | null>(null);
const activeIndex = ref<number | null>(null);

const colorCards = ref<HTMLElement[]>([]);

const modalStartPos = ref({ x: 0, y: 0 });

function openModal(pos: { x: number; y: number }, index: number) {
  modalStartPos.value = pos;
  activeColor.value = palette.value[index];
  activeIndex.value = index;
  isModalOpen.value = true;

  nextTick(() => {
    const modal = document.querySelector('.modal') as HTMLElement;
    const backdrop = document.querySelector('.backdrop') as HTMLElement;

    backdrop?.classList.add('animate');

    requestAnimationFrame(() => {
      modal?.classList.add('show');
      requestAnimationFrame(() => {
        modal?.classList.add('expand');
      });
    });
  });
}

function closeModal() {
  const modal = document.querySelector('.modal') as HTMLElement;
  const backdrop = document.querySelector('.backdrop') as HTMLElement;

  modal?.classList.remove('show', 'expand');
  backdrop?.classList.remove('animate');

  const frozenCard = document.querySelector('.card.frozen');
  frozenCard?.classList.remove('frozen');

  setTimeout(() => {
    isModalOpen.value = false;
  }, 400);
}

function onModalColorUpdate(newColor: string) {
  activeColor.value = newColor;
  if (activeIndex.value !== null) {
    updateColor(activeIndex.value, newColor);
  }
}

watch(harmony, (newHarmony) => {
  const preset = harmonyPresets[newHarmony as Harmony];
  const defaultCount = Array.isArray(preset) ? preset[0] : preset;
  if (!Array.isArray(preset) || !preset.includes(count.value)) {
    count.value = defaultCount;
  }
});

watch(count, (newCount) => {
  const preset = harmonyPresets[harmony.value as Harmony];
  if (Array.isArray(preset) && !preset.includes(newCount)) {
    count.value = (preset as number[])[0];
  }
});

function encodePalette(colors: string[]) {
  return colors.map((c) => c.replace('#', '')).join('-');
}

function decodePalette(str: string) {
  return str.split('-').map((c) => `#${c}`);
}

watch(
  [palette, baseColor, harmony, count],
  () => {
    router.replace({
      query: {
        b: baseColor.value.replace('#', ''),
        h: harmony.value,
        c: String(count.value),
        p: encodePalette(palette.value),
      },
    });
  },
  { deep: true }
);

const showCountSelect = computed(() =>
  Array.isArray(harmonyPresets[harmony.value as Harmony])
);

const availableCounts = computed(() => {
  const preset = harmonyPresets[harmony.value as Harmony];
  return Array.isArray(preset) ? preset : [preset];
});

watch(
  [palette, baseColor, harmony, count],
  () => {
    appState.value.palette = palette.value;
    appState.value.baseColor = baseColor.value;
    appState.value.harmony = harmony.value;
    appState.value.count = count.value;
    persist(appState.value);
  },
  { deep: true, flush: 'post' }
);

watch([baseColor, harmony, count], () => {
  setPalette(
    generateHarmony({
      baseColor: baseColor.value,
      harmony: harmony.value,
      count: count.value,
    })
  );
});

function randomColor(): string {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  const toHex = (x: number) => x.toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function HSVtoHex(h: number, s: number, v: number): string {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, '0')
      .toUpperCase();

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function clamp(v: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, v));
}

function getAccentColor(hex: string): string {
  const { h, s, v } = RGBtoHSV(
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16)
  );

  const accentHue = (h + 180) % 360;
  const accentSat = clamp(Math.max(s, 0.7));
  const accentVal = clamp(Math.max(v, 0.75));

  return HSVtoHex(accentHue, accentSat, accentVal);
}

function onPaletteSelect(palette: any) {
  baseColor.value = palette.baseColor;
  harmony.value = palette.harmony;
  count.value = palette.count;
  setPalette(palette.colors);
}

function getAccentColors(hex: string) {
  return [
    getAccentColor(hex),
    HSVtoHex((RGBtoHSVHex(hex).h + 120) % 360, 0.8, 0.85),
  ];
}

type Mood = 'calm' | 'energetic' | 'professional';

const moods = [
  { label: 'Calm', value: 'calm' },
  { label: 'Energetic', value: 'energetic' },
  { label: 'Professional', value: 'professional' },
];

const harmonies = [
  { label: 'Monochromatic', value: 'monochromatic' },
  { label: 'Analogous', value: 'analogous' },
  { label: 'Complementary', value: 'complementary' },
  { label: 'Triadic', value: 'triadic' },
  { label: 'Tetradic', value: 'tetradic' },
];

const countOptions = computed(() =>
  availableCounts.value.map((n) => ({
    label: `${n} colors`,
    value: n,
  }))
);

const moodPresets = {
  calm: {
    saturation: [0.2, 0.5],
    value: [0.7, 1],
    harmony: ['analogous', 'monochromatic'],
  },
  energetic: {
    saturation: [0.7, 1],
    value: [0.7, 1],
    harmony: ['complementary', 'triadic'],
  },
  professional: {
    saturation: [0.2, 0.6],
    value: [0.4, 0.8],
    harmony: ['analogous', 'tetradic'],
  },
} as const;

const mood = ref<Mood>('calm');

function generate() {
  const base =
    mood.value === 'calm' ||
    mood.value === 'energetic' ||
    mood.value === 'professional'
      ? generateBaseColorByMood(mood.value)
      : randomColor();

  baseColor.value = base;

  const allowedHarmonies = moodPresets[mood.value].harmony;
  harmony.value = allowedHarmonies[
    Math.floor(Math.random() * allowedHarmonies.length)
  ] as Harmony;
}

onMounted(() => {
  const { b, h, c, p } = route.query;

  if (b && h && c) {
    baseColor.value = `#${b}`;
    harmony.value = h as Harmony;
    count.value = Number(c);

    if (p && typeof p === 'string') {
      setPalette(decodePalette(p));
    } else {
      setPalette(
        generateHarmony({
          baseColor: baseColor.value,
          harmony: harmony.value,
          count: count.value,
        })
      );
    }
    return;
  }

  const stored = load();
  if (stored) {
    setPalette(stored.palette);
    baseColor.value = stored.baseColor;
    harmony.value = stored.harmony;
    count.value = stored.count;
  } else {
    generate();
  }
});

let lastTimeout: ReturnType<typeof setTimeout> | null = null;
let controller: AbortController | null = null;

function fetchColorName(hex: string): Promise<any> {
  return new Promise((resolve, reject) => {
    if (lastTimeout) clearTimeout(lastTimeout);

    lastTimeout = setTimeout(async () => {
      if (controller) controller.abort();
      controller = new AbortController();

      try {
        const res = await fetch(
          `https://www.thecolorapi.com/id?hex=${hex.replace('#', '')}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        resolve(data);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Previous request aborted');
        }
        reject(err);
      }
    }, 300);
  });
}

const colorName = ref<string | null>(null);

watch(
  baseColor,
  async (hex) => {
    try {
      const data = await fetchColorName(hex);
      colorName.value = data.name.value;
    } catch (e) {
      colorName.value = null;
    }
  },
  { immediate: true }
);

function RGBtoHSV(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = 60 * (((g - b) / delta) % 6);
    else if (max === g) h = 60 * ((b - r) / delta + 2);
    else h = 60 * ((r - g) / delta + 4);
  }
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return { h, s, v };
}

function RGBtoHSVHex(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return RGBtoHSV(r, g, b);
}

const accents = computed(() => {
  if (!palette.value.length) return [];

  const base = palette.value[Math.floor(palette.value.length / 2)];
  return getAccentColors(base);
});

import { usePaletteLibrary } from '@/composables/usePaletteLibrary';
const { collections, addPalette } = usePaletteLibrary();

const selectedCollectionId = ref<string | null>(null);

function saveCurrentPalette() {
  if (!selectedCollectionId.value) {
    return;
  }

  const newPalette = {
    name: colorName.value || 'Untitled Palette',
    colors: palette.value,
    baseColor: baseColor.value,
    harmony: harmony.value,
    count: count.value,
    tags: [],
  };

  addPalette(selectedCollectionId.value, newPalette);
}
</script>

<style scoped>
.panel {
  border-radius: var(--radius);
  max-width: 1280px;
  margin: 0 auto;
  padding: 10px;
  position: relative;
  z-index: 0;
}
.controls-container {
  margin-top: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}
.controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}
.count-select {
  min-width: 80px;
}
.palette {
  display: flex;
  align-items: center;
  flex-direction: column;
  border-radius: var(--radius);
  overflow: hidden;
  width: 100%;
  height: 400px;
}
.picker-export-container {
  display: grid;
  gap: 20px;
  grid-template-columns: 300px 1fr;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  z-index: 50;
  transition: background 0.3s ease-out;
  user-select: none;
}

.backdrop.animate {
  background: rgba(0, 0, 0, 0.5);
}

.modal {
  position: fixed;
  width: min(90%, 600px);
  aspect-ratio: 1 / 1;
  max-width: 340px;

  left: var(--origin-x, 50%);
  top: var(--origin-y, 50%);
  background: #111827;
  border-radius: 12px;
  display: flex;

  box-shadow: 0 25px 60px rgba(29, 25, 25, 0.4);

  transform: translate(-50%, -50%) scale(0.2);
  opacity: 0;

  transition: all 0.3s;
}

.modal.show {
  opacity: 0.9;
  transform: translate(-50%, -50%) scale(0.6);
}

.modal.expand {
  left: 50% !important;
  top: 50% !important;
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
}

.close-btn {
  position: absolute;
  top: 6px;
  right: 8px;
  border: none;
  background: transparent;
  color: #e5e7eb;
  font-size: 18px;
  cursor: pointer;
}
.baseColorPreview {
  width: 50px;
  height: 50px;
  border-radius: 33% 66% 70% 30% / 40% 45% 55% 60%;
  flex-shrink: 0;
}

@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

.generate-btn {
  width: 200px;
  height: 36px;
  position: relative;
  border: none;
  border-radius: 8px;
  /* background: #fffff; */
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s ease-out;
}

.generate-btn::before,
.generate-btn::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: inherit;
  background-image: conic-gradient(
    from var(--angle),
    transparent 0%,
    transparent 25%,
    var(--button-active-border) 25%,
    var(--button-active-border) 50%,
    transparent 50%,
    transparent 75%,
    var(--button-active-border) 75%,
    var(--button-active-border) 100%
  );

  z-index: -1;
  /* opacity: 0; */
}

.generate-btn::before {
  filter: blur(1px);
}

.generate-btn__text {
  font-size: 1.125rem;
  color: #6d0e3f;
  background-image: linear-gradient(45deg, #6d0e3f, #e36ca0 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.generate-btn.spin-once::before,
.generate-btn.spin-once::after {
  opacity: 1;
  animation: spin 0.4s linear 1 forwards;
}

@keyframes spin {
  from {
    --angle: 0deg;
  }
  to {
    --angle: 180deg;
  }
}
.picker-container {
  width: 300px;
}

.baseColorContainer {
  width: 100%;
  height: 50px;
  background: var(--bg);
  padding: 0 15px;
  overflow: hidden;
  font-size: 1.25rem;
  border-radius: 20px;
  border: 0.5px solid var(--border);
  margin-top: 15px;
}

.colorPreviewContainer {
  display: flex;
  justify-content: space-between;
  max-width: 100%;
  overflow: hidden;
  margin-top: 15px;
}

.accent {
  width: 100%;
  height: 30px;
  border-radius: 7px;
}
.accents {
  display: flex;
  flex-direction: column;
}
.accentsContainer {
  display: flex;
  gap: 7px;
}
.baseColorPreviewContainer {
  display: flex;
  align-items: center;
  gap: 7px;
  max-width: 200px;
}
.colorName {
  font-weight: 500;
  font-size: 1.25rem;
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 1;
  min-width: 0;
  padding-right: 5px;
}

.save-btn {
  border: 2px solid var(--border-color);
  height: 36px;
  width: 200px;
  position: relative;
  border-radius: 8px;
  font-weight: 600;
  transition: background 0.3s ease-out;
}
.controls-collection {
  display: flex;
  flex-direction: row;
  gap: 10px;
  flex-wrap: wrap;
}
</style>

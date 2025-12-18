import { ref } from 'vue';

export function usePalette() {
  const palette = ref<string[]>([]);

  function setPalette(colors: string[]) {
    palette.value = colors;
  }

  function updateColor(index: number, color: string) {
    palette.value[index] = color;
  }

  return { palette, setPalette, updateColor };
}

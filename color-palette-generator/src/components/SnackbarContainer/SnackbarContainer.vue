<template>
  <div class="snackbar-container">
    <TransitionGroup name="snackbar-stack" tag="div" class="stack">
      <div
        v-for="(message, index) in [...messages].slice(-7).reverse()"
        :key="message.id"
        class="snackbar"
        :class="`snackbar--${message.type}`"
        :style="stackStyle(index)"
      >
        <div class="snackbar__text">
          {{ message.text }}
        </div>
        <button class="snackbar__close" @click="remove(message.id)">×</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useSnackbar } from '@/composables/useSnackbar';

const { messages, remove } = useSnackbar();

function stackStyle(index: number) {
  const GAP = 20;
  const SCALE_STEP = 0.07;
  const OPACITY_STEP = 0.15;

  return {
    transform: `
      translateY(-${index * GAP}px)
      scale(${1 - index * SCALE_STEP})
    `,
    opacity: 1 - index * OPACITY_STEP,
    zIndex: 100 - index,
    pointerEvents: index === 0 ? 'auto' : 'none',
  };
}
</script>

<style scoped>
.stack {
  position: relative;
  display: flex;
  justify-content: center;
}

.snackbar-container {
  position: fixed;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
  z-index: 10000;
  width: auto;
  max-width: 420px;
}

.snackbar {
  position: absolute;
  bottom: 0;
  padding: 16px 20px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  width: fit-content;
  max-width: 420px;
  min-width: 0;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
  transform-origin: bottom center;
  transform-style: preserve-3d;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease;

  width: fit-content;
  white-space: normal;
}

.snackbar__text {
  flex: 1;
  min-width: 0;
  max-width: calc(420px - 48px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.snackbar__close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.snackbar__close:hover {
  opacity: 1;
}

.snackbar--success {
  background: linear-gradient(135deg, #10b981, #059669);
}
.snackbar--error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}
.snackbar--info {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}
.snackbar--warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.snackbar-stack-enter-active {
  animation: slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.snackbar-stack-leave-active {
  animation: slideDown 0.3s ease forwards;
}

@keyframes slideUp {
  from {
    transform: translateY(100%) scale(0);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  to {
    transform: translateY(100%) scale(0);
    opacity: 0;
  }
}
</style>

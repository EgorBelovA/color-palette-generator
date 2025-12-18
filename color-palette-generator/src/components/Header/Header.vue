<template>
  <div class="title_container">
    <div class="title__main">
      <span class="title__logo"><img src="/favicon.ico" /></span>
      <div class="title__content">
        <div class="title__text">palette lab</div>

        <nav class="title__nav desktop-nav">
          <router-link to="/palette">palette</router-link>
        </nav>

        <div class="nav-dropdown mobile-dropdown" ref="navRoot">
          <button class="nav-trigger" @click="toggle">
            <span class="arrow" :class="{ open }">▾</span>
          </button>

          <div v-if="open" class="nav-menu">
            <router-link to="/palette" @click="close">palette</router-link>
          </div>
        </div>
      </div>
      <div class="theme-toggle">
        <button @click="toggleTheme" class="theme-toggle">
          <template v-if="theme === 'light'">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
              <path
                fill="currentColor"
                fill-rule="evenodd"
                d="M489.493 111.658c30.658-1.792 45.991 36.44 22.59 56.329C457.831 214.095 426 281.423 426 354c0 134.757 109.243 244 244 244c72.577 0 139.905-31.832 186.014-86.084c19.868-23.377 58.064-8.102 56.332 22.53C900.4 745.823 725.141 912 512.5 912C291.31 912 112 732.69 112 511.5c0-211.39 164.287-386.024 374.198-399.649l.206-.013zm-81.143 79.75l-4.112 1.362C271.1 237.943 176 364.092 176 511.5C176 697.344 326.656 848 512.5 848c148.28 0 274.938-96.192 319.453-230.41l.625-1.934l-.11.071c-47.18 29.331-102.126 45.755-159.723 46.26L670 662c-170.104 0-308-137.896-308-308c0-58.595 16.476-114.54 46.273-162.467z"
              />
            </svg>
          </template>
          <template v-else>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-width="2"
              >
                <path
                  d="M12 3V2m0 20v-1m9-9h1M2 12h1m15.5-6.5L20 4M4 20l1.5-1.5M4 4l1.5 1.5m13 13L20 20"
                />
                <circle cx="12" cy="12" r="4" />
              </g>
            </svg>
          </template>
        </button>
      </div>
    </div>
  </div>

  <router-view />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref, onMounted, onBeforeUnmount } from 'vue';
const route = useRoute();

const open = ref(false);
const navRoot = ref<HTMLElement | null>(null);

function toggle() {
  open.value = !open.value;
}

function close() {
  open.value = false;
}

function onClickOutside(e: MouseEvent) {
  if (navRoot.value && !navRoot.value.contains(e.target as Node)) {
    open.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside);
});

const theme = ref<'light' | 'dark'>(
  (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
);

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme.value);
  localStorage.setItem('theme', theme.value);
}

onMounted(() => {
  document.documentElement.setAttribute('data-theme', theme.value);
});
</script>

<style scoped>
.title_container {
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  color: var(--text);
}
.title__main {
  width: 100%;
  max-width: 1280px;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 10px;

  .title__content {
    display: flex;
    align-items: center;
    gap: 10px;

    .title__text {
      white-space: nowrap;
      font-size: 2rem;
      font-weight: 600;
      line-height: 1;
    }

    a {
      all: unset;
      font-size: 1.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
        text-decoration-thickness: 2px;
      }
    }
  }

  .title__logo {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: flex-end;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}
.nav-dropdown {
  position: relative;
}

.nav-trigger {
  all: unset;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 1.5rem;
  cursor: pointer;
}

.arrow {
  transition: transform 0.2s ease;
}
.arrow.open {
  transform: rotate(180deg);
}

.nav-menu {
  position: absolute;
  top: 120%;
  left: 0;
  min-width: 120px;
  backdrop-filter: blur(5px);
  border-bottom: 1px solid var(--border);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 20;
  width: 100%;
}

.nav-menu a {
  all: unset;
  border-radius: 6px;
  cursor: pointer;
}

.nav-menu a:hover {
  background: rgba(255, 255, 255, 0.06);
}

.desktop-nav {
  display: flex;
  gap: 10px;
}
.mobile-dropdown {
  width: 100%;
  display: none;
}

@media (max-width: 600px) {
  .desktop-nav {
    display: none;
  }
  .mobile-dropdown {
    display: block;
    width: 100%;
  }

  .nav-dropdown .nav-menu {
    animation: slide-in-top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
    position: fixed;
    top: 100%;
    padding: 5px;
    left: 0;
    right: 0;
    border-bottom: 1px solid var(--border);
    backdrop-filter: blur(5px);
    border-radius: 0 0 8px 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
}
@keyframes slide-in-top {
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.theme-toggle button {
  all: unset;
  cursor: pointer;
  height: 20px;
  font-size: 1.25rem;
  padding: 6px 12px;
  border-radius: 6px;
  transition: background 0.3s, color 0.3s;
}
</style>

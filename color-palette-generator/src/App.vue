<template>
  <main class="app">
    <div class="background-pattern"></div>
    <Header />
    <SnackbarContainer />
  </main>
</template>

<script setup>
import SnackbarContainer from './components/SnackbarContainer/SnackbarContainer.vue';
import Header from './components/Header/Header.vue';
</script>

<style scoped>
.app {
  min-height: 100vh;
}
.background-pattern {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.3;
  transition: all 0.3s ease-in-out;
  background: linear-gradient(
        135deg,
        var(--bg-pattern-color1) 25%,
        transparent 25%
      ) -40px 0/80px 80px,
    linear-gradient(225deg, var(--bg-pattern-color2) 25%, transparent 25%) -40px
      0/80px 80px,
    linear-gradient(315deg, var(--bg-pattern-color1) 25%, transparent 25%) 0 0/80px
      80px,
    linear-gradient(
        45deg,
        var(--bg-pattern-color1) 25%,
        var(--bg-pattern-color3) 25%
      )
      0 0/80px 80px;
  background-color: var(--bg-color);
  transition: background-color 0.5s ease, --bg-pattern-color1 0.5s ease,
    --bg-pattern-color2 0.5s ease, --bg-pattern-color3 0.5s ease;
}
</style>

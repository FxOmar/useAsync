<script setup lang="ts">
import HelloWorld from "./components/HelloWorld.vue";
</script>

<template>
  <Suspense>
    <HelloWorld />
    <template #fallback> Loading... </template>
  </Suspense>
</template>

<style scoped></style>

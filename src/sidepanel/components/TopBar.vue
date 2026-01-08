<template>
  <div class="top-container">
    <slot> </slot>
  </div>
</template>
<script setup>
import { defineComponent } from 'vue';

defineComponent({
  name: 'TopBar',
});
</script>

<style scoped>
.top-container {
  z-index: 1000;
  position: sticky;
  background-color: #393939;
  top: 0;
  border-bottom: 1px solid #ccc;
  transition: background-color 0.2s ease;
}

.top-container:hover {
  background-color: #4a4a4a; /* Lightened solid color */
}
</style>

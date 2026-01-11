<template>
  <button :class="props.primary ? 'primary' : 'neutral'" @click="onClick" :disabled="disabled">
    {{ label }}
  </button>
</template>

<script setup>
defineOptions({
  name: 'ButtonStyled',
});
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  primary: {
    type: Boolean,
    default: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['click']);
function onClick(event) {
  emit('click', event);
}
</script>

<style scoped>
button {
  width: 100%;
  padding: 12px 20px;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  transition: all 0.2s ease;
}

button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(225, 85, 0, 0.2);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

button:disabled:hover {
  transform: none;
}
.primary {
  background-color: #ea580c;
  box-shadow: 0 2px 4px rgba(225, 85, 0, 0.2);
}
.primary:hover {
  background-color: #f97316;
  box-shadow: 0 4px 8px rgba(225, 85, 0, 0.3);
}
.primary:disabled:hover {
  background-color: #ea580c;
}
.neutral {
  background-color: #52525b; /* zinc-600 - more muted */
  box-shadow: 0 2px 4px rgba(82, 82, 91, 0.2);
}
.neutral:hover {
  background-color: #9ca3af;
  box-shadow: 0 4px 8px rgba(90, 86, 84, 0.3);
}
.neutral:active {
  box-shadow: 0 2px 4px rgba(90, 86, 84, 0.2);
}
.neutral:disabled:hover {
  background-color: #5a5654;
}
.neutral:disabled:hover {
  background-color: #5a5654;
}
</style>

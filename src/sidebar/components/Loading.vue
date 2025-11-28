<template>

    <div class="loader-wrapper" :style="{ height: sizeCircle, width: sizeCircle }" v-if="isActiveCircle">
      <div class="loader" :style="{ height: sizeCircle, width: sizeCircle }"></div>
    </div>
     <slot name="additional-info"></slot>
    <p class="state" :style="{ fontSize: sizeStateText }">{{ message }}</p>
    
    <div class="progress-dots" v-if="isActiveDots">
      <div class="dot dot-1" :style="{ height: sizeDots, width: sizeDots }"></div>
      <div class="dot dot-2" :style="{ height: sizeDots, width: sizeDots }"></div>
      <div class="dot dot-3" :style="{ height: sizeDots, width: sizeDots }"></div>
    </div>

    <slot name="buttons"></slot>
</template>

<script>
export default {
  name: 'LoadingState',
  props: {
    message: {
      type: String,
      default: 'Loading...'
    },
    isActiveCircle: {
      type: Boolean,
      default: true
    },
    sizeCircle: {
      type: String,
      default: '100px'
    },
    sizeDots: {
      type: String,
      default: '8px'
    },
    isActiveDots: {
      type: Boolean,
      default: true
    },
    sizeStateText: {
      type: String,
      default: '1.25rem'
    }
  }
}
</script>

<style scoped>


.loader-wrapper {
  margin-top: 1rem;
  position: relative;
}


.loader {
  position: relative;

  border-radius: 50%;
  border: 6px solid rgba(229, 231, 235, 0.4);
  border-top: 6px solid #e15500;
  animation: spin 1.2s linear infinite;
}

.state {
  margin-top: 2rem;
  text-align: center;
  font-weight: 500;
  color: #ffffff;
  letter-spacing: 0.025em;
  animation: pulse 2s ease-in-out infinite;
}


.progress-dots {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.dot {

  border-radius: 50%;
  background: #e15500;
  animation: bounce 1.4s ease-in-out infinite;
}

.dot-1 {
  animation-delay: 0ms;
}

.dot-2 {
  animation-delay: 150ms;
}

.dot-3 {
  animation-delay: 300ms;
}

/* Animations */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}


@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
</style>
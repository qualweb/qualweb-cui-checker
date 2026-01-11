<template>
  <div class="arrow-container">
    <button @click="goHome" class="arrow-button">
      <i class="material-icons">home</i>
    </button>
  </div>
  <div class="bigContainer">
    <div class="container">
      <div class="error-icon"></div>
      <div class="error-title-container">
        <span class="error-icon material-symbols-outlined"> error </span>
        <h1 class="error-title">Error</h1>
      </div>

      <div class="message-error-container">
        <h1>
          {{ errorMessage.split(':')[0] }}<br v-if="errorMessage.includes(':')" />{{
            errorMessage.split(':')[1]?.trim()
          }}
        </h1>
      </div>

      <div class="error-actions">
        <ButtonStyled :primary="false" @click="goHome" label="Return Main" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import ButtonStyled from '../../components/ButtonStyled.vue';

const store = useStore();
const router = useRouter();
const route = useRoute();
const errorMessage = ref('');

onMounted(() => {
  errorMessage.value = route.query.error || 'An unknown error occurred.';
  sendActionShowNotification(store.state.tabId, errorMessage.value);
});

const goHome = () => {
  sendActionHideNotification(store.state.tabId);
  router.push('/');
};
</script>

<style scoped>
.error-title-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  margin-top: 20px;
}

.material-symbols-outlined {
  color: #eb5523;
  font-size: 80px;
  font-variation-settings: 'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 48;
}

.initial-text {
  text-align: center;
  font-weight: 900;
  margin-bottom: 1rem;
}

.bigContainer {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  min-height: 70vh;
  display: flex;
  flex-direction: column;
}
.container {
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.title {
  text-align: center;
  font-weight: 900;
  margin-bottom: 1rem;
}
.button-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 250px;
}

.arrow-container {
  z-index: 1000;
  position: sticky;
  background-color: #393939;
  top: 0;
  border-bottom: 1px solid #ccc;
}
.arrow-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  text-align: left;
  transition: background-color 0.3s ease;
}
.arrow-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
.message-error-container {
  margin-top: 20px;
  margin-bottom: 20px;
  width: 80%;
  word-wrap: break-word;
}
@media only screen and (max-width: 700px) {
  .container-1 {
    display: flex;
    flex-direction: column;
  }
  .column-2 {
    flex: 2;
  }
  .column-1 {
    flex: 1;
  }
}

/* Ícone de erro */
.error-icon {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.btn-restart {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background-color: #e15500;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(225, 85, 0, 0.3);
}

.btn-restart:hover {
  background-color: #ff6a00;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(225, 85, 0, 0.4);
}

.btn-restart:active {
  transform: translateY(0);
}

/* Responsivo */
@media only screen and (max-width: 700px) {
  .error-card {
    padding: 32px 24px;
  }

  .error-title {
    font-size: 24px;
  }

  .error-icon .material-symbols-outlined {
    font-size: 64px;
  }
}
</style>

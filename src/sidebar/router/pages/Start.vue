<template>
  <div class="bigContainer">
    <div class="container">
      <span @click="onSettingsClick" class="material-symbols-outlined position-icon-settings">
        settings
      </span>

      <h1 class="title">QUALWEB CUI CHECK</h1>
      <img class="logo" src="/dist/icons/logoQW.png" alt="Qualweb Logo" />
      <p class="initial-text">
        Selectors not in memory<br />
        please detect Chatbot
      </p>
      <div class="button-container">
        <button @click="onDetectChatbot">Detect Chatbot</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();

const onSettingsClick = () => {
  chrome.runtime.openOptionsPage();
};


const onDetectChatbot = () => {
  router.push('/detecting-page-chatbot');
};
</script>

<style scoped>
.initial-text {
  text-align: center;
  font-weight: 900;
  margin-bottom: 1rem;
}
.logo {
  width: auto;
  height: 200px;
  margin-bottom: 20px;
}

.position-icon-settings {
  position: absolute;
  top: 12px;
  right: 20px;
  cursor: pointer;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
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
  overflow: auto;
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
.evaluation-container {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
  max-width: 250px;
}
button {
  width: 100%;
  padding: 10px;
  background-color: #e15500;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}
button:hover {
  background-color: #ff6a00;
}
button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
hr {
  width: 100%;
  border: none;
  border-top: 1px solid #ffffff;
  margin: 15px 0;
}
label {
  display: flex;
  align-items: center;
  gap: 5px;
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
</style>

<template>
  <div class="bigContainer">
    <div class="container">
      <h1 class="title">Settings</h1>
      <form @submit.prevent="onSubmit">
        <div class="settings">
          <div class="settings-container">
            <label for="locale_select">Locale:</label>
            <span>Setting used for localization checks (currrency, language, date)</span>
            <select id="locale_select" v-model="locale" required>
              <option value="en-US">English (en-US)</option>
              <option value="pt-PT">Portuguese (pt-PT)</option>
            </select>

            <label for="location_llm">LLM Service:</label>
            <select id="location_llm" v-model="LLMService" required>
              <option value="openai">OpenAI API</option>
            </select>
          </div>
          <div v-if="LLMService === 'openai'" class="settings-container">
          
            <label for="apiKey">API KEY:</label>
            <input type="text" id="apiKey" v-model="apiKey" placeholder="API Key" required />
           
          </div>
        </div>
        <div class="button-container">
          <button id="cancelButton" class="button-cancel" @click="onClickCancelSettings">
            Cancel
          </button>
          <button id="saveButton" type="submit" class="button-save">Save Settings</button>
        </div>
      </form>
      <div v-if="showModal">
        <Modal />
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed,ref } from 'vue';
import { useStore } from 'vuex';
import { z } from 'zod';
import Modal from '../../components/Modal.vue';

const showModal = ref(false);

function startModal() {
  showModal.value = true;
}
const store = useStore();

const schema = z.object({
  locale: z.string(),
  apiKey: z.string().nullable()
});

const locale = computed({
  get: () => store.getters.getLocale,
  set: (value) => store.commit('SETLOCALE', value),
});
const mappedKey = computed({
  get: () => store.getters.getMappedApiKey,
});
const apiKey = computed({
   get: () => store.getters.getMappedApiKey,
  
  set: (value) =>{
    if(value === mappedKey.value) return;
    store.commit('SETAPIKEY', value)

  } ,
});

const LLMService = computed({
  get: () => store.getters.getLLMService,
  set: (value) => store.commit('SETLLMSERVICE', value),
});


const onClickCancelSettings = () => {
  window.close();
};

const onSubmit = () => {
  const data = {
    locale: locale.value,
    apiKey: apiKey.value,
    mappedKey: mappedKey.value

  };

  try {
    schema.parse(data);
  } catch (error) {
    console.error('Validation error:', error.errors);
    return;
  }

  onClickSave();
};

const onClickSave = () => {
  chrome.storage.local.set({ qualweb_settings: store.state }, () => {
    console.log('Settings saved');
    startModal();
  });
  store.commit('SETFIRSTRUN', false);
};
</script>

<style scoped>
.settings {
  margin-top: 50px;
  margin-bottom: 100px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 250px;
}
.bigContainer {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  min-height: 70vh;
  width: 80vw;
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
select {
  font-family: Arial, sans-serif;

  width: 100%;
  padding: 10px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}
input {
  font-family: Arial, sans-serif;
  width: auto;
  padding: 10px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.title {
  text-align: center;
  font-weight: 900;
  margin-bottom: 1rem;
}
.settings-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 120%;
  max-width: 250px;
}
.button-container {
  display: flex;
  flex-direction: row;
  gap: 20px;
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
.button-cancel {
  width: 100%;
  padding: 10px;
  background-color: #5a5654;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.button-save {
  width: 100%;
  padding: 5px;
  background-color: #e15500;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.button-save:hover {
  background-color: #ff6a00;
}
.button-cancel:hover {
  background-color: #c1bfbe;
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

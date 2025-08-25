<template>
  <div class="bigContainer">
    <div class="container">
      <h1 class="title">Settings</h1>
      <div class="settings">
        <div class="settings-container">
          <label for="locale">Language:</label>
          <select id="locale" v-model="settings.locale">
            <option value="en_US">English (US)</option>
            <option value="es_ES">Spanish (Spain)</option>
            <option value="fr_FR">French (France)</option>
            <option value="de_DE">German (Germany)</option>
            <option value="it_IT">Italian (Italy)</option>
            <option value="pt_PT">Portuguese (Portugal)</option>
            <option value="zh_CN">Chinese (Simplified)</option>
            <option value="ja_JP">Japanese</option>
            <option value="ko_KR">Korean</option>
            <option value="ru_RU">Russian</option>
            <option value="ar_EG">Arabic (Egypt)</option>
            <option value="hi_IN">Hindi (India)</option>
            <option value="nl_NL">Dutch (Netherlands)</option>
            <option value="sv_SE">Swedish (Sweden)</option>
            <option value="tr_TR">Turkish (Turkey)</option>
          </select>
        </div>
      </div>
      <div class="button-container">
        <button id="cancelButton" class="button-cancel" @click="onClickCancelSettings">
          Cancel
        </button>
        <button id="saveButton" class="button-save" @click="onClickSave">Save Settings</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const settings = ref({ locale: 'en_US' });

onMounted(() => {
  chrome.storage.local.get(['qualweb_settings'], (result) => {
    if (result.qualweb_settings && result.qualweb_settings.locale) {
      settings.value.locale = result.qualweb_settings.locale;
    }
    console.log('Settings loaded', settings.value);
  });
});

const onClickCancelSettings = () => {
  router.push('/');
};

const onClickSave = () => {
  chrome.storage.local.set({ qualweb_settings: settings.value }, () => {
    console.log('Settings saved');
  });
  router.push('/');
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
.title {
  text-align: center;
  font-weight: 900;
  margin-bottom: 1rem;
}
.settings-container {
  display: flex;
  flex-direction: row;
  gap: 10px;
  width: 100%;
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

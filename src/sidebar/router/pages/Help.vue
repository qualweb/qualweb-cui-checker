<template>  
 <div class="arrow-container">
      <button @click="goBack" class="arrow-button">
        <i class="material-icons">arrow_back</i>
      </button>
    </div>
  <div class="bigContainer">
    <div class="container">
 

      <h1 class="title">Help</h1>

      <p class="initial-text">
        For assistance with using the Qualweb CUI Checker extension, please refer to the following resources:
      </p>
      <ul class="resource-list">
        <li><a href="https://qualweb.io/docs" target="_blank">Qualweb Documentation</a></li>
        <li><a href="https://qualweb.io/support" target="_blank">Qualweb Support</a></li>
      </ul>
      <p class="initial-text">
        If you have further questions or need personalized assistance, feel free to reach out to our support team through the support page.
      </p>
      <p>Instructions of use:</p>
      <ul class="resource-list">
        <li>1. Open the extension by clicking on the Qualweb CUI Checker icon in your browser toolbar.</li>
        <li>2. Select the evaluation options you wish to use (ACT Rules, WCAG Techniques, CUI Rules).</li>
        <li>3. Click "Start Interaction" to begin the chatbot accessibility evaluation process.</li>
        <li>4. Follow the prompts and provide any necessary permissions for the extension to interact with the webpage.</li>
        <li>5. Review the evaluation results and take action based on the findings.</li>
      </ul>
      <p class="initial-text">
        Thank you for using the Qualweb CUI Checker extension!
      </p>
      <p class="initial-text">
        © 2024 Qualweb. All rights reserved.
      </p>
      

    </div>
  </div>
</template>
<script setup>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();

const goBack = () => {
  router.go(-1);
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

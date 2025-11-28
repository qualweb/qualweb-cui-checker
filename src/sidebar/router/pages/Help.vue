<template>
  <div class="arrow-container">
    <button @click="goBack" class="arrow-button" aria-label="Voltar">
      <i class="material-icons">arrow_back</i>
    </button>
  </div>

  <div class="bigContainer">
    <div class="container">
      <h1 class="title">Help</h1>

      <div class="accordion">
        <div
          v-for="(section, index) in sections"
          :key="index"
          class="accordion-item"
          :class="{ open: isOpen(index) }"
        >
          <button
            class="accordion-header"
            @click="toggleSection(index)"
            :aria-expanded="isOpen(index)"
            :aria-controls="'section-content-' + index"
            :id="'section-header-' + index"
          >
            <span>{{ section.title }}</span>
            <span class="arrow" :class="{ open: isOpen(index) }" aria-hidden="true">▶</span>
          </button>
          <transition name="accordion">
            <div
              v-show="isOpen(index)"
              class="accordion-content"
              :id="'section-content-' + index"
              :aria-labelledby="'section-header-' + index"
              role="region"
            >
              <div v-html="section.content"></div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const openSection = ref(null);

const goBack = () => router.go(-1);

const sections = [
  {
    title: 'Useful Resources',
    content: `
      <p>For assistance with using the Qualweb CUI Checker extension, please refer to the following resources:</p>
      <ul class="resource-list">
        <li><a href="https://qualweb.io/docs" target="_blank" rel="noopener noreferrer">Qualweb Documentation</a></li>
        <li><a href="https://qualweb.io/support" target="_blank" rel="noopener noreferrer">Qualweb Support</a></li>
      </ul>
      <p>If you have further questions or need personalized assistance, feel free to reach out to our support team through the support page.</p>
    `
  },
  {
    title: 'Instructions of Use',
    content: `
      <p>Instructions of use:</p>
      <ul class="resource-list">
        <li>1. Open the extension by clicking on the Qualweb CUI Checker icon in your browser toolbar.</li>
        <li>2. Select the evaluation options you wish to use (ACT Rules, WCAG Techniques, CUI Rules).</li>
        <li>3. Click "Start Interaction" to begin the chatbot accessibility evaluation process.</li>
        <li>4. Follow the prompts and provide any necessary permissions for the extension to interact with the webpage.</li>
        <li>5. Review the evaluation results and take action based on the findings.</li>
      </ul>
    `
  },
  {
    title: 'Acknowledgements',
    content: `
      <p>Thank you for using the Qualweb CUI Checker extension!</p>
      <p>© 2025 Qualweb. All rights reserved.</p>
    `
  }
];

const toggleSection = (index) => {
  openSection.value = openSection.value === index ? null : index;
};

const isOpen = (index) => openSection.value === index;
</script>

<style scoped>
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

.bigContainer {
  margin: 0 auto;
  padding: 0;
  font-family: Arial, sans-serif;
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  max-width: 720px;
}

.container {
  padding: 1rem 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  text-align: center;
  font-weight: 900;
  margin-bottom: 1rem;
  color: white;
}

.accordion {
  width: 100%;
  max-width: 600px;
}

.accordion-item {
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  margin-bottom: 12px;
  background: transparent;
  box-shadow: none;
  transition: box-shadow 0.3s ease;
  width: 100%;
  max-width: 600px;
}

.accordion-item.open {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  background: var(--accordion-bg, rgba(255 255 255 / 0.8));
}
.accordion-item.open .accordion-header {
  color: black;
}
.accordion-header {
  width: 100%;
  padding: 1rem 1.2rem;
  background: transparent;
  border: none;
  text-align: left;
  font-weight: 700;
  font-size: 1.15rem;
  color: white;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  transition: color 0.3s ease;
}

.accordion-header:hover {
  color: var(--accent-color, #e15500);
}

.arrow {
  display: inline-block;
  transition: transform 0.3s ease;
  color: var(--accent-color, #e15500);
}

.arrow.open {
  transform: rotate(90deg);
}

.accordion-content {
  padding: 1rem 1.2rem;
  color: var(--text-color, #333);
  font-weight: 500;
  line-height: 1.5;
  background: var(--content-bg, rgba(255 255 255 / 0.9));
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0 0 8px 8px;
}

.resource-list {
  padding-left: 1.2rem;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
}

.resource-list li {
  margin-bottom: 0.5rem;
}

.resource-list a {
  color: var(--accent-color, #e15500);
  text-decoration: none;
}

.resource-list a:hover {
  text-decoration: underline;
}

/* Animação da abertura */
.accordion-enter-active, .accordion-leave-active {
  transition: max-height 0.4s ease, opacity 0.4s ease;
}

.accordion-enter-from, .accordion-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

.accordion-enter-to, .accordion-leave-from {
  max-height: 1000px; /* valor alto para garantir que o conteúdo cabe */
  opacity: 1;
  overflow: visible;
}

@media (max-width: 700px) {
  .container {
    padding: 0.5rem 1rem;
  }
  .accordion {
    max-width: 100%;
  }
  .accordion-item {
    max-width: 100%;
  }
}
</style>

<template>
  <div>
    <a href="#" @click.prevent="generateReport">
          <span class="icon">📊</span> CSV
      </a>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { onMounted } from 'vue';
const emit = defineEmits(['buttonClicked']);
// Referência ao iframe

const store = useStore();
const rules = computed(() => store.getters.getCurrentFilteredRules);
const chatbotSummary = computed(() => store.getters.getChatbotSummary);
const evaluateChatbot = computed(() => store.getters.getEvaluateChatbot);
const currentUrl = ref('');

const currentSummary = computed(() => {
  return evaluateChatbot.value ? chatbotSummary.value : null;
});

onMounted(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      currentUrl.value = tabs[0].url;
    }
  });
});
// Função para gerar o HTML completo do relatório
function getCsvContent() {
  const today = new Date().toLocaleDateString();

  return `URL,${currentUrl.value}
Evaluation Date,${today}
Result,Count 
Passed,${currentSummary.value?.passed || 0}
Failed,${currentSummary.value?.failed || 0}
Warning,${currentSummary.value?.warning || 0}
Inapplicable,${currentSummary.value?.inapplicable || 0}
Rules
CODE,TITLE,DESCRIPTION,VERDICT,TARGET
${rules.value
  .flatMap((rule) => {
    if (rule.results && rule.results.length > 0) {
      return rule.results.flatMap((result) => {
        if (result.elements && result.elements.length > 0) {
          return result.elements.map(
            (element) =>
              `${rule.code},${rule.name},${rule.description},${result.verdict},${element.pointer}`,
          );
        }
        return [];
      });
    }
    return [];
  })
  .join('\n')}
`;
}
// Geração do CSV
async function generateReport() {
  const today = new Date().toLocaleString();
  const csvContent = `data:text/csv;charset=utf-8,${encodeURIComponent(getCsvContent())}`;
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', `accessibility_report_${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  emit('buttonClicked');
}
</script>

<style scoped>
.dropdown-menu a {
  color: #ccc;
  padding: 10px 15px;
  text-decoration: none;
  display: block;
  font-size: 0.95em;
}

.dropdown-menu a:hover {
  background-color: #575757;
}

.dropdown-menu .icon {
    margin-right: 8px;
}</style>

<template>
  <div>
        <a href="#" @click.prevent="generateReport">
          <span class="icon">📄</span> PDF
        </a>
    <iframe
      :id="'pdfFrame'"
      ref="pdfFrame"
      hidden
      style="display: none"
      sandbox="allow-same-origin allow-scripts"
    ></iframe>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import html2pdf from 'html2pdf.js';
import { onMounted } from 'vue';
const emit = defineEmits(['buttonClicked']);
// Referência ao iframe
const pdfFrame = ref(null);
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
function getHtmlContent() {
  const today = new Date().toLocaleDateString();

  return `
    <!DOCTYPE html>
    <html>
     ${generateHTMLHeadAndStyles()}
      <body class="pdf-report">
        <h1>Accessibility  Report</h1>
        <h4>${currentSummary.value?.title || ''}</h4>
        <br/>
        <table class="table">
          <thead><tr><td>URL:</td><td>${currentUrl.value}</td></tr></thead>
        </table>
        <table class="table">
          <thead><tr><td>Evaluation Date: ${today}</td></tr></thead>
        </table>
        <h4>Rules</h4>
        <table class="table">
          <thead>
            <tr>
              <th scope="col">Passed</th>
              <th scope="col">Failed</th>
              <th scope="col">Warning</th>
              <th scope="col">Inapplicable</th>
            </tr>
          </thead>
          <tbody>
            <tr  style="text-align: center;">
              <td>${currentSummary.value.passed}</td>
              <td>${currentSummary.value.failed}</td>
              <td>${currentSummary.value.warning}</td>
              <td>${currentSummary.value.inapplicable}</td>
            </tr>
          </tbody>

        </table>
        <br/><br/>
            ${rules.value
              .map(
                (rule) => `

              <table class="table">
        
          <thead>
            <tr>
              <th scope="col">Rule</th>
              <th scope="col">Title</th>
              <th scope="col">Result</th>
            </tr>
          </thead>
          <tbody>  
            <tr>
                <td>${rule.code}</td>
                <td>${rule.name}</td>
                <td>${rule.metadata.outcome}</td>
              </tr>
              <tr>
                <th colspan="3">
                Tests for this Rule
                </th>
              </tr>
              <tr>
                <th>
                  Passed
                </th>
                <th>Failed</td>
                <th>Inaplicable</td>
                </tr>
              <tr>
                <td>${rule.metadata.passed}</td>
                <td>${rule.metadata.failed}</td>
                <td>${rule.metadata.inapplicable}</td> 
                </tr>
            </tbody>
        
        </table>
        <br/>
        <br/>
        
            `,
              )
              .join('')}
      
    
      </body>
    </html>
  `;
}
function generateHTMLHeadAndStyles() {
  return `<head>
        <meta charset='UTF-8'>
 
        <style>
        
          * {
            break-inside: avoid;
 
            page-break-inside: avoid;
            -webkit-column-break-inside: avoid;
          }
          .pdf-report {
            background-color: white;

            font-family: Arial, sans-serif;
            color: black;

          }
          h1, h4 {
            text-align: center;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            background-color: #f2f2f2;
            text-align: center;
          }
          td, th {
            padding: 8px;
            font-size: 14px;
          }
            table {
  width: 100%;
  margin-bottom: 1rem;
  color: #212529;
  border-collapse: collapse;
}

th,
td {
  padding: 0.5rem;
  vertical-align: top;
  border-top: 1px solid #dee2e6;
  font-size: 14px;
  text-align: center;
}

thead th {
  vertical-align: bottom;
  border-bottom: 2px solid #dee2e6;
  background-color: #f8f9fa;
}

tbody tr:nth-child(even) {
  background-color: #f2f2f2;
}

.table-bordered {
  border: 1px solid #dee2e6;
}

.table-bordered th,
.table-bordered td {
  border: 1px solid #dee2e6;
}

.table-striped tbody tr:nth-of-type(odd) {
  background-color: rgba(0, 0, 0, 0.05);
}

.table-hover tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.075);
}
</style>
      </head>`;
}
// Geração do PDF
async function generateReport() {
  const frame = document.getElementById('pdfFrame');
  const html = getHtmlContent();
  const today = new Date().toLocaleString();
  frame.srcdoc = html;

  frame.onload = () => {
    html2pdf()
      .set({
        html2canvas: {
          scale: 1,
          logging: false,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          ignoreElements: (el) => {
            // ignora scripts ou elementos fora do contexto do relatório
            return el.tagName === 'SCRIPT';
          },
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(frame.contentDocument.documentElement)
      .save(`accessibility_report_${today}.pdf`);
      emit('buttonClicked');
  };
}
</script>

<style scoped>
iframe {
  display: none;
}
#pdfFrame {
  display: none !important;
  visibility: hidden !important;
  width: 0;
  height: 0;
  position: absolute;
  top: -9999px;
  left: -9999px;
  border: none;
}
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
}
</style>

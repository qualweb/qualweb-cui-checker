
<template>
  <div class="container">
    <Loading :message="state" />
  </div>
</template>
<script setup>
import {  computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Loading from '../../components/Loading.vue';


const router = useRouter();
const store = useStore();


const state = 'Loading App';

const url = computed(() => store.getters.getSidepanelURL);
const isSelectorsDetected = computed(() => store.getters.selectorsDetected);
onMounted(async () => {
  const tabInfo = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
  if (!tabInfo) {
    console.log("No active tab found.");
    router.push('/error', { query: { error: "No active tab found" } });
    return;
  };

  console.log("Tab Info obtained:",tabInfo);
  console.log("URL Hostname:",new URL(tabInfo.url).hostname); 
  store.commit('SETTABID', tabInfo.id);

    store.commit('SETSIDEPANELURL', new URL(tabInfo.url).hostname);

  if(isSelectorsDetected.value){
    router.push('/ready');
    return;
  }
  
  // Check if selector exists for the current URL
  console.log("Checking selectors for URL:", url.value);  
  let selectors = await chrome.storage.local.get('qualweb-selectors');

  const selectorsForHostname = selectors['qualweb-selectors']?.[url.value] || null;


  if (selectorsForHostname) {
    store.commit('SETSELECTORSDETECTED', true);
    router.push('/ready');
  }else{

    router.push('/start');
  }

  });

</script>
<style scoped>
.container {
  min-height: 50vh;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  overflow: hidden;

}
</style>
<template>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';


const store = useStore();
const router = useRouter();
const firstRun = computed(() => store.getters.getFirstRun);

onMounted(async () => {
        await store.dispatch('loadOptions');
        if (!firstRun.value){   
            router.push('/settings');
            return;
        }

        router.push('/welcome');
  
});
</script>


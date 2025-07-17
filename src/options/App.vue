<template>
  <div class="content">
    <div v-if="firstRun" >
      <Welcome />
    </div>
    <div v-else>
        <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue';
import Welcome from './router/pages/Welcome.vue';
import { useStore } from 'vuex';



export default {
  components: {
    Welcome,
  },
  name: 'App',
  setup() {
    const store = useStore();
    const firstRun = computed(() => store.getters.getFirstRun);
    onMounted(() => {
      store.dispatch('loadOptions');
    });
    return {
      firstRun,
    };
  },
};


</script>

<style scoped>
.content {
  height: 100%;
}
</style>

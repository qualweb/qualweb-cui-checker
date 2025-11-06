<template>
  <div class="bigContainer">
    <div class="container">
       <div>
      <div class="position-icon-menu">

        <span class="material-symbols-outlined position-icon-help rotatable" :class="{ rotated: isDropdownOpen }"  @click="toggleDropdown">
        menu
        </span>
  
      <div v-if="isDropdownOpen" class="dropdown-menu">
        <ul>
          <li @click="onHelpClick">Help</li>
        </ul> 
       </div>
    </div>
      <span @click="onSettingsClick" class="material-symbols-outlined position-icon-settings">
        settings
      </span>
      </div>

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
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';


const router = useRouter();
const isDropdownOpen = ref(false);
const onSettingsClick = () => {
  chrome.runtime.openOptionsPage();
};

const toggleDropdown = () => {
      isDropdownOpen.value = !isDropdownOpen.value;
    };
  
const onDetectChatbot = () => {
  router.push('/detecting-chatbot');
};

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
});
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
});

const handleClickOutside = (event) => {
  const dropdown = document.querySelector('.dropdown-menu');
  const menuIcon = document.querySelector('.position-icon-help');
  if (dropdown && !dropdown.contains(event.target) && !menuIcon.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};
const onHelpClick = () => {
  router.push('/help');
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
.position-icon-menu {
  position: absolute;
  top: 12px;
  left: 20px;
  cursor: pointer;
}.menu-dropdown {
  position: relative; 
  display: inline-block;
}


.rotatable {
  display: inline-block;
  cursor: pointer;
  transition: transform 0.1s ease-in-out;
}

.rotatable.rotated {
  transform: rotate(90deg);
}
.dropdown-menu {
  position: absolute;
  top: 100%; 
  left: 0;
  z-index: 10; 
  background-color: #303030;
  border: 1px solid #ccc;
  width: 8rem;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  border-radius: 4px;

}
.dropdown-menu ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  width: 100%;
  
}
.dropdown-menu li:not(:last-child) {
  border-bottom: 1px solid #ccc;

}

.dropdown-menu li { 
  text-align: center;
  cursor: pointer;
  color: white;
  padding: 10px;
}
.dropdown-menu li:hover {
  background-color: #575757;
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

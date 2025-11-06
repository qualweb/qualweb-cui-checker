<template>
  <div class="bigContainer">
    <div class="navigation-bar">
      <button @click="returnToMain()" class="button-neutral">Back</button>
   <div class="download-dropdown">
      <button class="download-button" @click="toggleDropdown">
        Download
        <span class="dropdown-arrow">
          {{ isDropdownOpen ? '▲' : '▼' }}
        </span>
      </button>
      <div v-if="isDropdownOpen" class="dropdown-menu">
        <ul>
          <li><PDFReport @buttonClicked="toggleDropdown"></PDFReport></li>
          <li><CSVReport @buttonClicked="toggleDropdown"></CSVReport></li>
        </ul>
       </div>
    </div>
   </div>

    <Summary></Summary>
    <ColapsibleFilter></ColapsibleFilter>
    <div class="container-1">
      <div class="column-1">
        <ListOfRules v-on:focusContent="focusListContent()"></ListOfRules>
      </div>
    </div>
  </div>
</template>

<script>
// <FilterByResult :items="['All outcomes','Passed','Failed','Warning','Inapplicable']" ></FilterByResult>
import ColapsibleFilter from '../../components/ColapsibleFilter.vue';
import Summary from '../../components/Summary.vue';
import ListOfRules from '../../components/ListOfRules.vue';
import FilterByResult from '../../components/FilterByResult.vue';
import PDFReport from '../../components/PDFReport.vue';
import CSVReport from '../../components/CSVReport.vue';
import { mapActions,mounted } from 'vuex';

export default {
  components: {
    PDFReport,
    CSVReport,
    ColapsibleFilter,
    Summary,
    ListOfRules,
    FilterByResult,
  },
  data: () => ({
    isDropdownOpen: false,
  }),
  methods: {
    ...mapActions(['updateCurrentRule', 'reset']),
    focusListContent(clickedElement) {
      // Update the currentRule in the Vuex store
      this.updateCurrentRule(clickedElement);

      // Change the route to 'rule-content'
      this.$router.push({ name: 'rule-content' });
    },
    returnToMain() {
      this.reset();
      this.$router.push({ path: '/ready' });
    },
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    handleClickOutside(event){
  const dropdown = document.querySelector('.dropdown-menu');
  const menuIcon = document.querySelector('.download-button');
  if (dropdown && !dropdown.contains(event.target) && !menuIcon.contains(event.target)) {
    this.isDropdownOpen = false;
  }
  },
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
},
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  }
};
</script>

<style lang="scss" scoped>
.column-1 {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
  margin-left: 0.2rem;
}
.bigContainer {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #303030;
}
.navigation-bar{
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.container-1 {
  width: 100%;
  background-color: #393939;
}
.title {
  text-align: center;
  text-wrap: pretty;
  font-weight: 900;
}
.summary {
  font-size: 1rem;
  border-right: 1px solid white;
  border-left: 1px solid white;
  border-top: 1px solid white;
  color: white;
  padding: 1rem;
}
.column-2 {
  overflow-y: auto;
}
.download-dropdown {
  position: relative; 
  display: inline-block;
}

.download-button {
  background-color: #cc510a; 
  color: white;
  border: none;
  border-radius: 0 0 0 5px;
  padding: 5px 10px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 13px;
  cursor: pointer;
}

.download-button:hover {
  background-color: #ff6a00;
}

.dropdown-arrow {
  margin-left: 8px;
  font-size: 0.8em;
}
.dropdown-menu {
  position: absolute;
  top: 100%; 
  left: 0;
  z-index: 10; 
  background-color: #303030;
  border: 1px solid #ccc;
  width:6rem;
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

}
.dropdown-menu li:hover {
  background-color: #575757;
}


.button-neutral {
  background-color: #75706c;
  color: white;
  border: none;
  border-radius: 0 0 5px 0 ;
  padding: 5px 10px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 13px;
  cursor: pointer;
}
.neutral-button:hover {
  background-color: #888481;
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

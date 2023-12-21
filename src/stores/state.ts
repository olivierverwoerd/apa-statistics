import { defineStore } from 'pinia';

export const stateStore = defineStore({
  id: 'state',
  state: () => ({
    settings: {
      theme: 'auto',
      locale: 'EN',
    },
    values: [
      // {
      //   name: 'Control',
      //   users: 1564,
      //   converted: 450,
      //   retention: '10,8,5,0',
      //   color: '#0C7BDC',
      // },
      // {
      //   name: 'Variant 1',
      //   users: 1551,
      //   converted: 515,
      //   retention: '10,8,5,2,0',
      //   color: '#FFC20A',
      // },
      {
        name: 'Controle',
        users: 389,
        converted: 64,
        retention:
          '389,64,45,40,33,26,21,16,16,14,14,11,10,9,7,6,6,5,4,4,4,4,4,4,3,3,2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0',
        color: '#0C7BDC',
      },
      {
        name: 'Gebruiksaanwijzingen',
        users: 309,
        converted: 48,
        retention:
          '309,48,35,29,23,20,17,16,16,16,16,15,15,15,15,14,14,14,13,13,13,12,12,12,12,10,9,9,9,9,9,8,8,8,8,8,8,8,7,7,7,7,7,6,6,5,4,4,4,4,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2',
        color: '#FFC20A',
      },
      {
        name: 'Sociaal bewijs',
        users: 400,
        converted: 65,
        retention:
          '413,67,39,26,23,23,19,17,13,11,11,10,9,9,9,9,9,9,8,7,6,5,5,5,5,5,5,5,5,5,5,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0',
        color: '#DC3220',
      },
      {
        name: 'Personalisatie',
        users: 336,
        converted: 75,
        retention:
          '336,75,50,35,33,28,25,25,21,18,16,16,16,15,14,13,13,12,11,11,10,9,8,8,8,7,5,4,3,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1',
        color: '#D2DE32',
      },
    ],
    tValues: [],
    bValues: [],
    colorList: [
      '#0C7BDC',
      '#FFC20A',
      '#DC3220',
      '#D2DE32',
      '#265073',
      '#FFD28F',
      '#872341',
      '#F94C10',
      '#FF3FA4',
      '#4F200D',
      '#AEDEFC',
    ],
    duration: 14,
    testName: 'The default test',
    graphDetail: 0.0005,
    testType: 'z-test',
    tail: 'two', //one
    leadingZero: false, //one
    significanceLevel: 95,
    tFilter: 0,
    bootstrapActive: false,
    bootstrapIterations: 10000,
    activeChecklist: 'Hidden',
    checklistItems: [
      'Hidden',
      'Statistical help / hints / sources',
      'Preparation',
      'Checklist onboarding',
      'Checklist onboarding for e-learning',
    ],
  }),
  actions: {
    refreshTheme() {
      if (this.darkModeActive) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
      }
    },
    toggleTheme() {
      if (this.settings.theme == 'dark') {
        this.settings.theme = 'light';
      } else if (this.settings.theme == 'light') {
        this.settings.theme = 'auto';
      } else {
        this.settings.theme = 'dark';
      }
    },
  },
  getters: {
    darkModeActive: (state) => {
      if (state.settings.theme == 'dark') return true;
      if (
        state.settings.theme == 'auto' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme:dark)').matches
      )
        return true;
      return false;
    },
    amountOfUsersT: (state) => {
      let users = 0;

      for (let item of state.values) {
        let numberOfUsers = item.retention.split(',')[0];
        //@ts-ignore
        if (isNaN(numberOfUsers)) {
          break;
        }

        //@ts-ignore
        users += numberOfUsers - 0;
      }
      return users;
    },

    valuesRetention: (state) => {
      let values: any = [];
      for (let item of state.values) {
        let variantValues: any = [];
        var trim = 0;
        var last = -1;
        var time = 0;

        if (item.retention && item.retention.includes(',')) {
          let userList = item.retention.split(',');
          for (let user of userList) {
            //@ts-ignore
            if (isNaN(user)) {
              variantValues.push(0);
              variantValues.push(0);

              break;
            }
            //@ts-ignore
            let amount = user - 0;
            if (state.tFilter == 1) {
              if (trim == 0) {
                trim = amount / 100;
              }
              amount -= trim;
            }
            if (state.tFilter == 5) {
              if (trim == 0) {
                trim = amount / 20;
              }
              amount -= trim;
            }
            if (state.tFilter == 10) {
              if (trim == 0) {
                trim = amount / 10;
              }
              amount -= trim;
            }
            amount = Math.floor(amount);

            if (last == -1) {
              last = amount;
              continue;
            }

            var intervalUsers = last - amount;
            if (intervalUsers < 1) {
              intervalUsers = 0;
            }

            for (let i = 0; i < intervalUsers; i++) {
              variantValues.push(time);
            }

            if (userList.length - 2 == time && amount) {
              for (let i = 0; i < amount; i++) {
                variantValues.push(time);
              }
            }
            last = amount;
            time += 1;
          }
          values.push(variantValues);
        }
      }

      return values;
    },
  },
  persist: {
    storage: sessionStorage,
    paths: ['settings'],
  },
});

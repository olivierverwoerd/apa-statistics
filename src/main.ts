import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import './style.css';
import App from './App.vue';
import Home from '@/views/Home.vue';

import '@/assets/scss/variables.scss';
import '@/assets/scss/main.scss';
import '@/assets/scss/typography.scss';

// Vuetify
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { name: 'Home', path: '/', component: Home },
    // { name: 'Over Indicium', path: '/about', component: OverIndicium },
    // and finally the default route, when none of the above matches:
    // { name: 'Pagina niet gevonden', path: '/:pathMatch(.*)*', component: FourOFour },
  ],
  scrollBehavior: (to, from, savedPosition) => {
    return { top: savedPosition?.top ?? 0 };
  },
});

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#2196F3',
          secondary: '#009688',
        },
      },
    },
  },
});

const app = createApp(App);
// Make sure to _use_ the router instance to make the
// whole app router-aware.
app.use(router);
app.use(vuetify);

router.afterEach((to, from, failure) => {
  if (to.name) {
    document.title = 'APA statistics ' + to.name.toString();
  }
});

// we want to store some data, but not with cookies since this is more cool.
// if you get confused about this, check out the devtools.
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

//i18n
import { createI18n } from 'vue-i18n';
import NL from '@/i18n/nl.json';
import EN from '@/i18n/en.json';
import { stateStore } from '@/stores/state';
const state = stateStore();
const i18n = createI18n({
  locale: state.settings.locale,
  messages: { EN: EN, NL: NL },
});

app.use(i18n);

app.mount('#app');

<script setup lang="ts">
import Header from '@/components/Header.vue';
import Home from '@/views/Home.vue';
import { stateStore } from '@/stores/state';
// @ts-ignore
import { initializeApp } from 'firebase/app';
// @ts-ignore
import { getAnalytics } from 'firebase/analytics';
const firebaseConfig = {
  apiKey: 'AIzaSyAvrzVWcuSYagSS3fe4XfsmXGsyLtm6xOk',
  authDomain: 'apa-statistics.firebaseapp.com',
  projectId: 'apa-statistics',
  storageBucket: 'apa-statistics.appspot.com',
  messagingSenderId: '597183768920',
  appId: '1:597183768920:web:5c2652e497d01167bf1d2d',
  measurementId: 'G-JKW89T7S7Z',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const state = stateStore();

state.refreshTheme();
</script>

<template>
  <v-app :class="state.darkModeActive ? 'theme-dark' : 'theme-light'">
    <Header />
    <b class="screen-size-warning"
      >This site is NOT mobile optimized!<br />For a better experience visit this on a desktop</b
    >
    <Home />
  </v-app>
</template>

<style lang="scss">
body {
  margin: 0;
  &::-webkit-scrollbar {
    width: 0.6em;
    background-color: var(--indi-blue-3);
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--indi-blue-2);
    outline: 0px solid slategrey;
  }

  .nav {
    display: block;
  }

  .mobile-nav {
    display: none;
  }
}

.screen-size-warning {
  visibility: hidden;
  height: 0px;
}

@media only screen and (max-width: 800px) {
  .screen-size-warning {
    visibility: unset;
    height: unset;
    color: orange;
    padding-left: 20px;
  }
}

// --bp-desktop-sm: 1120px;
@media only screen and (max-width: 1120px) {
  body {
    &::-webkit-scrollbar {
      width: 1em;
    }

    .nav {
      display: none !important;
    }

    .mobile-nav {
      display: block !important;
    }
  }
}

#app {
  width: 100vw;
  display: table;
  margin: 0;
  padding: 0;

  font-family: var(--font-family);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  h3 {
    font-style: italic;
    font-size: larger;
  }

  label {
    opacity: 1;
  }

  .theme-light {
    background-color: #ffffff;
    color: #000000;

    // Define other styles for light theme...

    a,
    i,
    h1,
    h2,
    h3,
    h4,
    label,
    p {
      color: #000000;
    }

    svg text {
      fill: #000;
      font-family: 'Arial', sans-serif;
      font-size: 16px;
    }

    path.line {
      fill: none;
      stroke: steelblue;
      stroke-width: 2;
    }
  }

  .theme-dark {
    background-color: #151515;
    color: #ffffff;

    // Define other styles for dark theme...
    a,
    i,
    h1,
    h2,
    h3,
    h4,
    label,
    p {
      color: lightgray;
    }

    svg text {
      fill: #fff;
      font-family: 'Arial', sans-serif;
      font-size: 16px;
    }

    path.line {
      fill: none;
      stroke: steelblue;
      stroke-width: 2;
    }
  }
}
</style>

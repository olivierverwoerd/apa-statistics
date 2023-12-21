<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { stateStore } from '@/stores/state';
const state = stateStore();
</script>

<template>
  <v-app-bar scroll-behavior="elevate" color="blue">
    <v-toolbar-title>APA-generator (Results from data)</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn
      icon
      target="_blank"
      href="https://docs.google.com/forms/d/e/1FAIpQLSdaB1B3C36ecALEUBsS7mR90Pn2BvZq8_cigRkfiN0XeBjm1g/viewform?usp=sf_link"
    >
      <v-icon>mdi-message-text</v-icon>
      <v-tooltip activator="parent" location="bottom">Give Feedback</v-tooltip>
    </v-btn>
    <v-btn icon target="_blank" href="https://github.com/olivierverwoerd/apa-statistics">
      <v-icon>mdi-github</v-icon>
      <v-tooltip activator="parent" location="bottom">Github</v-tooltip>
    </v-btn>
    <v-btn v-if="state.settings.theme == 'light'" icon="" @click="state.toggleTheme()">
      <v-icon>mdi-weather-sunny</v-icon>
      <v-tooltip activator="parent" location="bottom">{{ $t('Switch theme (light)') }}</v-tooltip></v-btn
    >
    <v-btn v-else-if="state.settings.theme == 'dark'" icon="" @click="state.toggleTheme()">
      <v-icon>mdi-weather-night</v-icon>
      <v-tooltip activator="parent" location="bottom">{{ $t('Switch theme (dark)') }}</v-tooltip></v-btn
    >
    <v-btn v-else="state.settings.theme == 'auto'" icon="" @click="state.toggleTheme()">
      <v-icon>mdi-brightness-auto</v-icon>
      <v-tooltip activator="parent" location="bottom">{{ $t('Switch theme (auto)') }}</v-tooltip></v-btn
    >
  </v-app-bar>
  <div style="height: 80px" />
</template>

<script setup lang="ts">
import {
  NMessageProvider,
  GlobalThemeOverrides,
  NConfigProvider,
} from "naive-ui";
import Main from "./pages/Main/index.vue";

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: "#2080f0",
    primaryColorHover: "#4098fc",
    primaryColorPressed: "#1060c9",
    primaryColorSuppl: "#4098fc",
  },
  Dialog: {
    borderRadius: "12px",
  },
  Modal: {
    borderRadius: "12px",
  },
  Card: {
    borderRadius: "12px",
  },
};
</script>

<template>
  <n-config-provider
    style="width: 100%; height: 100%"
    :theme-overrides="themeOverrides"
  >
    <n-message-provider>
      <Main />
    </n-message-provider>
  </n-config-provider>
</template>

<style scoped></style>

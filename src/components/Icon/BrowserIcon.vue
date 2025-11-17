<template>
  <!-- 简单浏览器图标：外框 + 顶部一条横线代表地址栏 -->
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- 外框 -->
    <rect
      x="1.5"
      y="2.5"
      width="13"
      height="11"
      rx="2"
      stroke="currentColor"
      stroke-width="1.3"
    />
    <!-- 顶部地址栏 -->
    <line
      x1="2.5"
      y1="4.5"
      x2="12.5"
      y2="4.5"
      stroke="currentColor"
      stroke-width="1.1"
      stroke-linecap="round"
    />
  </svg>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss"></style>

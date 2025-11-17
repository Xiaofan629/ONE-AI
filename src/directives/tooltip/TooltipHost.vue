<template>
  <Teleport to="body">
    <div
      v-if="state.show"
      class="tooltip"
      :class="state.placement"
      :style="{
        top: state.top + 'px',
        left: state.left + 'px',
      }"
    >
      {{ state.text }}
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useTooltipState } from "./state";

const state = useTooltipState();
</script>

<style scoped lang="scss">
.tooltip {
  position: fixed;
  background-color: rgba(44, 62, 80, 0.95);
  color: #ffffff;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 999999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  animation: tooltipFadeIn 0.2s ease-out;
  transform-origin: top center;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text",
    "Helvetica Neue", Helvetica, Arial, sans-serif;
  letter-spacing: -0.01em;
}

.tooltip.bottom {
  transform: translate(-50%, 8px);
}

.tooltip.top {
  transform: translate(-50%, -100%);
  margin-top: -8px;
}

.tooltip.left {
  transform: translate(-100%, -50%);
  margin-left: -8px;
}

.tooltip.right {
  transform: translate(0, -50%);
  margin-left: 8px;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>

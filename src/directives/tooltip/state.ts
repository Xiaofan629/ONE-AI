import { reactive } from "vue";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface TooltipState {
  show: boolean;
  text: string;
  top: number;
  left: number;
  placement: TooltipPlacement;
}

export const tooltipState = reactive<TooltipState>({
  show: false,
  text: "",
  top: 0,
  left: 0,
  placement: "bottom",
});

export function useTooltipState() {
  return tooltipState;
}

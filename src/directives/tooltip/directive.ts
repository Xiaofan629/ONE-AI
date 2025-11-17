import type { Directive, DirectiveBinding } from "vue";
import { createVNode, render } from "vue";
import TooltipHost from "./TooltipHost.vue";
import { tooltipState, type TooltipPlacement } from "./state";

let tooltipHostMounted = false;

function ensureTooltipHostMounted() {
  if (tooltipHostMounted) return;
  const container = document.createElement("div");
  document.body.appendChild(container);
  const vnode = createVNode(TooltipHost);
  render(vnode, container);
  tooltipHostMounted = true;
}

export type TooltipBindingValue =
  | string
  | {
      content: string;
      placement?: TooltipPlacement;
    };

function normalizeBinding(binding: DirectiveBinding<TooltipBindingValue>) {
  const value = binding.value;
  if (typeof value === "string") {
    return { content: value, placement: "bottom" as TooltipPlacement };
  }
  if (value && typeof value.content === "string") {
    return {
      content: value.content,
      placement: (value.placement || "bottom") as TooltipPlacement,
    };
  }
  return { content: "", placement: "bottom" as TooltipPlacement };
}

export const tooltipDirective: Directive<HTMLElement, TooltipBindingValue> = {
  mounted(el, binding) {
    // 确保全局 TooltipHost 已挂载到 body
    ensureTooltipHostMounted();
    const onMouseEnter = (event: MouseEvent) => {
      const { content, placement } = normalizeBinding(binding);
      if (!content) return;

      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();

      let top = 0;
      let left = 0;

      switch (placement) {
        case "top":
          top = rect.top;
          left = rect.left + rect.width / 2;
          break;
        case "bottom":
          top = rect.bottom;
          left = rect.left + rect.width / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2;
          left = rect.left;
          break;
        case "right":
          top = rect.top + rect.height / 2;
          left = rect.right;
          break;
      }

      tooltipState.text = content;
      tooltipState.top = top;
      tooltipState.left = left;
      tooltipState.placement = placement;
      tooltipState.show = true;
    };

    const onMouseLeave = () => {
      tooltipState.show = false;
    };

    (el as any)._tooltipMouseEnter = onMouseEnter;
    (el as any)._tooltipMouseLeave = onMouseLeave;

    el.addEventListener("mouseenter", onMouseEnter);
    el.addEventListener("mouseleave", onMouseLeave);
  },

  updated(el, binding) {
    // 下次 mouseenter 会读取到最新的 binding.value
  },

  unmounted(el) {
    const enter = (el as any)._tooltipMouseEnter as
      | ((e: MouseEvent) => void)
      | undefined;
    const leave = (el as any)._tooltipMouseLeave as (() => void) | undefined;
    if (enter) el.removeEventListener("mouseenter", enter);
    if (leave) el.removeEventListener("mouseleave", leave);
    delete (el as any)._tooltipMouseEnter;
    delete (el as any)._tooltipMouseLeave;
  },
};

export default tooltipDirective;

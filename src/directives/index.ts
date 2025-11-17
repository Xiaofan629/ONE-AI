import type { App } from "vue";
import tooltipDirective from "./tooltip/directive";

export function registerDirectives(app: App) {
  app.directive("tooltip", tooltipDirective);
}

export default registerDirectives;

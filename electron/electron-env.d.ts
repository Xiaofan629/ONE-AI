/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string;
    /** /dist/ or /public/ */
    VITE_PUBLIC: string;
  }
}

// 历史记录数据结构
interface HistoryRecord {
  id: string;
  text: string;
  createdAt: number;
}

interface HistoryResult {
  success: boolean;
  message?: string;
  record?: HistoryRecord;
}

// 历史记录 API 接口
interface HistoryAPI {
  getAll: () => Promise<HistoryRecord[]>;
  add: (text: string) => Promise<HistoryResult>;
  delete: (id: string) => Promise<HistoryResult>;
  clear: () => Promise<HistoryResult>;
}

// One Command 数据结构
interface PromptPreset {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

interface PromptResult {
  success: boolean;
  message?: string;
  preset?: PromptPreset;
}

// One Command API 接口
interface PromptAPI {
  getAll: () => Promise<PromptPreset[]>;
  add: (
    preset: Omit<PromptPreset, "id" | "createdAt" | "updatedAt">
  ) => Promise<PromptResult>;
  update: (
    id: string,
    updates: Partial<Omit<PromptPreset, "id" | "createdAt">>
  ) => Promise<PromptResult>;
  delete: (id: string) => Promise<PromptResult>;
  search: (query: string) => Promise<PromptPreset[]>;
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  ipcRenderer: import("electron").IpcRenderer;
  historyAPI: HistoryAPI;
  promptAPI: PromptAPI;
}

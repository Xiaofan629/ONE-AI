import { ipcRenderer, contextBridge } from "electron";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args)
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },

  // You can expose other APTs you need here.
  // ...
});

// --------- 历史记录 API ---------
// 历史记录数据结构（与 main.ts 保持一致）
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

contextBridge.exposeInMainWorld("historyAPI", {
  // 获取所有历史记录
  getAll: (): Promise<HistoryRecord[]> => ipcRenderer.invoke("history:getAll"),

  // 添加历史记录
  add: (text: string): Promise<HistoryResult> =>
    ipcRenderer.invoke("history:add", text),

  // 删除单条历史记录
  delete: (id: string): Promise<HistoryResult> =>
    ipcRenderer.invoke("history:delete", id),

  // 清空所有历史记录
  clear: (): Promise<HistoryResult> => ipcRenderer.invoke("history:clear"),
});

// --------- One Command API ---------
// One Command 数据结构（与 main.ts 保持一致）
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

contextBridge.exposeInMainWorld("promptAPI", {
  // 获取所有 prompt 预设
  getAll: (): Promise<PromptPreset[]> => ipcRenderer.invoke("prompt:getAll"),

  // 添加 prompt 预设
  add: (
    preset: Omit<PromptPreset, "id" | "createdAt" | "updatedAt">
  ): Promise<PromptResult> => ipcRenderer.invoke("prompt:add", preset),

  // 更新 prompt 预设
  update: (
    id: string,
    updates: Partial<Omit<PromptPreset, "id" | "createdAt">>
  ): Promise<PromptResult> => ipcRenderer.invoke("prompt:update", id, updates),

  // 删除 prompt 预设
  delete: (id: string): Promise<PromptResult> =>
    ipcRenderer.invoke("prompt:delete", id),

  // 搜索 prompt 预设
  search: (query: string): Promise<PromptPreset[]> =>
    ipcRenderer.invoke("prompt:search", query),
});

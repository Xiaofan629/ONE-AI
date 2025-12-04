/**
 * promptStore.ts
 * One Command 存储操作封装
 * 在 Electron 环境中通过 promptAPI 与主进程通信
 * 在浏览器环境中使用 localStorage 作为降级方案
 */

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

const STORAGE_KEY = "oneai_prompt_presets";

// 检查是否在 Electron 环境中
const isElectron = (): boolean => {
  return typeof window !== "undefined" && !!window.promptAPI;
};

// 浏览器环境降级方案：从 localStorage 获取 prompt 预设
const getPromptsFromStorage = (): PromptPreset[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PromptPreset[];
  } catch {
    return [];
  }
};

// 浏览器环境降级方案：保存 prompt 预设到 localStorage
const savePromptsToStorage = (prompts: PromptPreset[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
  } catch (error) {
    console.error("[promptStore] 保存到 localStorage 失败:", error);
    throw error; // 重新抛出错误，让调用方知道保存失败
  }
};

// 获取所有 prompt 预设（已按更新时间倒序排列）
export async function getPromptList(): Promise<PromptPreset[]> {
  try {
    if (isElectron()) {
      return await window.promptAPI.getAll();
    }
    // 浏览器降级方案
    const prompts = getPromptsFromStorage();
    return [...prompts].sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (error) {
    console.error("[promptStore] 获取 prompt 预设失败:", error);
    return [];
  }
}

// 添加 prompt 预设
export async function addPrompt(
  preset: Omit<PromptPreset, "id" | "createdAt" | "updatedAt">
): Promise<PromptPreset | null> {
  try {
    if (isElectron()) {
      const result = await window.promptAPI.add(preset);
      return result.success ? result.preset || null : null;
    }
    // 浏览器降级方案
    const trimmedTitle = preset.title ? preset.title.trim() : "";
    const trimmedContent = preset.content ? preset.content.trim() : "";

    if (!trimmedTitle || !trimmedContent) {
      return null;
    }

    const prompts = getPromptsFromStorage();
    const newPreset: PromptPreset = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: trimmedTitle,
      content: trimmedContent,
      category: preset.category,
      tags: preset.tags || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    prompts.push(newPreset);
    savePromptsToStorage(prompts);
    return newPreset;
  } catch (error) {
    console.error("[promptStore] 添加 prompt 预设失败:", error);
    return null;
  }
}

// 更新 prompt 预设
export async function updatePrompt(
  id: string,
  updates: Partial<Omit<PromptPreset, "id" | "createdAt">>
): Promise<PromptPreset | null> {
  try {
    if (isElectron()) {
      const result = await window.promptAPI.update(id, updates);
      return result.success ? result.preset || null : null;
    }
    // 浏览器降级方案
    const prompts = getPromptsFromStorage();
    const index = prompts.findIndex((item) => item.id === id);
    if (index === -1) return null;

    prompts[index] = {
      ...prompts[index],
      ...updates,
      updatedAt: Date.now(),
    };
    savePromptsToStorage(prompts);
    return prompts[index];
  } catch (error) {
    console.error("[promptStore] 更新 prompt 预设失败:", error);
    return null;
  }
}

// 删除 prompt 预设
export async function deletePrompt(id: string): Promise<boolean> {
  try {
    if (isElectron()) {
      const result = await window.promptAPI.delete(id);
      return result.success;
    }
    // 浏览器降级方案
    const prompts = getPromptsFromStorage();
    const index = prompts.findIndex((item) => item.id === id);
    if (index === -1) return false;
    prompts.splice(index, 1);
    savePromptsToStorage(prompts);
    return true;
  } catch (error) {
    console.error("[promptStore] 删除 prompt 预设失败:", error);
    return false;
  }
}

// 搜索 prompt 预设（支持标题、内容和标签的模糊搜索）
export async function searchPrompts(query: string): Promise<PromptPreset[]> {
  try {
    if (isElectron()) {
      return await window.promptAPI.search(query);
    }
    // 浏览器降级方案
    const prompts = getPromptsFromStorage();

    if (!query || !query.trim()) {
      return [...prompts].sort((a, b) => b.updatedAt - a.updatedAt);
    }

    const lowercaseQuery = query.toLowerCase().trim();
    const filtered = prompts.filter((preset) => {
      const titleMatch = preset.title.toLowerCase().includes(lowercaseQuery);
      const contentMatch = preset.content
        .toLowerCase()
        .includes(lowercaseQuery);
      const tagMatch = preset.tags?.some((tag) =>
        tag.toLowerCase().includes(lowercaseQuery)
      );
      return titleMatch || contentMatch || tagMatch;
    });

    return filtered.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (error) {
    console.error("[promptStore] 搜索 prompt 预设失败:", error);
    return [];
  }
}

// 获取默认的 prompt 预设（用于初始化）
export function getDefaultPrompts(): Omit<
  PromptPreset,
  "id" | "createdAt" | "updatedAt"
>[] {
  return [
    {
      title: "写作助手",
      content:
        "请帮我写一篇关于[主题]的文章，要求：\n1. 字数约[字数]字\n2. 风格[正式/轻松/专业]\n3. 包含[具体要求]",
      category: "写作",
      tags: ["写作", "文章"],
    },
    {
      title: "代码审查",
      content:
        "请审查以下代码，并提供改进建议：\n1. 代码质量\n2. 性能优化\n3. 潜在问题\n4. 最佳实践",
      category: "编程",
      tags: ["代码", "审查", "优化"],
    },
    {
      title: "翻译助手",
      content:
        "请将以下内容翻译成[目标语言]，要求：\n1. 保持原文风格\n2. 语言流畅自然\n3. 专业术语准确",
      category: "翻译",
      tags: ["翻译", "语言"],
    },
    {
      title: "总结提炼",
      content:
        "请帮我总结以下内容的要点：\n1. 提取核心观点\n2. 保留关键信息\n3. 简洁明了",
      category: "总结",
      tags: ["总结", "提炼"],
    },
    {
      title: "创意头脑风暴",
      content:
        "请帮我进行关于[主题]的头脑风暴：\n1. 提供创新想法\n2. 多角度思考\n3. 列出可行方案",
      category: "创意",
      tags: ["创意", "头脑风暴"],
    },
  ];
}

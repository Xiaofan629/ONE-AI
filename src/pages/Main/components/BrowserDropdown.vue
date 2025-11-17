<template>
  <div>
    <n-dropdown trigger="click" :options="options" @select="handleSelect">
      <n-icon
        style="cursor: pointer; transform: translateY(3px)"
        v-tooltip="{ content: '常用网站', placement: 'left' }"
        size="16"
        :component="Browsers"
      ></n-icon>
    </n-dropdown>

    <n-modal v-model:show="showAddModal" preset="dialog" title="新增常用网站">
      <n-form :model="formState">
        <n-form-item label="网站名称" path="name">
          <n-input v-model:value="formState.name" placeholder="例如：掘金" />
        </n-form-item>
        <n-form-item label="网址" path="url">
          <n-input
            v-model:value="formState.url"
            placeholder="例如：https://juejin.cn"
          />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space justify="end">
          <n-button @click="handleCancel">取消</n-button>
          <n-button type="primary" @click="handleConfirm">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, h, ref } from "vue";
import {
  NDropdown,
  NIcon,
  useMessage,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NSpace,
} from "naive-ui";
import { Browsers, AddCircleOutline } from "@vicons/ionicons5";
import { OTHER_WEBSITE_LIST } from "../../../const/otherWebsite";
import { useAppStore } from "../../../store/appStore";
import type { App } from "../../../store/appStore";
import { getItem, setItem } from "../../../utils/localStorage";

// 注册 Naive UI 组件（<script setup> 下仅需导入即可）

interface WebsiteItem {
  id: string;
  name: string;
  url: string;
}

const CUSTOM_WEBSITE_KEY = "oneai_custom_websites";
const ADD_KEY = "__add_website__";

const appStore = useAppStore();
const message = useMessage();

const customWebsites = ref<WebsiteItem[]>(
  getItem<WebsiteItem[]>(CUSTOM_WEBSITE_KEY, { defaultValue: [] })
);

const allWebsites = computed<WebsiteItem[]>(() => [
  ...OTHER_WEBSITE_LIST,
  ...customWebsites.value,
]);

const renderIcon = (icon: any) => () =>
  h(NIcon, null, {
    default: () => h(icon),
  });

const options = computed(() => [
  ...allWebsites.value.map((item) => ({
    label: item.name,
    key: item.id,
    icon: "",
  })),
  {
    label: "新增",
    key: ADD_KEY,
    icon: renderIcon(AddCircleOutline),
  },
]);

const showAddModal = ref(false);
const formState = ref({
  name: "",
  url: "",
});

const handleSelect = (key: string) => {
  if (key === ADD_KEY) {
    showAddModal.value = true;
    return;
  }

  const target = allWebsites.value.find((item) => item.id === key);
  if (!target) return;

  const app: App = {
    id: target.id,
    name: target.name,
    url: target.url,
    logo: "", // 暂不维护图标
    noSearch: true, // 不参与统一搜索
  };

  // 常用网站分屏逻辑：
  // 1. 有空白面板优先覆盖空白面板
  // 2. 否则覆盖当前激活面板
  appStore.openWebsiteWithSplit(app);
};

const resetForm = () => {
  formState.value = {
    name: "",
    url: "",
  };
};

const handleCancel = () => {
  showAddModal.value = false;
  resetForm();
};

const handleConfirm = () => {
  const name = formState.value.name.trim();
  let url = formState.value.url.trim();

  if (!name || !url) {
    message.warning("请填写完整的网站名称和网址");
    return;
  }

  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  const id = `custom-${Date.now()}`;
  const newSite: WebsiteItem = {
    id,
    name,
    url,
  };

  customWebsites.value.push(newSite);
  setItem(CUSTOM_WEBSITE_KEY, customWebsites.value);

  message.success("已添加到常用网站");
  showAddModal.value = false;
  resetForm();
};
</script>

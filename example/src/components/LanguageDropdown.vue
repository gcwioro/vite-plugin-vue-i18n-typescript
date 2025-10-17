<template>
  <div class="flex items-center gap-3">
    <label for="language-select" class="text-sm font-medium text-gray-700">
      {{ t('LanguageDropdown.label') }}
    </label>
    <select
      id="language-select"
      v-model="selectedLanguage"
      @change="changeLanguage"
      class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <option v-for="lang in i18n.availableLocales" :key="lang" :value="lang">
        {{ lang }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">

import {ref, toValue} from "vue";
import {useI18nApp, useI18nTypeSafe} from "virtual:unplug-i18n-dts-generation";

const i18n = useI18nApp()
const {t} = useI18nTypeSafe()

const selectedLanguage = ref(toValue(i18n.locale))

function changeLanguage() {
  if (selectedLanguage.value) {
    i18n.locale.value = selectedLanguage.value;
  }

}

</script>

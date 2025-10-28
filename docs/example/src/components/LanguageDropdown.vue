<template>
  <div class="flex items-center gap-3">
    <label for="language-select" class="label">
      {{ $t('LanguageDropdown.label') }}
    </label>
    <select
      id="language-select"
      v-model="selectedLanguage"
      class="select"
    >

      <option v-for="lang in i18n.availableLocales" :key="lang" :value="lang">
        {{ lang }}
      </option>

    </select>
    <!--    {{ virtualModuleInline }}-->
    <!--    {{ vavailableLocalesInline }}-->
    <!--    {{ fallbackModuleInline }}-->

  </div>
</template>

<script setup lang="ts">
import {useI18nApp, useI18nTypeSafe} from "virtual:vue-i18n-types";
import availableLocales, {
  type AvailableLocale,
  type AvailableLocales
} from "virtual:vue-i18n-types/availableLocales";
import {fallbackLocales} from "virtual:vue-i18n-types/fallbackLocales";
import {computed, isRef, ref, toRef, toValue, watch, watchEffect} from "vue";


const i18n = useI18nApp()
const {t} = useI18nTypeSafe()

const selectedLanguage = ref<AvailableLocale>('en')

watch(selectedLanguage, locale => {
  if (locale) {
    let i18Locale = toRef(i18n, 'locale');
    if (isRef(i18Locale)) {

      i18Locale.value = locale;
    } else {

      //@ts-ignore
      i18Locale = locale;
    }
  }
}, {immediate: true})

watchEffect(() => {
  console.log(availableLocales)
  console.log("Current locale:", i18n.locale.value, `Available locales: ${i18n?.availableLocales?.join(',')}`, `Found by plugin locales:`, availableLocales)
  console.log("Fallback locales:", fallbackLocales)
})

</script>

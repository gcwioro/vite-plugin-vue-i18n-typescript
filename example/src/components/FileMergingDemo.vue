<template>
  <section class="bg-white rounded-lg shadow-sm px-6 py-5 border border-gray-200">
    <h2 class="text-lg font-semibold text-gray-900 mb-2">File Merging Demo</h2>
    <p class="text-sm text-gray-600 mb-4">
      Demonstrates how the plugin merges translation keys from multiple JSON files
    </p>

    <div class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 class="text-sm font-semibold text-blue-900 mb-2">How it works:</h3>
      <ul class="text-xs text-blue-800 space-y-1">
        <li class="flex items-start gap-2">
          <span class="text-blue-400">•</span>
          <span>Translation keys from <span class="font-mono bg-blue-100 px-1 rounded">locales/en.json</span> are merged with keys from <span
            class="font-mono bg-blue-100 px-1 rounded">components/FileMergingDemo.en.json</span></span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-400">•</span>
          <span>Component-specific files complement (not override) the main locale files</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-400">•</span>
          <span>All keys are available with full type safety across the application</span>
        </li>
      </ul>
    </div>

    <div class="space-y-3">
      <div class="border border-gray-200 rounded-lg p-4">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">
          From <span
          class="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">locales/en.json</span>
        </h3>
        <div class="space-y-2">
          <div class="px-3 py-2 bg-gray-50 rounded text-sm">
            <span class="text-gray-500 text-xs">App.fruits.label:</span>
            <p class="text-gray-900">{{ t('App.fruits.label', {amount: 5, fruit: 'apples'}) }}</p>
          </div>
          <div class="px-3 py-2 bg-gray-50 rounded text-sm">
            <span class="text-gray-500 text-xs">Greeting.message:</span>
            <p class="text-gray-900">{{ t('Greeting.message') }}</p>
          </div>
        </div>
      </div>

      <div class="border border-green-200 rounded-lg p-4 bg-green-50">
        <h3 class="text-sm font-semibold text-green-900 mb-3">
          From <span class="font-mono text-xs bg-green-100 px-1.5 py-0.5 rounded">components/FileMergingDemo.en.json</span>
        </h3>
        <div class="space-y-2">
          <div class="px-3 py-2 bg-white border border-green-200 rounded text-sm">
            <span class="text-green-600 text-xs">FileMergingDemo.title:</span>
            <p class="text-gray-900">{{ t('FileMergingDemo.title') }}</p>
          </div>
          <div class="px-3 py-2 bg-white border border-green-200 rounded text-sm">
            <span class="text-green-600 text-xs">FileMergingDemo.description:</span>
            <p class="text-gray-900">{{ t('FileMergingDemo.description') }}</p>
          </div>
          <div class="px-3 py-2 bg-white border border-green-200 rounded text-sm">
            <span class="text-green-600 text-xs">FileMergingDemo.feature.typeCheck:</span>
            <p class="text-gray-900">{{ t('FileMergingDemo.feature.typeCheck') }}</p>
          </div>
          <div class="px-3 py-2 bg-white border border-green-200 rounded text-sm">
            <span class="text-green-600 text-xs">FileMergingDemo.feature.autoMerge:</span>
            <p class="text-gray-900">{{ t('FileMergingDemo.feature.autoMerge') }}</p>
          </div>
        </div>
      </div>

      <div class="border border-purple-200 rounded-lg p-4 bg-purple-50">
        <h3 class="text-sm font-semibold text-purple-900 mb-3">
          Merged Result - All keys accessible with autocomplete
        </h3>
        <div class="space-y-2">
          <div class="px-3 py-2 bg-white rounded text-sm">
            <p class="text-gray-900 flex items-center gap-2">
              <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor"
                   viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M5 13l4 4L19 7"></path>
              </svg>
              <span>{{ t('FileMergingDemo.merged.success', {count: allKeysCount}) }}</span>
            </p>
          </div>
          <div class="px-3 py-2 bg-white rounded text-sm">
            <p class="text-gray-900">{{ t('FileMergingDemo.merged.typeSafety') }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4 p-3 bg-gray-900 rounded-lg">
      <p class="text-xs text-gray-400 mb-2 font-semibold">File structure:</p>
      <pre class="text-xs text-green-400 font-mono">example/src/
├── locales/
│   ├── en.json              ← Main translations
│   └── de.json              ← Main translations
└── components/
    └── FileMergingDemo.en.json  ← Component-specific (merged)
    └── FileMergingDemo.de.json  ← Component-specific (merged)</pre>
    </div>
  </section>
</template>

<script setup lang="ts">
import {useI18nTypeSafe} from "virtual:unplug-i18n-dts-generation";
import {computed} from "vue";

const {t, tm} = useI18nTypeSafe()

// Count all available translation keys to show merging worked
const allKeysCount = computed(() => {
  const messages = tm('');
  return Object.keys(messages).length;
})
</script>

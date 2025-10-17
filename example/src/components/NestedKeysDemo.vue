<template>
  <section class="bg-white rounded-lg shadow-sm px-6 py-5 border border-gray-200">
    <h2 class="text-lg font-semibold text-gray-900 mb-2">Nested Keys Demo</h2>
    <p class="text-sm text-gray-600 mb-4">
      Demonstrates accessing deeply nested translation keys with type safety
    </p>

    <div class="space-y-3">
      <div class="border border-gray-200 rounded-lg p-4">
        <h3 class="text-sm font-semibold text-gray-700 mb-2">User Settings</h3>
        <div class="space-y-2">
          <div class="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
            <span class="text-sm">{{ t('NestedKeysDemo.settings.theme.label') }}</span>
            <span class="text-xs text-gray-500">{{
                t('NestedKeysDemo.settings.theme.description')
              }}</span>
          </div>
          <div class="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
            <span class="text-sm">{{ t('NestedKeysDemo.settings.notifications.label') }}</span>
            <span class="text-xs text-gray-500">{{
                t('NestedKeysDemo.settings.notifications.description')
              }}</span>
          </div>
          <div class="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
            <span class="text-sm">{{ t('NestedKeysDemo.settings.privacy.label') }}</span>
            <span class="text-xs text-gray-500">{{
                t('NestedKeysDemo.settings.privacy.description')
              }}</span>
          </div>
        </div>
      </div>

      <div class="border border-gray-200 rounded-lg p-4">
        <h3 class="text-sm font-semibold text-gray-700 mb-2">Status Messages</h3>
        <div class="space-y-2">
          <div class="px-3 py-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
            {{ t('NestedKeysDemo.status.success') }}
          </div>
          <div
            class="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            {{ t('NestedKeysDemo.status.warning') }}
          </div>
          <div class="px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
            {{ t('NestedKeysDemo.status.error') }}
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4 p-3 bg-gray-50 rounded-lg">
      <p class="text-xs text-gray-600 mb-2 font-semibold">Accessing nested keys:</p>
      <ul class="space-y-1 text-xs text-gray-700">
        <li class="font-mono bg-white px-2 py-1 rounded">t('NestedKeysDemo.settings.theme.label')
        </li>
        <li class="font-mono bg-white px-2 py-1 rounded">t('NestedKeysDemo.status.success')</li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import {useI18nTypeSafe} from "virtual:unplug-i18n-dts-generation";

const {t} = useI18nTypeSafe()
</script>

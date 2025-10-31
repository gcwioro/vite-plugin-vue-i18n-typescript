<template>
  <section class="section">
    <h2 class="section-title">
      Nested Keys Demo
    </h2>
    <p class="text-description">
      Demonstrates accessing deeply nested translation keys with type safety
    </p>

    <div class="space-y-3">
      <div class="card">
        <h3 class="subsection-title">
          User Settings
        </h3>
        <div class="space-y-2">
          <div class="setting-item">
            <span class="text-sm">{{ t('NestedKeysDemo.settings.theme.label') }}</span>
            <span class="text-xs text-gray-500">{{
                t('NestedKeysDemo.settings.theme.description')
              }}</span>
          </div>
          <div class="setting-item">
            <span class="text-sm">{{ t('NestedKeysDemo.settings.notifications.label') }}</span>
            <span class="text-xs text-gray-500">{{
                t('NestedKeysDemo.settings.notifications.description')
              }}</span>
          </div>
          <div class="setting-item">
            <span class="text-sm">{{ t('NestedKeysDemo.settings.privacy.label') }}</span>
            <span class="text-xs text-gray-500">{{
                t('NestedKeysDemo.settings.privacy.description')
              }}</span>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="subsection-title">
          Status Messages
        </h3>
        <div class="space-y-2">
          <div class="status-success">
            {{ t('NestedKeysDemo.status.success') }}
          </div>
          <div class="status-warning">
            {{ t('NestedKeysDemo.status.warning') }}
          </div>
          <div class="status-error">
            {{ t('NestedKeysDemo.status.error') }}
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4 p-3 info-box-gray">
      <p class="text-xs text-gray-600 mb-2 font-semibold">
        Accessing nested keys:
      </p>
      <ul class="space-y-1 text-xs text-gray-700">
        <li class="code-example">
          t('NestedKeysDemo.settings.theme.label')
        </li>
        <li class="code-example">
          t('NestedKeysDemo.status.success')
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import {useI18nTypeSafe} from "virtual:vue-i18n-types";

const {t} = useI18nTypeSafe()
</script>

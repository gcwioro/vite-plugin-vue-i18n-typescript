<template>
  <section class="section">
    <h2 class="section-title">
      Translation Messages ({{ locale }})
    </h2>
    <div class="sub-section">
      <p class="label">
        Shows all translation messages using <b>tm('App')</b>
      </p>

      <pre class="code">{{ JSON.stringify(JSON.parse(JSON.stringify(allMessages)), null, 4) }}</pre>
    </div>
    <div class="sub-section">
      <p class="label">
        Shows all translation messages using <b>import {useI18nTypeSafe,messages} from
        "virtual:vue-i18n-types";</b>
      </p>
      <pre
        class="code"
        v-html="JSON.stringify(JSON.parse(JSON.stringify(messages)), null, 4)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import {messages, useI18nTypeSafe} from "virtual:vue-i18n-types";
import {computed} from "vue";

const {tm, locale} = useI18nTypeSafe()

// Get all messages for the current locale
const allMessages = computed(() => tm('App'))
</script>

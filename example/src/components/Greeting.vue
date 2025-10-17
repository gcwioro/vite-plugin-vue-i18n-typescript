<template>

  <h1 class="">{{ t('Greeting.message', 'not found') }}</h1>

</template>
<script setup lang="ts">
import {useI18nTypeSafe} from "virtual:unplug-i18n-dts-generation";

const {t} = useI18nTypeSafe()
</script>

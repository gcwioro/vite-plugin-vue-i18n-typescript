<template>
  <div class="space-y-6">
    <FileMergingDemo/>
    <PluralizationDemo/>
    <InterpolationDemo/>
    <NestedKeysDemo/>
    <MenuDemo/>
    <MessagesViewer/>
  </div>
</template>

<script setup lang="ts">
import FileMergingDemo from "@/components/FileMergingDemo.vue";
import InterpolationDemo from "@/components/InterpolationDemo.vue";
import MenuDemo from "@/components/MenuDemo.vue";
import MessagesViewer from "@/components/MessagesViewer.vue";
import NestedKeysDemo from "@/components/NestedKeysDemo.vue";
import PluralizationDemo from "@/components/PluralizationDemo.vue";
</script>

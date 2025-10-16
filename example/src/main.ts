import App from './App.vue'
import {createApp} from "vue";

import {createI18nInstancePlugin} from "./i18n/i18n.gen.ts";

const app = createApp(App)

app.use(createI18nInstancePlugin())

app.mount('#app')


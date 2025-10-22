import {createI18nInstancePlugin} from "virtual:vue-i18n-types";
import {createApp} from "vue";

import App from '@/App.vue'


const app = createApp(App)

app.use(createI18nInstancePlugin())

app.mount('#app')


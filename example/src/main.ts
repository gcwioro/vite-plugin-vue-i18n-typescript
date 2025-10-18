import App from './App.vue'
import {createApp} from "vue";
import {createI18nInstancePlugin} from "virtual:vue-i18n-types";

const app = createApp(App)

app.use(createI18nInstancePlugin())

app.mount('#app')


import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import AnimateOnScroll from 'primevue/animateonscroll'
import App from './App.vue'
import router from './router'
import './assets/styles/global.css'
import 'primeicons/primeicons.css'

const app = createApp(App)

app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
})

// Register AnimateOnScroll directive globally
app.directive('animateonscroll', AnimateOnScroll)

app.mount('#app')


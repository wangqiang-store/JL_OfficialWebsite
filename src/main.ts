import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// 引入element-plus
import ElementPlus from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css';
// element-plus zn
import 'dayjs/locale/zh-cn'
import locale from 'element-plus/lib/locale/lang/zh-cn'
import './permission.ts'

// 引入video.js
import Video from 'video.js'
import "videojs-contrib-hls";
import 'video.js/dist/video-js.css'

// 引入animejs
import anime from 'animejs'

// 引入公共样式
import './styles/common.scss'

//引入动画animate.css
import "animate.css"

// 引入时间过滤
import { filterTime } from '@/api/common/common'
const app = createApp(App);

app.config.globalProperties.$filterTime = filterTime;
app.config.globalProperties.$video = Video;
app.config.globalProperties.$anime = anime;
app.use(store).use(router).use(ElementPlus, { locale }).mount('#app')

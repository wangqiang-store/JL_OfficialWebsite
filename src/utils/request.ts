import axios from 'axios';
import store from '../store';
import { getToken,removeToken } from './auth';
import { ElMessage } from 'element-plus';
// import router from 'vue-router'
// 创建axios实例
const service = axios.create({
  baseURL: process.env.BASE_API, // api 的 base_url
  timeout: 5000, // 请求超时时间
})

// request拦截器
service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      config.headers['Authorization'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改 Accept
    } 
    return config
  },
  error => {
    Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  response => {
    if (response.data.code === 401) {
      removeToken()
      localStorage.removeItem('ExpirationTime')
      ElMessage.warning(
        "账号异地登陆,请确认账号情况重新登陆"
      )
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }

    if(response.data.code ===  500){
       ElMessage({
         message:response.data.msg,
         type:"error"
       })
    }
    return response
  },
  error => {
    console.log('err' + error) // for debug
    ElMessage({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)
export default service

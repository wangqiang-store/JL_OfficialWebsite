<template>
  <div class="container">
    <Header v-if="ROUTE.meta.isShow" />
    <router-view
      v-if="isRouterAlive"
      class="view"
    />
    <Footer v-if="ROUTE.meta.isShow" />
  </div>
</template>

<script>
import { defineComponent,nextTick,onMounted,reactive,toRefs,provide } from "vue";
import Header from '@/components/header/index.vue'
import Footer from '@/components/footer/index.vue'
import { useRoute } from "vue-router";
export default defineComponent({
  components: {
    Header,
    Footer,
  },
  setup() {
    // 获取路由实例
    let ROUTE=useRoute();
    let DATA=reactive({
      isRouterAlive: true
    });
    let METHODS=reactive({
      reload() {
        DATA.isRouterAlive=false;
        nextTick(() => {
          DATA.isRouterAlive=true
        })
      }
    });
    provide("reload",METHODS.reload);
    onMounted(() => {
      localStorage.removeItem('Router');
    });
    return {
      ROUTE,
      ...toRefs(DATA),
      ...toRefs(METHODS)
    }
  }
})
</script>

<style scoped lang="scss">
@import url('./styles/reset.scss');
.container {
  // min-height: 100vh;
  display: flex;
  flex-direction: column;
}
// .view{
//   min-height: 500px;
// }
</style>

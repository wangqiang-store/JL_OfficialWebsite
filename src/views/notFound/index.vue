<template>
  <div class="notFound_container">
    <div class="notFound_container_info">
      <p class="info">404</p>
      <p class="infoText">非常抱歉,你要访问的页面不存在</p>
      <el-button
        type="primary"
        @click="handleGoHome"
      >返回首页</el-button>
    </div>
  </div>
</template>
<script lang="ts">
import { useRouter } from 'vue-router';
import { defineComponent, reactive, toRefs, getCurrentInstance } from 'vue';
export default defineComponent({
  setup() {
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    const ROUTRE = useRouter();
    let DATA: any = reactive({});
    let METHODS: any = reactive({
      handleGoHome: () => {
        ROUTRE.push('/');
      },
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>
<style lang="scss" scoped>
@mixin btnStyle {
  position: absolute;
  padding: 5px 10px 5px 10px;
  font-size: 15px;
  color: #3e3a39;
  border-radius: 4px;
  outline: none;
  border: none;
  cursor: pointer;
}
.notFound_container {
  width: 90vw;
  height: 60vh;
  background-image: url('../../assets/images/notFound.png');
  background-repeat: no-repeat;
  background-size: 400px;
  background-position: 30%;
  position: relative;
  margin: 0 auto;
  .notFound_container_goHome {
    top: 70%;
    left: 30%;
    @include btnStyle();
  }
  .notFound_container_back {
    top: 70%;
    left: 50%;
    @include btnStyle();
  }
  .notFound_container_goHome:hover,
  .notFound_container_back:hover {
    color: #3ba9c2;
  }
  .notFound_container_info {
    position: absolute;
    top: 25%;
    left: 50%;
    color: #000;
    font-size: 24px;
    .info {
      font-size: 100px;
      font-weight: 1000;
    }
    .infoText {
      color: #999999;
      font-weight: 0;
    }
    .el-button {
      margin-top: 30px;
    }
  }
}
</style>
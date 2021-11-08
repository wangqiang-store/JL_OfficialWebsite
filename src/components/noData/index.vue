<template>
  <!-- 暂无数据 -->
  <div class="container_body container_noData">
    <el-image
      style="width: 800px; height: 400px"
      :src="require('../../assets/images/noData.jpg')"
      fit="cover"
    ></el-image>
    <h4 class="info">暂无数据</h4>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, getCurrentInstance } from 'vue';
export default defineComponent({
  setup() {
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    let DATA: any = reactive({});
    let METHODS: any = reactive({});
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>
<style lang="scss" scoped>
.container_noData {
  text-align: center;
  position: relative;
  /deep/ .el-image__inner {
    -webkit-user-drag: none;
    user-select: none;
  }
  .info {
    position: absolute;
    top: 10%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 22px;
    font-weight: 600;
    color: palegoldenrod;
  }
}
</style>
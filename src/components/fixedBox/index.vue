<template>
  <!-- 电话、QQ -->
  <div class="fixed_box">
    <ul>
      <li
        class="fixed_box_iphone"
        @mousemove="handleMoveIphone"
        @mouseout="handleOutIphone"
      >
        <i class="iconfont icon-dianhua"></i>
        <div v-if="focusIphone">
          <p>咨询热线:</p>
          <p>{{hotLine}}</p>
        </div>
      </li>
      <li
        class="fixed_box_qq"
        @mousemove="handleMoveQQ"
        @mouseout="handleOutQQ"
      >
        <i class="iconfont icon-qq"></i>
        <div v-if="focusQQ">
          <p>在线咨询:</p>
          <p>
            <i class="iconfont icon-qq"></i>
            <span>{{consultation}}</span>
          </p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { defineComponent,reactive,toRefs } from "vue";

export default defineComponent({
  props: {
    hotLine: {
      type: String,
      default: ""
    },
    consultation: {
      type: String,
      default: ""
    }
  },
  setup() {
    let DATA=reactive({
      focusQQ: false,
      focusIphone: false
    });
    let METHODS=reactive({
      handleMoveIphone: () => {
        DATA.focusIphone=true;
      },
      handleOutIphone: () => {
        DATA.focusIphone=false;
      },
      handleMoveQQ: () => {
        DATA.focusQQ=true;
      },
      handleOutQQ: () => {
        DATA.focusQQ=false;
      },
    })
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS)
    }
  }
})
</script>

<style scoped>
@import url('../../font/iconfont/iconfont.css');
/* 固定框 */
.fixed_box {
  position: fixed;
  top: 30%;
  right: 0;
  z-index: 999999;
}
.fixed_box_iphone,
.fixed_box_qq {
  width: 60px;
  height: 60px;
  background-color: #4f5158;
  text-align: center;
  color: #fff;
  line-height: 60px;
  margin-bottom: 1px;
  position: relative;
}
.fixed_box_iphone i,
.fixed_box_qq i {
  font-size: 32px;
}
.fixed_box_iphone:hover,
.fixed_box_qq:hover {
  background-color: #008cd6;
}
.fixed_box_iphone > div,
.fixed_box_qq > div {
  width: 150px;
  height: 80px;
  background-color: #4f5158;
  position: absolute;
  top: 0;
  left: -151px;
  color: #fff;
  line-height: 20px;
  display: flex;
  justify-content: center;
  align-content: center;
  flex-direction: column;
}
.fixed_box_qq > div i {
  font-size: 14px;
}
</style>
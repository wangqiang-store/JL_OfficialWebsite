<template>
  <div class="container">
    <div class="container_head">
      <el-image
        style="width: 100%; height: auto"
        :src="require('../../assets/images/subPageHead.jpg')"
        fit="cover"
      ></el-image>

      <div
        class="container_table"
        v-if="isShowTab"
      >
        <template
          v-for="item of subModuleList"
          :key="item.id"
        >
          <div
            class="container_table_head"
            :class="item.name == activeName ? 'isActive' : ''"
            @click="handleClickTab(item)"
            v-if="item.name != '发展历程'"
          >
            <span>{{item.name}}</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { useRoute, useRouter } from 'vue-router';
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  onMounted,
  watch,
} from 'vue';
import { IMG_File, RES_SUCCESS, sessionRead } from '@/api/common/common';
export default defineComponent({
  props: {
    isShowTab: {
      type: Boolean,
      default: true,
    },
  },
  setup() {
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    // 获取路由实例
    const ROUTE = useRoute();
    const ROUTER = useRouter();
    let DATA: any = reactive({
      activeName: '',
      subModuleList: [],
    });
    let METHODS: any = reactive({
      // 点击tab栏
      handleClickTab: (item: any) => {
        DATA.activeName = item.name;
        METHODS.handleRedirect(item);
        proxy.$emit('handleClickTab', item);
        if (item.type == 8) {
          // 判断引用子模块是否存在
          let bool = sessionRead('FRONTSUB').some((val: any) => {
            return val.id === item.reference;
          });
          if (!bool) {
            ROUTER.push('/NotFound');
            return;
          }
          let type: any = '';
          sessionRead('FRONTSUB').forEach((val: any) => {
            if (item.reference === val.id) {
              type = val.type;
            }
          });
          let itemObj = Object.assign({}, { ...item, type });
          let query: any = {
            id: itemObj.id,
            refId: itemObj.reference,
            parentId: itemObj.parentId,
          };
          switch (type) {
            case 1:
              ROUTER.push({ name: 'frontpageSingleImg', query });
              break;
            case 2:
              ROUTER.push({ name: 'frontpageMoreImg', query });
              break;
            case 3:
              ROUTER.push({ name: 'frontpageSingleVideo', query });
              break;
            case 4:
              ROUTER.push({ name: 'frontpageMoreVideo', query });
              break;
            case 5:
              ROUTER.push({ name: 'frontpageSingleDoc', query });
              break;
            case 6:
              ROUTER.push({ name: 'frontpageMoreDoc', query });
              break;
            case 7:
              ROUTER.push({ name: 'frontpageTwoDoc', query });
              break;
            default:
              break;
          }
        }
      },
      // 跳转页面
      handleRedirect: (item: any) => {
        let query = { id: item.id, parentId: item.parentId };
        switch (item.type) {
          case 1:
            ROUTER.push({ name: 'frontpageSingleImg', query });
            break;
          case 2:
            ROUTER.push({ name: 'frontpageMoreImg', query });
            break;
          case 3:
            ROUTER.push({ name: 'frontpageSingleVideo', query });
            break;
          case 4:
            ROUTER.push({ name: 'frontpageMoreVideo', query });
            break;
          case 5:
            ROUTER.push({ name: 'frontpageSingleDoc', query });
            break;
          case 6:
            ROUTER.push({ name: 'frontpageMoreDoc', query });
            break;
          case 7:
            ROUTER.push({ name: 'frontpageTwoDoc', query });
            break;
          default:
            break;
        }
      },
      // 获取子模块
      handleGetModule: () => {
        sessionRead('HEADNAV').forEach((item: any) => {
          if (item.id == ROUTE.query.parentId) {
            DATA.subModuleList = item.children;
          }
        });
        DATA.subModuleList.forEach((item: any) => {
          if (item.id == ROUTE.query.id) {
            DATA.activeName = item.name;
          }
        });
      },
    });
    watch(
      () => ROUTE.query.id,
      () => {
        METHODS.handleGetModule();
      }
    );
    onMounted(() => {
      METHODS.handleGetModule();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      IMG_File,
    };
  },
});
</script>
<style lang="scss" scoped>
.container {
  margin-top: 100px !important;
  /deep/ .el-tabs__nav {
    left: 50%;
    transform: translateX(-50%) !important;
  }
  /deep/ .el-tabs__nav-scroll {
    background-color: #f6f6f6;
  }
  /deep/ .el-tabs__item.is-active {
    color: #fff;
    background-color: $theme-colors;
  }
  .container_table {
    width: 100%;
    background-color: #f6f6f6;
    margin: 0 auto;
    // position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    .container_table_head {
      border: 1px solid #ddd;
      min-width: 100px;
      height: 40px;
      text-align: center;
      line-height: 40px;
      font-size: 14px;
      color: #000;
      &:not(.isActive):hover {
        color: #fff;
        background-color: $theme-colors;
      }
    }
    .isActive {
      background-color: $theme-colors;
      color: #fff;
    }
  }
}
</style>
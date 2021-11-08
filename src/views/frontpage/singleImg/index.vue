<template>
  <div class="container">
    <!-- 面包屑 -->
    <el-breadcrumb
      separator-class="el-icon-arrow-right"
      style="margin:10px 0 10px 10px"
    >
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>{{formatName(ROUTE.query.parentId,sessionRead("FRONTPARENT"))}}</el-breadcrumb-item>
      <el-breadcrumb-item>{{formatName(ROUTE.query.id,sessionRead("FRONTSUB"))}}</el-breadcrumb-item>
    </el-breadcrumb>
    <div
      class="container_body"
      v-if="moduleData.multimedia"
    >
      <div>
        <el-image
          style="width: 100%; height: auto"
          :src="`${IMG_File}${moduleData.multimedia}`"
          fit="contain"
        ></el-image>
        <h3>{{ moduleData.name }}</h3>
      </div>
    </div>
    <!-- 暂无数据 -->
    <div
      v-if="!moduleData.multimedia && isSuccess"
      class="container_body container_noData"
    >
      <el-image
        style="width: 800px; height: 400px"
        :src="require('../../../assets/images/noData.jpg')"
        fit="cover"
      ></el-image>
      <h4 class="info">暂无数据</h4>
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
import { getMediaByTypeAndEnable } from '@/api/homePage/homePage';
import { IMG_File, RES_SUCCESS, sessionRead } from '@/api/common/common';
import { useStore } from 'vuex';
export default defineComponent({
  setup() {
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    // 获取路由实例
    const ROUTE = useRoute();
    const ROUTER = useRouter();
    const STORE = useStore();
    let DATA: any = reactive({
      pagingObj: {
        limit: 12,
        page: 1,
        subModuleId: ROUTE.query.refId || ROUTE.query.id,
      },
      moduleData: [],
      activeName: '',
      subModuleList: [],
      isSuccess: false,
    });
    let METHODS: any = reactive({
      // 获取模块数据
      handleGetModuleData: async () => {
        let { data } = await getMediaByTypeAndEnable(DATA.pagingObj);
        if (data.code === RES_SUCCESS) {
          DATA.moduleData =
            data.data.records.length > 0 ? data.data.records[0] : [];
          DATA.isSuccess = true;
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
      // 格式化 父模块名称
      formatName: (id: number, data: any[]) => {
        let name = '';
        data.forEach((item) => {
          if (id == item.id) {
            name = item.name;
          }
        });
        return name;
      },
    });
    let stop = watch(
      [() => ROUTE.query.id, () => ROUTE.path],
      ([newData, newPath], [oldData, oldPath]) => {
        DATA.pagingObj.subModuleId = ROUTE.query.refId || ROUTE.query.id;
        if (newPath === oldPath) {
          newData && METHODS.handleGetModuleData();
        }
      }
    );
    onMounted(() => {
      DATA.pagingObj.subModuleId = ROUTE.query.refId || ROUTE.query.id;
      METHODS.handleGetModuleData();
      METHODS.handleGetModule();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      IMG_File,
      ROUTE,
      sessionRead,
      STORE,
    };
  },
});
</script>
<style lang="scss" scoped>
.container {
  /deep/ .el-tabs__nav {
    left: 50%;
    transform: translateX(-50%) !important;
  }
  /deep/ .el-tabs__nav-scroll {
    background-color: #f6f6f6;
  }
  /deep/ .el-tabs__item.is-active {
    color: #fff;
    background-color: #409eff;
  }
  .container_body {
    width: 1200px;
    margin: 0 auto;
    text-align: center;
    /deep/ .el-image__inner {
      width: 100%;
      height: auto;
      user-select: none;
      -webkit-user-drag: none;
    }
    margin-bottom: 10px;
    margin-top: 10px;
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
      width: 100px;
      height: 40px;
      text-align: center;
      line-height: 40px;
      font-size: 14px;
      color: #000;
      &:not(.isActive):hover {
        color: #409eff;
      }
    }
    .isActive {
      background-color: #409eff;
      color: #fff;
    }
  }
  .container_noData {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    /deep/ .el-image__inner {
      -webkit-user-drag: none;
      height: 400px;
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
}
</style>
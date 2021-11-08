<template>
  <div class="container">
    <!-- <sub-module /> -->
    <!-- 面包屑 -->
    <el-breadcrumb
      separator-class="el-icon-arrow-right"
      style="margin:10px 0 10px 10px"
    >
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item v-if="ROUTE.query.parentId">{{formatName(ROUTE.query.parentId,sessionRead("FRONTPARENT"))}}</el-breadcrumb-item>
      <el-breadcrumb-item v-if="ROUTE.query.subId">{{formatName(ROUTE.query.subId,sessionRead("FRONTSUB"))}}</el-breadcrumb-item>
      <el-breadcrumb-item v-if="ROUTE.query.name">{{ROUTE.query.name}}</el-breadcrumb-item>
      <el-breadcrumb-item v-if="moduleData">{{moduleData.name}}</el-breadcrumb-item>
    </el-breadcrumb>
    <div
      class="container_body"
      v-if="moduleData"
    >
      <el-card :body-style="{ padding: '0px' }">
        <div style="text-align:center">
          <!-- <img
            v-if="moduleData.multimedia"
            :src="`${IMG_File}${moduleData.multimedia}`"
            class="image"
            width="600"
            height="400"
            style="margin-top:10px;"
          > -->

          <div style="padding: 14px;">
            <h2>{{moduleData.name}}</h2>
          </div>
        </div>

        <div
          class="richText"
          v-html="moduleData.htmlData"
        >
        </div>
      </el-card>
    </div>
    <!-- 暂无数据 -->
    <div
      v-if="!moduleData && isSuccess"
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
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  onMounted,
  watch,
} from 'vue';
import SubModule from '@/components/submodule/index.vue';
import { IMG_File, RES_SUCCESS, sessionRead } from '@/api/common/common';
import { useRoute } from 'vue-router';
import {
  getMediaByMyId,
  getMediaByTypeAndEnable,
} from '@/api/homePage/homePage';
import { useStore } from 'vuex';
export default defineComponent({
  components: {
    SubModule,
  },
  setup() {
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    // 获取路由实例
    const ROUTE = useRoute();
    const STORE = useStore();
    let DATA: any = reactive({
      pagingObj: {
        limit: 12,
        page: 1,
        MediaId: ROUTE.query.id,
      },
      moduleData: null,
      // 判断请求是否成功
      isSuccess: false,
    });
    let METHODS: any = reactive({
      // 获取分页数据
      handleGetPagingData: async () => {
        let { data } = await getMediaByMyId(DATA.pagingObj);
        if (data.code === RES_SUCCESS) {
          DATA.moduleData = data.data;
          DATA.isSuccess = true;
        }
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
        DATA.pagingObj.MediaId = newData;
        if (newPath === oldPath) {
          newData && METHODS.handleGetPagingData();
        }
      }
    );
    onMounted(() => {
      DATA.pagingObj.MediaId = ROUTE.query.id;
      METHODS.handleGetPagingData();
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
  .container_body {
    width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    // text-align: center;
    & > div {
      width: 100%;
      margin-right: 5px;
      margin-top: 10px;
      margin-bottom: 10px;
    }
    .richText {
      font-size: 16px;
      padding: 10px;
      // text-align: start;
      // text-indent: 30px;
      box-sizing: border-box;
      /deep/ p {
        margin: 10px 0;
      }
      /deep/ span {
        // font-family: cursive !important;
      }
      // /deep/ img {
      //   width: 30% !important;
      //   height: 30% !important;
      //   margin-right: 5px;
      // }
    }
  }
  .container_noData {
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
}
</style>
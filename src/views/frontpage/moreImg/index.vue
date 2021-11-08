<template>
  <div class="container">
    <!-- <sub-module /> -->
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
      v-if="moduleData.length>0"
      :class="moduleData.length === 1 ? 'd_flex_c' : ''"
    >
      <div
        v-for="item of moduleData"
        :key="item.id"
        class="container_body_item"
      >
        <el-card :body-style="{ padding: '0px' }">
          <el-image
            :src="`${IMG_File}${item.multimedia}`"
            class="image"
            style="width: 100%; height: 250px;padding: 20px 20px 0 20px"
            :preview-src-list="srcList"
            :title="item.name"
          >
          </el-image>
          <div style="padding: 14px;">
            <h4>{{item.name}}</h4>
          </div>
        </el-card>
      </div>
    </div>
    <!-- 暂无数据 -->
    <div
      v-if="!moduleData.length>0 && isSuccess"
      class="container_body container_noData"
    >
      <el-image
        style="width: 800px; height: 400px"
        :src="require('../../../assets/images/noData.jpg')"
        fit="cover"
      ></el-image>
      <h4 class="info">暂无数据</h4>
    </div>

    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      layout="total, prev, pager, next, jumper"
      :total="total"
      v-if="total!==0"
      class="pagination"
      :page-size="12"
    >
    </el-pagination>
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
import { useRoute } from 'vue-router';
import { getMediaByTypeAndEnable } from '@/api/homePage/homePage';
import { IMG_File, RES_SUCCESS, sessionRead } from '@/api/common/common';
import ElePagination from '@/components/elePagination/index.vue';
import { mapState, useStore } from 'vuex';
export default defineComponent({
  components: {
    SubModule,
    ElePagination,
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
        subModuleId: ROUTE.query.refId || ROUTE.query.id,
      },
      moduleData: [],
      total: 0,
      srcList: [],
      isSuccess: false,
    });
    let METHODS: any = reactive({
      // 获取模块数据
      handleGetModuleData: async () => {
        let { data } = await getMediaByTypeAndEnable(DATA.pagingObj);
        if (data.code === RES_SUCCESS) {
          DATA.moduleData = data.data.records;
          DATA.total = data.data.total;
          DATA.isSuccess = true;
          if (data.data.records.length > 0) {
            data.data.records.forEach((item: any) => {
              DATA.srcList.push(`${IMG_File}${item.multimedia}`);
            });
          }
        }
      },
      // 修改显示个数
      handleSizeChange: (val: number) => {
        DATA.pagingObj.limit = val;
        METHODS.handleGetModuleData();
      },
      // 修改显示页数
      handleCurrentChange: (val: number) => {
        DATA.pagingObj.page = val;
        METHODS.handleGetModuleData();
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
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    text-align: center;
    box-sizing: border-box;
    position: relative;
    .container_body_item {
      width: 33.3%;
      padding: 10px;
      box-sizing: border-box;
      /deep/ .el-card__body {
        height: 300px;
        h4 {
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      }
    }
    // /deep/ .el-card__body {
    //   padding: 20px !important;
    // }
  }
  .pagination {
    width: 1200px;
    margin: 10px auto;
    text-align: right;
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
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
      <el-breadcrumb-item>{{formatName(ROUTE.query.id,sessionRead("FRONTSUB"))}}</el-breadcrumb-item>
    </el-breadcrumb>
    <div
      class="container_body"
      v-if="moduleData.length>0"
    >
      <!-- 文档 -->
      <div
        class="container_body_doc"
        :class="moduleData.length ===1 ? 'd_flex_c' : ''"
      >
        <!-- 横向排版 -->
        <template v-if="contentOrder === true">
          <el-card
            class="container_body_doc_item"
            v-for="item of moduleData"
            :key="item.id"
            @click="handleCard(item)"
          >
            <el-image
              :src="`${IMG_File}${item.multimedia}`"
              fit="cover"
              class="container_body_doc_item_left"
            >
              <template #error>
                <div class="image-slot">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </template>
            </el-image>
            <div class="container_body_doc_item_right">
              <h4
                style="text-align:center;margin-top:5px"
                class="text-ellipses"
              >{{item.name}}</h4>
              <!-- <p
              class="plainText"
              v-html="item.plainText"
            ></p>
            <p style="text-align:right">{{proxy.$filterTime(item.createTime,"-")}}</p> -->
            </div>
          </el-card>
        </template>

        <!-- 纵向排版 -->
        <template v-if="contentOrder === false">
          <el-row
            type="flex"
            justify="space-around"
            class="container_body_vertical"
            v-for="item of moduleData"
            :key="item.id"
            @click="handleCard(item)"
          >
            <el-col :span="6">
              <el-image
                :src="`${IMG_File}${item.multimedia}`"
                fit="cover"
                class="container_body_vertical_left"
              >
                <template #error>
                  <div class="image-slot">
                    <i class="el-icon-picture-outline"></i>
                  </div>
                </template>
              </el-image>
            </el-col>
            <el-col
              :span="16"
              class="container_body_vertical_right"
            >
              <h3>{{item.name}}</h3>
              <p
                v-html="item.plainText"
                class="more-ellipses"
                style="color:#4e5157"
              ></p>
              <!-- <p style="text-align:right;color:#4e5157">{{proxy.$filterTime(item.createTime,"-")}}</p> -->
            </el-col>
          </el-row>
        </template>
      </div>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        layout="total, prev, pager, next, jumper"
        :page-size="12"
        :total="total"
        v-if="total!==0"
        class="pagination"
      >
      </el-pagination>
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
  ref,
} from 'vue';
import SubModule from '@/components/submodule/index.vue';
import { useRoute, useRouter } from 'vue-router';
import { getMediaByTypeAndEnable } from '@/api/homePage/homePage';
import { IMG_File, RES_SUCCESS, sessionRead } from '@/api/common/common';
import ElePagination from '@/components/elePagination/index.vue';
import { useStore } from 'vuex';
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
    const ROUTER = useRouter();
    const STORE = useStore();
    let DATA: any = reactive({
      pagingObj: {
        limit: 12,
        page: 1,
        subModuleId: ROUTE.query.refId || ROUTE.query.id,
      },
      moduleData: [],
      total: 0,
      isSuccess: false,
      contentOrder: null,
    });
    let METHODS: any = reactive({
      // 获取模块数据
      handleGetModuleData: async () => {
        let { data } = await getMediaByTypeAndEnable(DATA.pagingObj);
        if (data.code === RES_SUCCESS) {
          DATA.moduleData = data.data.records;
          DATA.total = data.data.total;
          DATA.isSuccess = true;
          DATA.contentOrder = data.contentOrder;
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
      // 点击文档
      handleCard: (item: any) => {
        stop();
        ROUTER.push({
          name: 'document',
          query: {
            id: item.id,
            parentId: ROUTE.query.parentId,
            subId: ROUTE.query.id,
          },
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
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      sessionRead,
      IMG_File,
      ROUTE,
      proxy,
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
    position: relative;
    .container_body_doc {
      display: flex;
      // justify-content: center;
      align-items: center;
      cursor: pointer;
      flex-wrap: wrap;
    }
    .container_body_doc_item {
      width: 33.33%;
      padding: 10px;
      &:hover h3 {
        color: #0193de;
        // background-color: #0193de;
      }
      // /deep/ .el-card__body {
      //   display: flex;
      //   justify-content: space-between;
      //   align-items: center;
      // }
      /deep/ .el-card {
        height: 310px;
      }
      .container_body_doc_item_left {
        width: 100%;
        /deep/ .el-image__inner {
          width: 100%;
          height: 240px;
          -webkit-user-drag: none;
          user-select: none;
          // transition: all 2s;
          // &:hover {
          //   transform: scale(1.5);
          // }
        }
      }
      .container_body_doc_item_right {
        .plainText {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
          text-indent: 20px;
          color: #282c34;
          margin: 10px 0;
          &:hover {
            color: #169bd5;
          }
        }
        // &:hover {
        //   color: #169bd5;
        // }
      }
    }
    // 纵向排版
    .container_body_vertical {
      border-bottom: 2px dotted #ebebeb;
      &:last-child {
        border-bottom: none;
      }
      padding: 20px 10px;
      .container_body_vertical_left {
        width: 100%;
        box-shadow: 0 0 10px 5px #b5b5b5;
        /deep/ .el-image__inner {
          width: 100%;
          height: 175px;
          -webkit-user-drag: none;
          user-select: none;
        }
      }
      .container_body_vertical_right {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        h3 {
          margin-bottom: 10px;
        }
      }
      &:hover {
        background: #eeeeee;
      }
    }
  }
  // 无数据
  .container_noData {
    text-align: center;
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
  .pagination {
    text-align: right;
    margin: 10px 0 10px 0;
  }
}
</style>
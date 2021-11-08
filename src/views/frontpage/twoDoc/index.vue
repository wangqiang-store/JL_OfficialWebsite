<template>
  <div class="container">
    <!-- <sub-module /> -->
    <div class="d_flex">
      <!-- 面包屑 -->
      <el-breadcrumb
        separator-class="el-icon-arrow-right"
        style="margin:10px 20px 10px 10px"
      >
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{formatName(ROUTE.query.parentId,sessionRead("FRONTPARENT"))}}</el-breadcrumb-item>
        <el-breadcrumb-item>{{formatName(ROUTE.query.id,sessionRead("FRONTSUB"))}}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div
      class="container_body"
      v-if="classifyList.length>0"
    >
      <!-- 文档 -->
      <div class="container_body_doc">
        <el-card class="container_body_doc_item">
          <el-collapse v-model="activeNames">
            <el-collapse-item
              v-for="item of classifyList"
              :key="item.id"
              :title="`${item.name}>>`"
              :name="item.id+''"
            >
              <p
                v-for="val of item.moduleData"
                :key="val.id"
                class="container_body_doc_item_title"
                @click="handleCard(val)"
              >
                {{val.name}}
              </p>
              <p
                v-if="item.total > 10 && item.size <= item.total"
                class="container_body_doc_item_title"
                @click="handleMore(item)"
              >更多>></p>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </div>
    </div>

    <!-- 暂无数据 -->
    <div
      v-if="!classifyList.length>0 && isSuccess"
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
  nextTick,
  inject,
} from 'vue';
import SubModule from '@/components/submodule/index.vue';
import { useRoute, useRouter } from 'vue-router';
import {
  getMediaByTypeAndEnable,
  getSecondMediaByTypeAndEnable,
} from '@/api/homePage/homePage';
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
    let reload:any = inject('reload');
    let DATA: any = reactive({
      pagingObj: {
        limit: 10,
        page: 1,
        subModuleId: ROUTE.query.refId || ROUTE.query.id,
      },
      pagingDocObj: {
        limit: 10,
        page: 1,
        MediaId: '',
      },
      moduleData: [],
      total: 0,
      classifyList: [],
      name: '',
      isSuccess: false,
      activeNames: [],
      limit: 10,
    });
    let METHODS: any = reactive({
      // 获取模块数据
      handleGetModuleData: async () => {
        DATA.activeNames = [];
        DATA.classifyList = [];
        let { data } = await getMediaByTypeAndEnable(DATA.pagingObj);
        if (data.code === RES_SUCCESS) {
          DATA.classifyList = data.data.records;
          if (DATA.classifyList.length > 0) {
            DATA.classifyList.forEach(async (item: any) => {
              DATA.activeNames.push(item.id + '');
              let data = await METHODS.handleGetTwoDocData({
                limit: 10,
                page: 1,
                MediaId: item.id,
              });
              item.moduleData = data.records;
              item.total = data.total;
              item.size = data.size;
            });
          } else {
            DATA.moduleData = [];
            DATA.pagingDocObj.MediaId = '';
            DATA.isSuccess = true;
          }
        }
      },
      // 根据二级文档分类获取数据
      handleGetTwoDocData: async (pagingDocObj: any) => {
        let { data } = await getSecondMediaByTypeAndEnable(pagingDocObj);
        if (data.code === RES_SUCCESS) {
          return data.data;
        }
      },
      // 切换分类
      handleChange: () => {
        DATA.classifyList.forEach((item: any) => {
          if (item.id === DATA.pagingDocObj.MediaId) {
            DATA.name = item.name;
          }
        });
        METHODS.handleGetTwoDocData();
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
            name: DATA.name,
            MediaId: DATA.pagingDocObj.MediaId,
          },
        });
      },
      // 点击更多
      handleMore: async (item: any) => {
        DATA.limit += 10;
        let data = await METHODS.handleGetTwoDocData({
          limit: DATA.limit,
          page: 1,
          MediaId: item.id,
        });
        item.moduleData = data.records;
        item.total = data.total;
        item.size = data.size;
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
          newData && reload();
        }
      }
    );
    onMounted(() => {
      DATA.pagingObj.subModuleId = ROUTE.query.refId || ROUTE.query.id;
      nextTick(() => {
        METHODS.handleGetModuleData();
      });
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
    margin-top: 10px;
    .container_body_doc {
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      flex-wrap: wrap;
    }
    .container_body_doc_item {
      width: 100%;
      margin: 0 10px 10px 10px;
      /deep/ .el-card__body {
        padding: 0;
      }
      /deep/ .el-collapse-item__header {
        font-weight: bold;
        background-color: #99ccff;
        font-size: 14px;
        &::before {
          width: 10px;
          height: 100%;
          background-color: #f2a31a;
          display: inline-block;
          margin-right: 5px;
          content: '';
        }
      }
      .container_body_doc_item_title {
        padding: 10px;
        text-indent: 24px;
        color: #3badd4;
        font-size: 15px;
        font-weight: 600;
        &:hover {
          color: #f9873d;
          text-decoration: underline;
        }
      }
      /deep/ .el-collapse-item__content {
        background-color: #eeeeee;
        padding: 0;
      }
      .container_body_doc_item_left {
        width: 100%;
        /deep/ .el-image__inner {
          width: 100%;
          height: 240px;
          -webkit-user-drag: none;
          user-select: none;
        }
      }
      .container_body_doc_item_right {
        .plainText {
          text-indent: 20px;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
          color: #282c34;
          margin: 10px 0;
          &:hover {
            color: #169bd5;
          }
        }
      }
    }
  }
  .container_noData {
    display: flex;
    justify-content: center;
    align-items: center;
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
  /deep/ .el-collapse-item__header {
    font-size: 16px !important;
  }
}
</style>
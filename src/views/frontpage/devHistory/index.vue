<template>
  <div class="container">
    <!-- 头部图片 -->
    <!-- <sub-module :isShowTab="false" /> -->

    <!-- 面包屑 -->
    <el-breadcrumb
      separator-class="el-icon-arrow-right"
      style="margin:10px 20px 10px 10px"
    >
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>发展历程</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 发展历程 -->
    <el-timeline v-if="devHistoryData">
      <template
        v-for="item of devHistoryData"
        :key="item.id"
      >
        <el-timeline-item
          :timestamp="item.year+''"
          placement="top"
          :color="item.color"
        >
          <el-card
            @click="handleClickDevHistory(item)"
            style="text-align: center"
          >
            <el-image
              v-if="item.image"
              :src="`${IMG_File}${item.image}`"
              fit="cover"
              class="image"
              style="width:300px;"
            ></el-image>
            <p style="text-align:center;max-width:500px;margin-top:10px;">{{item.title}}</p>
          </el-card>
        </el-timeline-item>
      </template>
    </el-timeline>
    <no-data v-if="!devHistoryData.length>0 && isSuccess"></no-data>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  onMounted,
} from 'vue';
import SubModule from '@/components/submodule/index.vue';
import NoData from '@/components/noData/index.vue';
import { getAllDevHistory } from '@/api/homePage/homePage';
import { IMG_File, RES_SUCCESS, sessionRead } from '@/api/common/common';
import { useRouter } from 'vue-router';
export default defineComponent({
  components: {
    SubModule,
    NoData,
  },
  setup() {
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    // 获取路由实例
    const ROUTER = useRouter();
    let DATA: any = reactive({
      devHistoryData: [],
      isSubId: false,
      isSuccess: false,
    });
    let METHODS: any = reactive({
      // 获取所有发展历程
      handleGetAllDevHistory: async () => {
        let { data } = await getAllDevHistory();
        if (data.code === RES_SUCCESS) {
          DATA.devHistoryData = data.data;
          // DATA.devHistoryData.sort((a: any, b: any) => {
          //   return a['year'] - b['year'];
          // });
          DATA.isSuccess = true;
          DATA.devHistoryData.forEach((item: any) => {
            item.color = '#e06c75';
          });
        }
      },
      // 点击卡片
      handleClickDevHistory: (item: any) => {
        METHODS.handleRedirect(item);
        if (item.type === 8) {
          let type: any = '';
          sessionRead('FRONTSUB').forEach((val: any) => {
            if (item.reference === val.id) {
              type = val.type;
            }
          });
          let itemObj = Object.assign({}, { ...item, type });
        }
      },
      // 封装跳转页面
      handleRedirect: (item: any) => {
        if (item.type === 9) {
          return;
        }
        // 判断父模块是否存在
        let isParent = sessionRead('FRONTPARENT').some((val: any) => {
          return val.id === item.parentModuleId;
        });
        if (!isParent) {
          ROUTER.push('/NotFound');
          return;
        }
        DATA.isSubId = false;
        sessionRead('FRONTSUB').forEach((val: any) => {
          if (val.id === item.submoduleId) {
            DATA.isSubId = true;
          }
        });
        if (!DATA.isSubId) {
          ROUTER.push('/NotFound');
          return;
        }
        // 判断是否为引用类型
        let query = { id: item.submoduleId, parentId: item.parentModuleId };
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
            ROUTER.push({
              name: 'document',
              query: {
                id: item.reference,
                parentId: item.parentModuleId,
                subId: item.submoduleId,
              },
            });
            break;
          case 7:
            ROUTER.push({
              name: 'document',
              query: {
                id: item.reference,
                parentId: item.parentModuleId,
                subId: item.submoduleId,
                MediaId: item.mediaId,
              },
            });
            break;
          default:
            break;
        }
      },
    });
    onMounted(() => {
      METHODS.handleGetAllDevHistory();
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
  .el-timeline {
    width: 1200px !important;
    margin: 0 auto !important;
    margin-top: 35px !important;
    .image {
      /deep/ .el-image__inner {
        max-width: 500px;
        user-select: none;
        -webkit-user-drag: none;
      }
    }
  }
  /deep/ .el-card {
    cursor: pointer;
    max-width: 500px;
  }
}
</style>
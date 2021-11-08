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
      :class="moduleData.length ===1 ? 'd_flex_c' : ''"
      v-if="moduleData.length>0"
    >
      <div
        v-for="item of moduleData"
        :key="item.id"
        class="container_body_item"
      >
        <el-card :body-style="{ padding: '0px' }">
          <!-- <video
            :src="`${IMG_File}${item.multimedia}`"
            controls
          ></video> -->
          <video
            :id="`video${item.id}`"
            class="video-js vjs-default-skin"
            controls
          >
            <source
              :src="`${IMG_File}${item.multimedia}`"
              type="application/x-mpegURL"
            >
          </video>
          <div style="padding: 14px;">
            <h4 class="text-ellipses">{{item.name}}</h4>
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
      :page-size="12"
      class="pagination"
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
  nextTick,
  inject,
  onUnmounted,
} from 'vue';
import SubModule from '@/components/submodule/index.vue';
import { IMG_File, RES_SUCCESS, sessionRead } from '@/api/common/common';
import { useRoute } from 'vue-router';
import { getMediaByTypeAndEnable } from '@/api/homePage/homePage';
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
    const STORE = useStore();
    let DATA: any = reactive({
      pagingObj: {
        limit: 12,
        page: 1,
        subModuleId: ROUTE.query.refId || ROUTE.query.id,
      },
      moduleData: [],
      total: 0,
      myVideo: [],
      isSuccess: false,
    });
    let reload: any = inject('reload');
    let METHODS: any = reactive({
      // 获取分页数据
      handleGetModuleData: async () => {
        let { data } = await getMediaByTypeAndEnable(DATA.pagingObj);
        if (data.code === RES_SUCCESS) {
          DATA.moduleData = data.data.records;
          DATA.total = data.data.total;
          DATA.isSuccess = true;
          setTimeout(() => {
            METHODS.initVideo();
          }, 300);
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
      initVideo() {
        //初始化视频方法
        if (DATA.moduleData) {
          DATA.moduleData.forEach((item: any) => {
            let myVideo = proxy.$video(`video${item.id}`, {
              bigPlayButton: false,
              textTrackDisplay: false,
              posterImage: true,
              errorDisplay: false,
              controlBar: true,
            });
            // .play();
            DATA.myVideo.push(myVideo);
          });
        }
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
      METHODS.handleGetModuleData();
    });
    onUnmounted(() => {
      if (DATA.myVideo) {
        DATA.myVideo.forEach((item: any) => {
          item.dispose(); // 该方法会重置videojs的内部状态并移除dom
        });
      }
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
    align-items: center;
    text-align: center;
    flex-wrap: wrap;
    position: relative;
    .container_body_item {
      width: 33.3%;
      // margin-right: 5px;
      // margin-top: 10px;
      // margin-bottom: 10px;
      padding: 10px;
      .video-js {
        width: 100%;
        height: 250px;
      }
    }
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
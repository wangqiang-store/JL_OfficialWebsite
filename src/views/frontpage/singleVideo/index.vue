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
      v-if="subModuleData"
    >
      <el-card :body-style="{ padding: '0px' }">
        <!-- <video
          :src="`${IMG_File}${subModuleData.multimedia}`"
          controls
          width="480"
        ></video> -->
        <video
          id="video"
          class="video-js vjs-default-skin"
          controls
        >
          <source
            :src="`${IMG_File}${subModuleData.multimedia}`"
            type="application/x-mpegURL"
          >
        </video>
        <div style="padding: 14px;">
          <h4>{{subModuleData.name}}</h4>
        </div>
        <!-- <i
          v-if="isPlay"
          class="iconfont icon-bofang"
        ></i>
        <i
          v-else
          class="iconfont icon-zanting"
        ></i> -->
      </el-card>
    </div>
    <!-- 暂无数据 -->
    <div
      v-if="!subModuleData && isSuccess"
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
  onUnmounted,
  onBeforeUnmount,
  inject,
} from 'vue';
import SubModule from '@/components/submodule/index.vue';
import { IMG_File, RES_SUCCESS, sessionRead } from '@/api/common/common';
import { useRoute } from 'vue-router';
import { getMediaByTypeAndEnable } from '@/api/homePage/homePage';
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
        subModuleId: ROUTE.query.refId || ROUTE.query.id,
      },
      subModuleData: null,
      isPlay: true,
      myVideo: '',
      isSuccess: false,
    });
    let reload: any = inject('reload');
    let METHODS: any = reactive({
      // 获取分页数据
      handleGetPagingData: async () => {
        let { data } = await getMediaByTypeAndEnable(DATA.pagingObj);
        if (data.code === RES_SUCCESS) {
          DATA.subModuleData = data.data.records[0];
          DATA.isSuccess = true;
          setTimeout(() => {
            METHODS.initVideo();
          }, 300);
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
      initVideo() {
        //初始化视频方法
        nextTick(() => {
          if (DATA.subModuleData) {
            DATA.myVideo = proxy.$video(`video`, {
              bigPlayButton: false,
              textTrackDisplay: false,
              posterImage: true,
              errorDisplay: false,
              controlBar: true,
            });
            // .play();
          }
          // let video: any = document.getElementById('video');
          // 8、play：播放监听
          // video.addEventListener('play', function (e: any) {
          //   console.log('提示该视频正在播放中');
          //   console.log(e);
          // });

          // 9、pause：暂停监听
          // video.addEventListener('pause', function (e: any) {
          //   console.log('暂停播放');
          //   console.log(e);
          // });
        });
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
      METHODS.handleGetPagingData();
    });
    onUnmounted(() => {
      if (DATA.myVideo) {
        DATA.myVideo.dispose(); // 该方法会重置videojs的内部状态并移除dom
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
    justify-content: center;
    align-items: center;
    text-align: center;
    & > div {
      margin-right: 5px;
      margin-top: 10px;
      margin-bottom: 10px;
    }
    .video-js {
      width: 600px;
      height: 350px;
    }
    .icon-bofang {
      font-size: 36px;
      position: absolute;
      top: 35%;
      left: 50%;
      transform: translateX(-50%);
    }
  }
  .container_noData {
    position: relative;
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
}
</style>
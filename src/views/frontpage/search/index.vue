<template>
  <div class="container">
    <!-- <sub-module /> -->
    <div
      class="container_body"
      v-if="moduleData.length>0"
    >
      <!-- 文档 -->
      <!-- <div class="container_body_doc">
        <el-card
          class="container_body_doc_item"
          v-for="item of moduleData"
          :key="item.id"
          @click="handleCard(item)"
        >
          <el-image
            v-if="item.multimedia.indexOf('.m3u8') == -1"
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

          <video
            v-if="item.multimedia && item.multimedia.indexOf('.m3u8') !== -1"
            :id="`video${item.id}`"
            class="video-js vjs-default-skin container_body_doc_item_left"
            controls
          >
            <source
              :src="`${IMG_File}${item.multimedia}`"
              type="application/x-mpegURL"
            >
          </video>

          <div class="container_body_doc_item_right">
            <h3 style="text-align:center;margin-bottom:10px">{{item.name}}</h3>
            <p
              class="plainText"
              v-html="item.plainText"
            ></p>
            <p style="text-align:right">{{proxy.$filterTime(item.createTime,"-")}}</p>
          </div>
        </el-card>
      </div> -->

      <!-- 纵向排版 -->
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

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        layout="total, prev, pager, next, jumper"
        :total="total"
        v-if="total!==0"
        class="pagination"
      >
      </el-pagination>
    </div>
    <no-data v-if="!moduleData.length>0 && isSuccess"></no-data>
  </div>
</template>
<script lang="ts">
import { useRoute, useRouter } from 'vue-router';
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  computed,
  onMounted,
  watch,
  onBeforeUnmount,
} from 'vue';
import NoData from '@/components/noData/index.vue';
import { useStore } from 'vuex';
import { getKeywordSearch } from '@/api/homePage/homePage';
import { IMG_File, RES_SUCCESS, sessionRead } from '@/api/common/common';
import ElePagination from '@/components/elePagination/index.vue';
import SubModule from '@/components/submodule/index.vue';
export default defineComponent({
  components: {
    ElePagination,
    SubModule,
    NoData,
  },
  setup() {
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    // 获取路由
    const ROUTE = useRoute();
    const ROUTER = useRouter();
    const STORE = useStore();
    let DATA: any = reactive({
      pagingObj: {
        limit: 10,
        page: 1,
        key: '',
      },
      moduleData: [],
      total: 0,
      isSubId: false,
      myVideo: [],
      isSuccess: false,
    });
    let METHODS: any = reactive({
      // 分页获取数据
      handlePagingData: async () => {
        STORE.commit('SET_SearchLoading', true);
        let { data } = await getKeywordSearch(DATA.pagingObj);
        if (data.code === RES_SUCCESS) {
          STORE.commit('SET_SearchLoading', false);
          data.data && (DATA.moduleData = data.data.records);
          data.data && (DATA.total = data.data.total);
          DATA.isSuccess = true;
          setTimeout(() => {
            METHODS.initVideo();
          }, 300);
        }
      },
      // 修改显示个数
      handleSizeChange: (val: number) => {
        DATA.pagingObj.limit = val;
        METHODS.handlePagingData();
      },
      // 修改显示页数
      handleCurrentChange: (val: number) => {
        DATA.pagingObj.page = val;
        METHODS.handlePagingData();
      },
      handleCard: (item: any) => {
        if (item.submoduleId !== null && item.type !== 7) {
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
        }
        sessionRead('FRONTSUB').forEach((val: any) => {
          if (val.id === item.submoduleId) {
            item.parentId = val.parentId;
          }
        });

        switch (item.type) {
          case 1:
            ROUTER.push({
              name: 'frontpageSingleImg',
              query: { id: item.submoduleId, parentId: item.parentId },
            });
            break;
          case 2:
            ROUTER.push({
              name: 'frontpageMoreImg',
              query: { id: item.submoduleId, parentId: item.parentId },
            });
            break;
          case 3:
            ROUTER.push({
              name: 'frontpageSingleVideo',
              query: { id: item.submoduleId, parentId: item.parentId },
            });
            break;
          case 4:
            ROUTER.push({
              name: 'frontpageMoreVideo',
              query: { id: item.submoduleId, parentId: item.parentId },
            });
            break;
          case 5:
            ROUTER.push({
              name: 'frontpageSingleDoc',
              query: { id: item.submoduleId, parentId: item.parentId },
            });
            break;
          case 6:
            // ROUTER.push({
            //   name: 'frontpageMoreDoc',
            //   query: { id: item.submoduleId, parentId: item.parentId },
            // });
            ROUTER.push({
              name: 'document',
              query: {
                id: item.id,
                subId: item.submoduleId,
                parentId: item.parentId,
              },
            });
            break;
          case 7:
            if (item.submoduleId === null) {
              ROUTER.push({
                name: 'document',
                query: { id: item.id, parentId: item.sceondaryId },
              });
            } else {
              ROUTER.push({
                name: 'frontpageTwoDoc',
                query: { id: item.submoduleId, parentId: item.parentId },
              });
            }
            break;
          case 8:
            let type = '';
            sessionRead('FRONTSUB').forEach((val: any) => {
              if (item.reference === val.id) {
                type = val.type;
              }
            });
            let itemObj = Object.assign({}, { ...item, type });
            METHODS.handleNavModule(itemObj);
            break;
          default:
            break;
        }
      },
      initVideo() {
        //初始化视频方法
        if (DATA.moduleData) {
          DATA.moduleData.forEach((item: any) => {
            if (item.multimedia && item.multimedia.indexOf('.m3u8') !== -1) {
              let myVideo = proxy.$video(`video${item.id}`, {
                bigPlayButton: false,
                textTrackDisplay: false,
                posterImage: true,
                errorDisplay: false,
                controlBar: true,
              });
              // .play();
              DATA.myVideo.push(myVideo);
            }
          });
        }
      },
    });
    let stop = watch(
      () => ROUTE.query.key,
      (newData, oldData) => {
        DATA.pagingObj.key = newData;
        METHODS.handlePagingData();
      }
    );
    onMounted(() => {
      DATA.pagingObj.key = ROUTE.query.key;
      METHODS.handlePagingData();
    });
    onBeforeUnmount(() => {
      stop();
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
      proxy,
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
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
    }
    .container_body_doc_item {
      margin: 0 10px 10px 10px;
      width: 30%;
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
      }
      .video-js {
        height: 100px;
      }
    }

    // 纵向排版
    .container_body_vertical {
      border-bottom: 2px dotted #ebebeb;
      cursor: pointer;
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
  .container_noData {
    /deep/ .el-image__inner {
      -webkit-user-drag: none;
      user-select: none;
    }
  }
  .pagination {
    text-align: right;
    margin: 10px 0 10px 0;
  }
}
</style>
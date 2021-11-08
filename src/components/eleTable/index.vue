<template>
  <el-table
    :data="tableData"
    :border="isborder"
    style="width: 100%;margin-top:10px"
    :row-key="getRowKey"
    :ref="refsName"
    fit
    @selection-change="handleSelectionChange"
  >
    <template
      v-for="(item,index) of renderTable"
      :key="index"
    >
      <!-- 多选 -->
      <el-table-column
        v-if="item.type === 'selection'"
        type="selection"
        :reserve-selection="true"
        width="55"
      >
      </el-table-column>
      <!-- 展开行 -->
      <el-table-column
        v-if="item.type === 'expand'"
        type="expand"
        width="50"
        #default="scoped"
        @click="handleClickColumn(scoped.row)"
      >
        <el-table
          :data="scoped.row[item.dataName]"
          :border="isborder"
          style="width: 100%;margin-top:10px"
        >
          <template
            v-for="(val,index) of randerExpandTable"
            :key="index"
          >
            <!-- 文本 -->
            <el-table-column
              :label="val.label"
              :show-overflow-tooltip="true"
              :prop="val.prop"
              :formatter="val.formatter"
              :sortable="val.sortable"
              align="center"
              v-if="val.type==='text'"
              :fixed="columnAlign"
            >
            </el-table-column>

            <!-- switch -->
            <el-table-column
              :label="val.label"
              :prop="val.prop"
              v-if="val.type==='switch'"
              #default="scoped"
              align="center"
              :fixed="columnAlign"
            >
              <el-switch
                v-model="scoped.row[val.prop]"
                :active-color="val.color || '#13ce66'"
                @change="handleEmitChange(scoped.row)"
              >
              </el-switch>
            </el-table-column>

            <!-- tag -->
            <el-table-column
              :label="val.label"
              :prop="val.prop"
              v-if="val.type==='tag'"
              align="center"
              #default="scoped"
              :fixed="columnAlign"
            >
              <el-tag :type="val.tagType">{{scoped.row[val.prop]}}</el-tag>
            </el-table-column>
          </template>
        </el-table>
      </el-table-column>

      <!-- 文本 -->
      <el-table-column
        :label="item.label"
        :show-overflow-tooltip="true"
        :prop="item.prop"
        :formatter="item.formatter"
        :sortable="item.sortable"
        align="center"
        v-if="item.type==='text'"
      >
      </el-table-column>

      <!-- 多字段文本 -->
      <el-table-column
        :label="item.label"
        :sortable="item.sortable"
        align="center"
        v-if="item.type==='multiText'"
        #default="scoped"
        style="display:flex"
        min-width="200"
      >
        <span>{{item.formatter(scoped.row)}}</span>
      </el-table-column>

      <!-- switch -->
      <el-table-column
        :label="item.label"
        :prop="item.prop"
        v-if="item.type==='switch'"
        #default="scoped"
        align="center"
      >
        <el-switch
          v-model="scoped.row[item.prop]"
          :active-color="item.color || '#13ce66'"
          @change="handleEmitChange(scoped.row,item)"
        >
        </el-switch>
      </el-table-column>

      <!-- tag -->
      <el-table-column
        :label="item.label"
        :prop="item.prop"
        v-if="item.type==='tag'"
        align="center"
        #default="scoped"
        width="120"
      >
        <el-tag :type="item.formatter(scoped.row).tagType">{{item.formatter(scoped.row).text}}</el-tag>
      </el-table-column>

      <!-- 图片 -->
      <el-table-column
        :label="item.label"
        :prop="item.prop"
        v-if="item.type ==='image'"
        align="center"
      >
        <template #default="scope">
          <div v-if="scope.row[item.prop]">
            <img
              style="width: 110px"
              :src="IMG_File+scope.row[item.prop]"
            />
          </div>
          <el-tag
            v-else
            type="info"
          >无</el-tag>
        </template>
      </el-table-column>

      <!-- 视频 -->
      <el-table-column
        :label="item.label"
        :prop="item.prop"
        v-if="item.type ==='video'"
        align="center"
      >
        <template #default="scope">
          <div
            v-if="scope.row[item.prop]"
            :id="`viode${scope.row.id}_item`"
          >
            <video
              :id="`video${scope.row.id}`"
              class="video-js vjs-default-skin"
              controls
            >
              <source
                :src="IMG_File+scope.row[item.prop]"
                type="application/x-mpegURL"
              >
            </video>
          </div>
          <el-tag
            v-else
            type="info"
          >无</el-tag>
        </template>
      </el-table-column>

      <!-- button -->
      <el-table-column
        :label="item.label"
        :prop="item.prop"
        :width="item.width"
        v-if="item.type==='handle'"
        align="center"
        #default="scoped"
      >
        <div class="d_flex d_flex_c">
          <el-button
            v-for="(val,i) of btnArr"
            :key="i"
            :type="val.type"
            :disabled="val.value ? scoped.row[val.prop] == val.value : false"
            @click="handleBtnEvent(scoped.row,val)"
          >{{val.text}}</el-button>
        </div>
      </el-table-column>
    </template>
  </el-table>
</template>
<script lang="ts">
import { useStore } from 'vuex';
import {
  defineComponent,
  getCurrentInstance,
  inject,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  toRefs,
  watch,
} from 'vue';
import { IMG_File } from '@/api/common/common';
export default defineComponent({
  props: {
    tableData: {
      type: Array,
      default: [],
    },
    isborder: {
      type: Boolean,
      default: false,
    },
    renderTable: {
      type: Array,
      default: [],
    },
    btnArr: {
      type: Array,
      default: [],
    },
    randerExpandTable: {
      type: Array,
      default: [],
    },
    refsName: {
      type: String,
      default: '',
    },
  },
  setup(props, { emit }) {
    // 获取vue实例化对象
    let { proxy }: any = getCurrentInstance();
    let STORE = useStore();
    let DATA: any = reactive({
      columnAlign: 'right',
      myVideo: [],
      isInitVideo: false,
    });
    let METHODES: any = reactive({
      handleSelectionChange: (val: any): void => {
        emit('handleSelectionChange', val);
      },
      handleBtnEvent: (row: any, val: any): void => {
        emit('handleBtnEvent', { row, val });
      },
      handleEmitChange: (val: any, item: any): void => {
        emit('handleEmitChange', val, item);
      },
      handleClickColumn: (row: any) => {
        emit('handleClickColumn', row);
      },
      getRowKey: (row: any) => {
        return row.id + '';
      },
      clearSelection: () => {
        proxy.$refs[props.refsName].clearSelection();
      },
      initVideo() {
        //初始化视频方法
        nextTick(() => {
          if (props.tableData) {
            DATA.myVideo = [];
            props.tableData.forEach((item: any) => {
              if (item.multimedia) {
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
        });
      },
    });
    watch(
      () => props.tableData,
      () => {
        if (DATA.isInitVideo) {
          setTimeout(() => {
            METHODES.initVideo();
          }, 300);
        }
      }
    );
    onMounted(() => {
      props.renderTable.forEach((item: any) => {
        if (item.type === 'video') {
          DATA.isInitVideo = true;
        }
      });
      if (DATA.isInitVideo) {
        setTimeout(() => {
          METHODES.initVideo();
        }, 300);
      }
    });
    onUnmounted(() => {
      if (DATA.isInitVideo) {
        DATA.myVideo.forEach((item: any) => {
          item.dispose(); // 该方法会重置videojs的内部状态并移除dom
        });
      }
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODES),
      IMG_File,
    };
  },
});
</script>
<style lang="scss" scoped>
.video-js {
  width: 200px;
  height: 100px;
}
</style>
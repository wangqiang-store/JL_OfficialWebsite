<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item>{{formatName(ROUTE.query.parentId,sessionRead("PARENMODULE"))}}</el-breadcrumb-item>
      <el-breadcrumb-item>{{formatName(ROUTE.query.id,sessionRead("SUBMODULE"))}}</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card
      class="box-card"
      v-loading="loading"
    >
      <template #header>
        <div class="card-header d_flex d_flex_sb">
          <span>单视频管理</span>
          <el-button
            class="button"
            type="text"
            @click="handleSave"
          >保存</el-button>
        </div>
      </template>
      <ele-form
        :formData="formData"
        :renderFormArr="renderFormArr"
        :rules="formRoules"
        ref="formRef"
      >
        <template #video>
          <EleUpload
            @uploadVideoSuccess="uploadVideoSuccess"
            :videoList="videoList"
            :isUploadImage="false"
            @deleteSolid="deleteSolid"
            ref="uploadRef"
          />
        </template>
      </ele-form>
    </el-card>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  onMounted,
  onBeforeMount,
} from 'vue';
import EleForm from '@/components/eleForm/index.vue';
import EleUpload from '@/components/eleUpload/index.vue';
import { useRoute } from 'vue-router';
import {
  createMedia,
  getAllMedia,
  getMediaByTypePage,
  updateMedia,
} from '@/api/displaydata/media';
import {
  IMG_File,
  RES_SUCCESS,
  sessionRead,
  sessionWrite,
} from '@/api/common/common';
import { ElMessage } from 'element-plus/lib';
import { getGlobalModule } from '@/api/displaydata/parenModule';
export default defineComponent({
  components: {
    EleForm,
    EleUpload,
  },
  setup() {
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    // 获取路由实例
    const ROUTE = useRoute();
    let DATA: any = reactive({
      pagingObj: {
        limit: 10,
        page: 1,
        subModuleId: '',
        type: '',
      },
      formData: {
        name: '',
        multimedia: '',
        submoduleId: ROUTE.query.id,
        type: ROUTE.query.type,
        isEnable: true,
        sort: 0,
      },
      renderFormArr: [
        {
          label: '标题',
          type: 'input',
          prop: 'name',
        },
        {
          label: '视频',
          type: 'slot',
          slotName: 'video',
        },
      ],
      formRoules: {
        name: [
          { required: true, message: '视频名称不能为空', trigger: 'blur' },
        ],
      },
      isCreate: false,
      loading: false,
      videoList: [],
      idList: [],
    });
    let METHODS: any = reactive({
      // 分页获取表格数据
      handlePagingData: async () => {
        DATA.loading = true;
        let { data } = await getMediaByTypePage(DATA.pagingObj);
        if (data.code === RES_SUCCESS) {
          DATA.loading = false;
          if (data.data.records.length === 0) {
            DATA.formData = Object.assign(
              {},
              {
                name: '',
                multimedia: '',
                submoduleId: ROUTE.query.id,
                type: ROUTE.query.type,
                isEnable: true,
                sort: 0,
              }
            );
            DATA.isCreate = true;
          } else {
            DATA.formData = data.data.records[0];
            DATA.isCreate = false;
            DATA.videoList = [];
            data.data.records[0].multimedia &&
              DATA.videoList.push({
                path: IMG_File + data.data.records[0].multimedia,
              });
          }
        }
      },
      handleGetAllMedia: async () => {
        let { data } = await getAllMedia();
        if (data.code === RES_SUCCESS) {
          sessionWrite('MEDIAMODULE', data.data);
        }
      },
      // 上传视频成功
      uploadVideoSuccess: (res: any) => {
        DATA.videoList = [];
        DATA.formData.multimedia = res.data;
        DATA.videoList.push({
          path: IMG_File + res.data,
        });
      },
      // 添加编辑保存
      handleSave: () => {
        if (!DATA.formData.multimedia) {
          ElMessage({
            type: 'warning',
            message: '请上传视频',
          });
          return;
        }
        if (DATA.isCreate) {
          proxy.$refs['formRef'].submitForm().then((res: boolean) => {
            if (res) {
              createMedia(DATA.formData).then(({ data }) => {
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: '视频保存成功',
                    type: 'success',
                  });
                  METHODS.handlePagingData();
                  METHODS.handleGetAllMedia();
                }
              });
            }
          });
        } else {
          delete DATA.formData.createTime;
          delete DATA.formData.updateTime;
          delete DATA.formData.children;
          proxy.$refs['formRef'].submitForm().then((res: boolean) => {
            if (res) {
              updateMedia(DATA.formData).then(({ data }) => {
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: '视频编辑成功',
                    type: 'success',
                  });
                  METHODS.handlePagingData();
                  METHODS.handleGetAllMedia();
                }
              });
            }
          });
        }
      },
      // 删除视频
      deleteSolid: (index: number) => {
        DATA.videoList.splice(index, 1);
        DATA.formData.multimedia = '';
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
    onMounted(() => {
      DATA.pagingObj.subModuleId = ROUTE.query.id;
      DATA.pagingObj.type = ROUTE.query.type;
      METHODS.handlePagingData();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      ROUTE,
      sessionRead,
    };
  },
});
</script>
<style lang="scss" scoped>
.el-breadcrumb {
  margin-bottom: 10px;
}
</style>
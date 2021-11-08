<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item>{{formatName(ROUTE.query.parentId,sessionRead("PARENMODULE"))}}</el-breadcrumb-item>
      <el-breadcrumb-item>{{formatName(ROUTE.query.id,sessionRead("SUBMODULE"))}}</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <template #header>
        <div class="card-header d_flex d_flex_sb">
          <span>单图片管理</span>
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
        :rules="formRules"
        ref="formRef"
      >
        <template #image>
          <EleUpload
            @uploadSuccess="uploadSuccess"
            :imageList="imageList"
            ref="uploadRef"
            @uploadRemove="uploadRemove"
          />
        </template>
      </ele-form>
    </el-card>
  </div>
</template>
<script lang="ts">
import { useRoute } from 'vue-router';
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  onMounted,
} from 'vue';
import {
  IMG_File,
  RES_SUCCESS,
  sessionRead,
  sessionWrite,
} from '@/api/common/common';
import {
  createMedia,
  getAllMedia,
  getMediaByTypePage,
  updateMedia,
} from '@/api/displaydata/media';
import EleUpload from '@/components/eleUpload/index.vue';
import EleForm from '@/components/eleForm/index.vue';
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
          label: '图片',
          type: 'slot',
          slotName: 'image',
        },
      ],
      imageList: [],
      formRules: {
        name: [{ required: true, message: '请输入标题名称', trigger: 'blur' }],
      },
      isCreate: false,
      idList: [],
    });
    let METHODS: any = reactive({
      // 分页获取数据
      handlePagingData: async () => {
        let { data } = await getMediaByTypePage(DATA.pagingObj);
        if (data.code === RES_SUCCESS) {
          if (data.data.records.length === 0) {
            DATA.isCreate = true;
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
            DATA.imageList = [];
          } else {
            DATA.isCreate = false;
            DATA.imageList = [];
            DATA.imageList.push({
              url: IMG_File + data.data.records[0].multimedia,
            });
            DATA.formData = data.data.records[0];
          }
        }
      },
      handleGetAllMedia: async () => {
        let { data } = await getAllMedia();
        if (data.code === RES_SUCCESS) {
          sessionWrite('MEDIAMODULE', data.data);
        }
      },
      // 图片上传成功
      uploadSuccess: (res: any) => {
        DATA.formData.multimedia = res.data;
      },
      // 编辑、新增保存单图片
      handleSave: () => {
        if (!DATA.formData.multimedia) {
          ElMessage({
            type: 'warning',
            message: '请上传图片',
          });
          return;
        }
        if (DATA.isCreate) {
          proxy.$refs['formRef'].submitForm().then((res: boolean) => {
            if (res) {
              createMedia(DATA.formData).then(({ data }) => {
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: '添加成功',
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
                    message: '编辑成功',
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
      // 移除图片
      uploadRemove: () => {
        DATA.formData.multimedia = null;
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
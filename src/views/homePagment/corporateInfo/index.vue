<template>
  <div class="companyInfo_container">
    <el-card
      class="box-card"
      v-loading="loading"
    >
      <template #header>
        <div class="card-header">
          <span>公司基本信息</span>
          <el-button
            class="button"
            type="text"
            @click="handleEditCompanyInfo"
          >编辑</el-button>
        </div>
      </template>
      <ele-form
        :formData="formData"
        :renderFormArr="renderFormArr"
      >
        <template #image>
          <el-image
            style="width: 100px; height: 100px"
            :src="url"
            fit="cover"
          >
            <template #error>
              <div class="image-slot">
                <i class="el-icon-picture-outline"></i>
              </div>
            </template>
          </el-image>
        </template>
      </ele-form>
    </el-card>
    <!-- 编辑模态框 -->
    <el-dialog
      title="编辑"
      v-model="dialogEditFormVisible"
    >
      <ele-form
        :renderFormArr="renderEditFormArr"
        :formData="formEditData"
        :labelWidth="120"
        :refForm="'addForm'"
        ref="addForm"
      >
        <template #image>
          <EleUpload
            @uploadSuccess="uploadSuccess"
            :imageList="imageList"
            @uploadRemove="uploadRemove"
            ref="uploadRef"
          />
        </template>
      </ele-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogEditFormVisible = false">取 消</el-button>
          <el-button
            type="primary"
            @click="handleEditConfirmUser"
          >确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { defineComponent, nextTick, onMounted, reactive, toRefs } from 'vue';
import {
  getCompanyInfo,
  updateCompanyInfo,
} from '@/api/homePagment/corporateInfo';
import EleForm from '@/components/eleForm/index.vue';
import EleUpload from '@/components/eleUpload/index.vue';
import { IMG_File, RES_SUCCESS } from '@/api/common/common';
import { ElMessage } from 'element-plus/lib';
export default defineComponent({
  components: {
    EleForm,
    EleUpload,
  },
  setup() {
    let DATA: any = reactive({
      formData: {},
      renderFormArr: [
        {
          label: '公司名称',
          type: 'tag',
          prop: 'name',
          filter: (val: string) => {
            return val ? val : '请填写';
          },
        },
        {
          label: '地址',
          type: 'tag',
          prop: 'address',
          filter: (val: string) => {
            return val ? val : '请填写';
          },
        },
        {
          label: '邮箱',
          type: 'tag',
          prop: 'email',
          filter: (val: string) => {
            return val ? val : '请填写';
          },
        },
        {
          label: '电话',
          type: 'tag',
          prop: 'phone',
          filter: (val: string) => {
            return val ? val : '请填写';
          },
        },
        {
          label: '传真',
          type: 'tag',
          prop: 'fax',
          filter: (val: string) => {
            return val ? val : '请填写';
          },
        },
        {
          label: '官方微信',
          type: 'slot',
          slotName: 'image',
        },
        {
          label: '咨询热线',
          type: 'tag',
          prop: 'hotLine',
          filter: (val: string) => {
            return val ? val : '请填写';
          },
        },
        {
          label: '在线咨询',
          type: 'tag',
          prop: 'consultation',
          filter: (val: string) => {
            return val ? val : '请填写';
          },
        },
        {
          label: '公网安备',
          type: 'tag',
          prop: 'security',
          filter: (val: string) => {
            return val ? val : '请填写';
          },
        },
        {
          label: 'ICP备案',
          type: 'tag',
          prop: 'icp',
          filter: (val: string) => {
            return val ? val : '请填写';
          },
        },
      ],
      // 编辑
      dialogEditFormVisible: false,
      renderEditFormArr: [
        {
          label: '公司名称',
          type: 'input',
          prop: 'name',
        },
        {
          label: '地址',
          type: 'input',
          prop: 'address',
        },
        {
          label: '邮箱',
          type: 'input',
          prop: 'email',
        },
        {
          label: '电话',
          type: 'input',
          prop: 'phone',
        },
        {
          label: '传真',
          type: 'input',
          prop: 'fax',
        },
        {
          label: '官方微信',
          type: 'slot',
          slotName: 'image',
        },
        {
          label: '咨询热线',
          type: 'input',
          prop: 'hotLine',
        },
        {
          label: '在线咨询',
          type: 'input',
          prop: 'consultation',
        },
        {
          label: '公网安备',
          type: 'input',
          prop: 'security',
        },
        {
          label: 'ICP备案',
          type: 'input',
          prop: 'icp',
        },
      ],
      formEditData: {},
      loading: false,
      url: '',
      imageList: [],
    });
    let METHODS: any = reactive({
      // 获取公司信息
      handleGetCompanyInfo: async () => {
        DATA.loading = true;
        let { data } = await getCompanyInfo();
        if (data.code === RES_SUCCESS) {
          DATA.loading = false;
          DATA.formData = data.data;
          if (data.data.weChat) {
            DATA.url = IMG_File + data.data.weChat;
          } else {
            DATA.url = '';
          }
        }
      },
      // 保存公司信息
      handleEditConfirmUser: async () => {
        delete DATA.formEditData.createTime;
        delete DATA.formEditData.updateTime;
        let { data } = await updateCompanyInfo(DATA.formEditData);
        if (data.code === RES_SUCCESS) {
          ElMessage({
            message: '编辑成功',
            type: 'success',
          });
          DATA.dialogEditFormVisible = false;
          METHODS.handleGetCompanyInfo();
        }
      },
      // 点击编辑
      handleEditCompanyInfo: () => {
        DATA.dialogEditFormVisible = true;
        DATA.formEditData = Object.assign({}, DATA.formData);
        DATA.imageList = [];
        DATA.formEditData.weChat &&
          DATA.imageList.push({ url: IMG_File + DATA.formEditData.weChat });
      },
      // 图片上传成功
      uploadSuccess: (res: any) => {
        DATA.formEditData.weChat = res.data;
      },
      //移除图片
      uploadRemove: (file: any) => {
        DATA.formEditData.weChat = null;
      },
    });
    onMounted(() => {
      METHODS.handleGetCompanyInfo();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>
<style lang="scss" scoped>
.companyInfo_container {
  margin-top: 10px;
  .box-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .el-image {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #eee;
    }
  }
}
</style>
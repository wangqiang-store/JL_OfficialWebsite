<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item>{{formatName(ROUTE.query.parentId,sessionRead("PARENMODULE"))}}</el-breadcrumb-item>
      <el-breadcrumb-item>{{formatName(ROUTE.query.id,sessionRead("SUBMODULE"))}}</el-breadcrumb-item>
    </el-breadcrumb>
    <div>
      <el-button
        type="primary"
        @click="handleCreate"
      >添加图片</el-button>
    </div>
    <div>
      <ele-table
        :tableData="tableData"
        :renderTable="renderTable"
        :btnArr="btbArr"
        v-loading="loading"
        @handleBtnEvent="handleBtnEvent"
        @handleEmitChange="handleEmitChange"
      ></ele-table>
      <ele-pagination
        :total="total"
        @handleSizeChange="handleSizeChange"
        @handleCurrentChange="handleCurrentChange"
      ></ele-pagination>
    </div>
    <!-- 添加、编辑案例模态框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogFormVisible"
    >
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
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button
            type="primary"
            @click="handleConfirm"
          >确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  onMounted,
  nextTick,
} from 'vue';
import EleForm from '@/components/eleForm/index.vue';
import EleUpload from '@/components/eleUpload/index.vue';
import EleTable from '@/components/eleTable/index.vue';
import ElePagination from '@/components/elePagination/index.vue';
import { useRoute } from 'vue-router';
import {
  createMedia,
  deleteMedia,
  enableMedia,
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
    EleTable,
    ElePagination,
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
      tableData: [],
      renderTable: [
        {
          label: '序号',
          type: 'text',
          formatter: (row: any, columna: any, cellValue: any, index: any) => {
            return index + 1;
          },
        },
        {
          label: '标题',
          type: 'text',
          prop: 'name',
        },
        {
          label: '图片',
          type: 'image',
          prop: 'multimedia',
        },
        {
          label: '权重',
          type: 'tag',
          prop: 'sort',
          formatter: (row: any) => {
            let obj = {
              text: row.sort,
              tagType: 'success',
            };
            return obj;
          },
        },
        {
          label: '更新时间',
          type: 'text',
          prop: 'updateTime',
          formatter: (row: any) => {
            return proxy.$filterTime(row.updateTime);
          },
        },
        {
          label: '创建时间',
          type: 'text',
          prop: 'createTime',
          formatter: (row: any) => {
            return proxy.$filterTime(row.createTime);
          },
        },
        {
          label: '是否启用',
          type: 'switch',
          prop: 'isEnable',
        },
        {
          label: '操作',
          type: 'handle',
          width: 300,
        },
      ],
      btbArr: [
        {
          text: '编辑',
          handleType: 'edit',
          type: 'primary',
        },
        {
          text: '删除',
          handleType: 'delete',
          type: 'danger',
        },
      ],
      loading: false,
      total: 0,
      // 表单数据
      dialogTitle: '',
      dialogFormVisible: false,
      formData: {
        name: '',
        multimedia: '',
        sort: 0,
        type: ROUTE.query.type,
        submoduleId: ROUTE.query.id,
        isEnable: true,
      },
      renderFormArr: [
        {
          label: '标题',
          prop: 'name',
          type: 'input',
        },
        {
          label: '图片',
          type: 'slot',
          slotName: 'image',
        },
        {
          label: '权重',
          prop: 'sort',
          type: 'input',
        },
      ],
      formRules: {
        name: [
          { required: true, message: '标题名称不能为空', trigger: 'blur' },
        ],
      },
      imageList: [],
      isCreate: false,
      idList: [],
    });
    let METHODS: any = reactive({
      // 分页获取表格数据
      handlePagingData: async () => {
        DATA.loading = true;
        let { data } = await getMediaByTypePage(DATA.pagingObj);
        if (data.code === RES_SUCCESS) {
          DATA.loading = false;
          DATA.tableData = data.data.records;
          DATA.total = data.data.total;
        }
      },
      handleGetAllMedia: async () => {
        let { data } = await getAllMedia();
        if (data.code === RES_SUCCESS) {
          sessionWrite('MEDIAMODULE', data.data);
        }
      },
      // 修改表格显示个数
      handleSizeChange: (val: number) => {
        DATA.pagingObj.limit = val;
        METHODS.handlePagingData();
      },
      // 修改表格页数
      handleCurrentChange: (val: number) => {
        DATA.pagingObj.page = val;
        METHODS.handlePagingData();
      },
      // 图片上传成功
      uploadSuccess: (res: any) => {
        DATA.formData.multimedia = res.data;
      },
      // 点击添加
      handleCreate: () => {
        DATA.dialogTitle = '添加图片';
        DATA.dialogFormVisible = true;
        DATA.isCreate = true;
        DATA.imageList = [];
        DATA.formData = Object.assign(
          {},
          {
            name: '',
            multimedia: '',
            sort: 0,
            type: Number(ROUTE.query.type),
            submoduleId: Number(ROUTE.query.id),
            isEnable: true,
          }
        );
        nextTick(() => {
          proxy.$refs['formRef'].clearForm();
        });
      },
      // 确认添加编辑提交
      handleConfirm: () => {
        if (!DATA.formData.multimedia) {
          ElMessage({
            type: 'warning',
            message: '请上传图片',
            customClass: 'message-override',
          });
          return;
        }
        if (DATA.isCreate) {
          proxy.$refs['formRef'].submitForm().then((res: boolean) => {
            if (res) {
              createMedia(DATA.formData).then(({ data }) => {
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: '图片添加成功',
                    type: 'success',
                  });
                  DATA.dialogFormVisible = false;
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
                    message: '图片编辑成功',
                    type: 'success',
                  });
                  DATA.dialogFormVisible = false;
                  METHODS.handlePagingData();
                  METHODS.handleGetAllMedia();
                }
              });
            }
          });
        }
      },
      // 操作按钮
      handleBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case 'edit':
            DATA.dialogTitle = '编辑图片';
            DATA.dialogFormVisible = true;
            DATA.isCreate = false;
            DATA.imageList = [];
            row.multimedia &&
              DATA.imageList.push({ url: IMG_File + row.multimedia });
            DATA.formData = Object.assign({}, row);
            nextTick(() => {
              proxy.$refs['formRef'].clearForm();
            });
            break;
          case 'delete':
            proxy
              .$confirm('是否确定删除该图片', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              })
              .then(() => {
                deleteMedia({ id: row.id }).then(({ data }) => {
                  if (data.code === RES_SUCCESS) {
                    proxy.$message({
                      type: 'success',
                      message: '删除成功!',
                    });
                    METHODS.handlePagingData();
                    METHODS.handleGetAllMedia();
                  }
                });
              })
              .catch(() => {});
            break;
          default:
            break;
        }
      },
      // switch
      handleEmitChange: async (val: any, item: any) => {
        let { data } = await enableMedia({ id: val.id });
        if (data.code === RES_SUCCESS) {
          if (val.isEnable) {
            ElMessage({
              message: '图片启用成功',
              type: 'success',
            });
          } else {
            ElMessage({
              message: '图片不启用成功',
              type: 'success',
            });
          }
          METHODS.handleGetAllMedia();
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
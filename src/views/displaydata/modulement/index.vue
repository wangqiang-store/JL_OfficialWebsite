<template>
  <div class="modulement_container">
    <div class="modulement_container_head">
      <el-button
        type="primary"
        @click="handleCreate"
      >添加模块</el-button>
    </div>
    <div class="modulement_container_body">
      <ele-table
        :tableData="tableData"
        :renderTable="renderTable"
        :isborder="true"
        :btnArr="btnArr"
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
  getCurrentInstance,
  nextTick,
  onMounted,
  reactive,
  toRefs,
} from 'vue';
import EleTable from '@/components/eleTable/index.vue';
import EleForm from '@/components/eleForm/index.vue';
import ElePagination from '@/components/elePagination/index.vue';
import EleUpload from '@/components/eleUpload/index.vue';
import {
  createParenModule,
  deleteParenModule,
  enableParenModule,
  getAllParenModule,
  getGlobalModule,
  pagingParenModule,
  updateParenModule,
} from '@/api/displaydata/parenModule';
import {
  IMG_File,
  RES_SUCCESS,
  sessionRead,
  sessionWrite,
} from '@/api/common/common';
import { ElMessage } from 'element-plus/lib';
import { getAllMedia } from '@/api/displaydata/media';
import { getAllSubModule } from '@/api/displaydata/subModule';
export default defineComponent({
  components: {
    EleTable,
    EleForm,
    ElePagination,
    EleUpload,
  },
  setup() {
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    let DATA: any = reactive({
      pagingObj: {
        limit: 10,
        page: 1,
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
          label: '模块名称',
          type: 'text',
          prop: 'name',
        },
        {
          label: '模块图片',
          type: 'image',
          prop: 'image',
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
          width: 400,
        },
      ],
      btnArr: [
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
      isCreate: false,
      dialogTitle: '',
      dialogFormVisible: false,
      formData: {
        name: '',
        image: '',
        sort: 0,
        isEnable: true,
        updateTime: '',
        createTime: '',
      },
      renderFormArr: [
        {
          label: '模块名称',
          type: 'input',
          prop: 'name',
        },
        {
          label: '模块图片',
          type: 'slot',
          slotName: 'image',
        },
        {
          label: '权重',
          type: 'input',
          prop: 'sort',
        },
      ],
      formRules: {
        name: [
          { required: true, message: '模块名称不能为空', trigger: 'blur' },
        ],
      },
      imageList: [],
      idList: [],
    });
    let METHODS: any = reactive({
      // 分页获取父模块
      handlePagingModule: async () => {
        DATA.loading = true;
        let { data } = await pagingParenModule(DATA.pagingObj);
        if (data.code === RES_SUCCESS) {
          DATA.loading = false;
          DATA.tableData = data.data.records;
          DATA.total = data.data.total;
        }
      },
      // 获取所有父模块
      handleGetAllParenModule: async () => {
        let { data } = await getAllParenModule();
        if (data.code === RES_SUCCESS) {
          sessionWrite('PARENMODULE', data.data);
        }
      },
      handleGetAllMedia: async () => {
        let { data } = await getAllMedia();
        if (data.code === RES_SUCCESS) {
          sessionWrite('MEDIAMODULE', data.data);
        }
      },
      // 获取所有子模块
      handleGetAllSubModule: async () => {
        let { data } = await getAllSubModule();
        if (data.code === RES_SUCCESS) {
          sessionWrite('SUBMODULE', data.data);
        }
      },
      // 修改表格显示个数
      handleSizeChange: (val: number) => {
        DATA.pagingObj.limit = val;
        METHODS.handlePagingModule();
      },
      // 修改表格页数
      handleCurrentChange: (val: number) => {
        DATA.pagingObj.page = val;
        METHODS.handlePagingModule();
      },
      // 图片上传成功
      uploadSuccess: (res: any) => {
        DATA.formData.image = res.data;
      },
      // 点击添加
      handleCreate: () => {
        DATA.dialogTitle = '添加模块';
        DATA.dialogFormVisible = true;
        DATA.isCreate = true;
        DATA.formData = Object.assign(
          {},
          {
            name: '',
            image: '',
            sort: 0,
            isEnable: true,
          }
        );
        DATA.imageList = [];
        nextTick(() => {
          proxy.$refs['formRef'].clearForm();
        });
      },
      // 确认编辑、添加
      handleConfirm: () => {
        delete DATA.formData.createTime;
        delete DATA.formData.updateTime;
        if (DATA.isCreate) {
          proxy.$refs['formRef'].submitForm().then((res: boolean) => {
            if (res) {
              createParenModule(DATA.formData).then(({ data }) => {
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: '添加模块成功',
                    type: 'success',
                  });
                  METHODS.handlePagingModule();
                  METHODS.handleGetAllParenModule();
                  DATA.dialogFormVisible = false;
                }
              });
            }
          });
        } else {
          delete DATA.formData.children;
          proxy.$refs['formRef'].submitForm().then((res: boolean) => {
            if (res) {
              updateParenModule(DATA.formData).then(({ data }) => {
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: '编辑模块成功',
                    type: 'success',
                  });
                  METHODS.handlePagingModule();
                  METHODS.handleGetAllParenModule();
                  DATA.dialogFormVisible = false;
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
            DATA.dialogTitle = '编辑模块';
            DATA.dialogFormVisible = true;
            DATA.isCreate = false;
            DATA.formData = Object.assign({}, row);
            DATA.imageList = [];
            row.image && DATA.imageList.push({ url: IMG_File + row.image });
            nextTick(() => {
              proxy.$refs['formRef'].clearForm();
            });
            break;
          case 'delete':
            proxy
              .$confirm(
                '删除该父模块会将关联此模块下的子模块及此子模块下其他模块数据一并删除, 是否确认删除',
                '提示',
                {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning',
                  customClass: 'configBox',
                }
              )
              .then(() => {
                deleteParenModule({ id: row.id }).then(({ data }) => {
                  if (data.code === RES_SUCCESS) {
                    proxy.$message({
                      type: 'success',
                      message: '删除成功!',
                    });
                    METHODS.handlePagingModule();
                    METHODS.handleGetAllParenModule();
                    METHODS.handleGetAllMedia();
                    METHODS.handleGetAllSubModule();
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
      handleEmitChange: async (val: any, time: any) => {
        let { data } = await enableParenModule({ id: val.id });
        if (data.code === RES_SUCCESS) {
          if (val.isEnable) {
            ElMessage({
              message: '模块启用成功',
              type: 'success',
            });
          } else {
            ElMessage({
              message: '模块不启用成功',
              type: 'success',
            });
          }
        }
      },
      // 移除图片
      uploadRemove: () => {
        DATA.formData.image = null;
      },
    });
    onMounted(() => {
      METHODS.handlePagingModule();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>
<style lang="scss" scoped>
</style>
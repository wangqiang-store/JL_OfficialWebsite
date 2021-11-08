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
      >添加分类</el-button>
    </div>
    <div>
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
import { useRoute, useRouter } from 'vue-router';
import {
  createMedia,
  deleteMedia,
  enableMedia,
  getAllMedia,
  getMediaByTypePage,
  updateMedia,
} from '@/api/displaydata/media';
import { RES_SUCCESS, sessionRead, sessionWrite } from '@/api/common/common';
import { ElMessage } from 'element-plus/lib';
import { getGlobalModule } from '@/api/displaydata/parenModule';
export default defineComponent({
  components: {
    EleTable,
    EleForm,
    ElePagination,
  },
  setup() {
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    // 获取路由实例
    const ROUTE = useRoute();
    const ROUTER = useRouter();
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
          label: '分类名称',
          type: 'text',
          prop: 'name',
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
      btnArr: [
        {
          text: '编辑',
          handleType: 'edit',
          type: 'primary',
        },
        {
          text: '管理',
          handleType: 'admin',
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
      // 表单
      dialogTitle: '',
      dialogFormVisible: false,
      formData: {
        submoduleId: ROUTE.query.id,
        isEnable: true,
        type: ROUTE.query.type,
        sort: 0,
        name: '',
      },
      renderFormArr: [
        {
          label: '分类名称',
          type: 'input',
          prop: 'name',
        },
        {
          label: '权重',
          type: 'input',
          prop: 'sort',
        },
      ],
      formRules: {
        name: [
          { required: true, message: '标题名称不能为空', trigger: 'blur' },
        ],
      },
      isCreate: false,
      idList: [],
    });
    let METHODS: any = reactive({
      // 分页获取数据
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
      // 点击添加
      handleCreate: () => {
        DATA.dialogTitle = '添加分类';
        DATA.dialogFormVisible = true;
        DATA.isCreate = true;
        DATA.formData = Object.assign(
          {},
          {
            submoduleId: Number(ROUTE.query.id),
            isEnable: true,
            type: Number(ROUTE.query.type),
            sort: 0,
            name: '',
          }
        );
        nextTick(() => {
          proxy.$refs['formRef'].clearForm();
        });
      },
      // 操作按钮
      handleBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case 'edit':
            DATA.dialogTitle = '编辑分类';
            DATA.dialogFormVisible = true;
            DATA.isCreate = false;
            DATA.formData = Object.assign({}, row);
            nextTick(() => {
              proxy.$refs['formRef'].clearForm();
            });
            break;
          case 'delete':
            proxy
              .$confirm(
                '删除该分类会将此分类下关联数据一并删除,是否确定删除',
                '提示',
                {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning',
                  customClass: 'configBox',
                }
              )
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
          case 'admin':
            ROUTER.push({
              name: 'twoDocument',
              query: { id: row.id, type: row.type, name: row.name },
            });
            break;
          default:
            break;
        }
      },
      // seitch
      handleEmitChange: async (val: any) => {
        let { data } = await enableMedia({ id: val.id });
        if (data.code === RES_SUCCESS) {
          if (val.isEnable) {
            ElMessage({
              message: '分类启用成功',
              type: 'success',
            });
          } else {
            ElMessage({
              message: '分类不启用成功',
              type: 'success',
            });
          }
          METHODS.handleGetAllMedia();
        }
      },
      // 确认编辑、添加
      handleConfirm: () => {
        if (DATA.isCreate) {
          proxy.$refs['formRef'].submitForm().then((res: boolean) => {
            if (res) {
              createMedia(DATA.formData).then(({ data }) => {
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: '添加分类成功',
                    type: 'success',
                  });
                  METHODS.handlePagingData();
                  METHODS.handleGetAllMedia();
                  DATA.dialogFormVisible = false;
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
                    message: '编辑分类成功',
                    type: 'success',
                  });
                  METHODS.handlePagingData();
                  METHODS.handleGetAllMedia();
                  DATA.dialogFormVisible = false;
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
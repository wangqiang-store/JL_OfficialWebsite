<template>
  <div class="CaseShow_container">
    <div class="CaseShow_container_head">
      <el-button
        type="primary"
        @click="handleCreate"
      >添加案例展示</el-button>
    </div>
    <div class="CaseShow_container_body">
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
        :options="options"
        @handleChange="handleChange"
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
import {
  createCaseShow,
  deleteCaseShow,
  enableCaseShow,
  pagingCaseShow,
  updateCaseShow,
} from '@/api/homePagment/casepresentation';
import { querySubModuleList } from '@/api/displaydata/subModule';
import { IMG_File, RES_SUCCESS, sessionRead } from '@/api/common/common';
import EleUpload from '@/components/eleUpload/index.vue';
import { ElMessage } from 'element-plus/lib';
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
          label: '案例展示名称',
          type: 'text',
          prop: 'name',
        },
        {
          label: '案例展示图片',
          type: 'image',
          prop: 'image',
        },
        {
          label: '引用子模块',
          type: 'text',
          prop: 'multiText',
          formatter: (row: any) => {
            let prev = '';
            let next = '';
            sessionRead('PARENMODULE').forEach((item: any) => {
              if (item.id === row.parentModuleId) {
                prev = item.name;
              }
            });
            sessionRead('SUBMODULE').forEach((item: any) => {
              if (item.id === row.submoduleId) {
                next = item.name;
              }
            });
            return `${prev} - ${next}`;
          },
        },
        {
          label: '权重',
          type: 'tag',
          prop: 'sort',
          formatter: (val: any) => {
            let obj = {
              text: val.sort,
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
          width: '400',
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
      dialogTitle: '',
      dialogFormVisible: false,
      formData: {
        name: '',
        sort: 0,
        createTime: '',
        image: '',
        isEnable: true,
        parentModuleId: '',
        submoduleId: '',
        updateTime: '',
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
          label: '引用父模块',
          type: 'select',
          prop: 'parentModuleId',
          title: 'name',
          value: 'id',
        },
        {
          label: '引用子模块',
          type: 'select',
          prop: 'submoduleId',
          title: 'name',
          value: 'id',
        },
        {
          label: '权重',
          type: 'input',
          prop: 'sort',
        },
      ],
      options: {},
      isCreate: false,
      // 图片列表
      imageList: [],
      formRules: {
        name: [
          { required: true, message: '案例展示名称不能为空', trigger: 'blur' },
        ],
        parentModuleId: [
          { required: true, message: '请选择引用父模块', trigger: 'change' },
        ],
        submoduleId: [
          { required: true, message: '请选择引用子模块', trigger: 'change' },
        ],
      },
    });
    let METHODS: any = reactive({
      // 分页获取案例展示数据
      handlePagingData: async () => {
        DATA.loading = true;
        let { data } = await pagingCaseShow(DATA.pagingObj);
        if (data.code === RES_SUCCESS) {
          DATA.loading = false;
          DATA.tableData = data.data.records;
          DATA.total = data.data.total;
        }
      },
      // 点击添加案例展示
      handleCreate: () => {
        DATA.dialogTitle = '添加案例展示';
        DATA.dialogFormVisible = true;
        DATA.isCreate = true;
        DATA.imageList = [];
        DATA.formData = Object.assign(
          {},
          {
            name: '',
            sort: 0,
            createTime: '',
            image: '',
            isEnable: true,
            parentModuleId: '',
            submoduleId: '',
            updateTime: '',
          }
        );
        DATA.options.submoduleId = [];
        nextTick(() => {
          proxy.$refs['formRef'].clearForm();
        });
      },
      // 图片上传成功
      uploadSuccess: (res: any) => {
        if (res.code === RES_SUCCESS) {
          DATA.formData.image = res.data;
        }
      },
      // 切换下拉框
      handleChange: async ({ formdata, item }: any) => {
        if (item.prop === 'parentModuleId') {
          DATA.options.submoduleId = [];
          DATA.formData.submoduleId = '';
          METHODS.handleQuerySubModule(formdata.parentModuleId);
        }
      },
      // 根据父模块查询子模块
      handleQuerySubModule: async (id: number) => {
        let { data } = await querySubModuleList({ id });
        if (data.code === RES_SUCCESS) {
          DATA.options.submoduleId = data.data;
          data.data.length === 0 && (DATA.formData.submoduleId = '');
        }
      },
      // 确认添加、编辑案例
      handleConfirm: () => {
        delete DATA.formData.createTime;
        delete DATA.formData.updateTime;
        if (!DATA.formData.image) {
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
              createCaseShow(DATA.formData).then(({ data }) => {
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: '添加案例展示成功',
                    type: 'success',
                  });
                  METHODS.handlePagingData();
                  DATA.dialogFormVisible = false;
                }
              });
            }
          });
        } else {
          proxy.$refs['formRef'].submitForm().then((res: boolean) => {
            if (res) {
              updateCaseShow(DATA.formData).then(({ data }) => {
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: '修改案例展示成功',
                    type: 'success',
                  });
                  METHODS.handlePagingData();
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
            DATA.dialogFormVisible = true;
            DATA.dialogTitle = '编辑案例展示';
            DATA.isCreate = false;
            DATA.imageList = [];
            row.image && DATA.imageList.push({ url: IMG_File + row.image });
            sessionRead('PARENMODULE').some((item: any) => {
              return item.id === row.parentModuleId;
            }) || (row.parentModuleId = null);
            sessionRead('SUBMODULE').some((item: any) => {
              return item.id === row.submoduleId;
            }) || (row.submoduleId = null);
            DATA.formData = Object.assign({}, row);
            METHODS.handleQuerySubModule(row.parentModuleId);
            nextTick(() => {
              proxy.$refs['formRef'].clearForm();
            });
            break;
          case 'delete':
            proxy
              .$confirm('是否确定删除该案例展示', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              })
              .then(() => {
                deleteCaseShow({ id: row.id }).then(({ data }) => {
                  if (data.code === RES_SUCCESS) {
                    proxy.$message({
                      type: 'success',
                      message: '删除成功!',
                    });
                    METHODS.handlePagingData();
                  }
                });
              })
              .catch(() => {});
            break;
          default:
            break;
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
      // 切换switch
      handleEmitChange: async (row: any, item: any) => {
        let { data } = await enableCaseShow({ id: row.id });
        if (data.code === RES_SUCCESS) {
          if (row.isEnable) {
            ElMessage({
              message: '启用案例展示成功',
              type: 'success',
            });
          } else {
            ElMessage({
              message: '不启用案例展示成功',
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
      METHODS.handlePagingData();
      DATA.options.parentModuleId = sessionRead('PARENMODULE');
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>
<style lang="scss" scoped>
// .CaseShow_container {
//   .CaseShow_container_head {
//   }
//   .CaseShow_container_body {
//   }
// }
</style>
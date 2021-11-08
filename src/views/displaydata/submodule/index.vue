<template>
  <div>
    <div>
      <el-select
        v-model="pagingObj.parentId"
        placeholder="请选择父模块"
        style="margin-right:10px"
        @change="handleChangeCascader"
        clearable
      >
        <el-option
          v-for="item in sessionRead('PARENMODULE')"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        >
        </el-option>
      </el-select>
      <el-select
        v-model="pagingObj.id"
        placeholder="请选择子模块"
        style="margin-right:10px"
        clearable
        @change="handleChangeSubmodule"
      >
        <el-option
          v-for="item in submoduleList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        >
        </el-option>
      </el-select>
      <!-- <el-button
        type="primary"
        @click="handleSearch"
      >搜索</el-button> -->
      <el-button
        type="primary"
        @click="handleCreate"
        style="margin-right:10px"
      >添加子模块</el-button>
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
        :options="options"
        ref="formRef"
        @handleChange="handleChange"
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
import { ElMessage } from 'element-plus/lib';
import {
  createSubModule,
  deleteSubModule,
  enableSubModule,
  findChangeType,
  getAllSubModule,
  pagingSubModule,
  querySubModuleList,
  updateSubModule,
} from '@/api/displaydata/subModule';
import { RES_SUCCESS, sessionRead, sessionWrite } from '@/api/common/common';
import { useRouter } from 'vue-router';
import { getAllMedia } from '@/api/displaydata/media';

export default defineComponent({
  components: {
    EleTable,
    EleForm,
    ElePagination,
  },
  setup() {
    // 获取vue实例
    const { proxy }: any = getCurrentInstance();
    // 获取路由实例
    const ROUTER = useRouter();
    // 验证子模块是否引用
    let validateType = async (rule: any, value: number, callback: any) => {
      if (DATA.formData.id) {
        let { data } = await findChangeType({
          id: DATA.formData.id,
          reference: DATA.formData.reference,
        });
        if (data.data !== null) {
          callback(new Error('该子模块已被引用'));
        } else {
          callback();
        }
      }
    };
    let DATA: any = reactive({
      pagingObj: {
        limit: 10,
        page: 1,
        parentId: '',
        id: '',
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
          label: '子模块名称',
          type: 'text',
          prop: 'name',
        },
        {
          label: '父模块名称',
          type: 'text',
          prop: 'parentId',
          formatter: (row: any) => {
            let parentname = '';
            sessionRead('PARENMODULE').forEach((item: any) => {
              if (item.id === row.parentId) {
                parentname = item.name;
              }
            });
            return parentname;
          },
        },
        {
          label: '子模块类型',
          type: 'text',
          prop: 'type',
          formatter: (row: any) => {
            let subType = '';
            sessionRead('SUBMODULETYPE').forEach((item: any) => {
              if (item.type === row.type) {
                subType = item.typeName;
              }
            });
            return subType;
          },
        },
        {
          label: '引用模块',
          type: 'multiText',
          formatter: (row: any) => {
            if (row.type === 8) {
              let prev = '';
              let next = '';
              sessionRead('PARENMODULE').forEach((item: any) => {
                if (item.id === row.referenceParentId) {
                  prev = item.name;
                }
              });
              sessionRead('SUBMODULE').forEach((item: any) => {
                if (item.id === row.reference) {
                  next = item.name;
                }
              });
              return `${prev} - ${next}`;
            } else {
              return '';
            }
          },
        },
        {
          label: '权重',
          prop: 'sort',
          type: 'tag',
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
          prop: 'updateTime',
          type: 'text',
          formatter: (row: any) => {
            return proxy.$filterTime(row.updateTime);
          },
        },
        {
          label: '创建时间',
          prop: 'createTime',
          type: 'text',
          formatter: (row: any) => {
            return proxy.$filterTime(row.createTime);
          },
        },
        {
          label: '是否启用',
          prop: 'isEnable',
          type: 'switch',
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
          type: 'primary',
          handleType: 'edit',
        },
        {
          text: '管理',
          type: 'primary',
          handleType: 'admin',
          prop: 'type',
          value: 8,
        },
        {
          text: '删除',
          type: 'danger',
          handleType: 'delete',
        },
      ],
      loading: false,
      total: 0,
      dialogTitle: '',
      dialogFormVisible: false,
      formData: {
        createTime: '',
        isEnable: true,
        name: '',
        parentId: '',
        reference: null,
        referenceParentId: null,
        contentOrder: '',
        sort: 0,
        type: '',
        updateTime: '',
      },
      renderFormArr: [
        {
          label: '子模块名称',
          type: 'input',
          prop: 'name',
        },
        {
          label: '父模块',
          type: 'select',
          prop: 'parentId',
          title: 'name',
          value: 'id',
          // exceptVal: 8,
          // showProp: 'type',
        },
        {
          label: '子模块类型',
          type: 'select',
          prop: 'type',
          title: 'typeName',
          value: 'type',
        },
        {
          label: '排版方式',
          type: 'select',
          prop: 'contentOrder',
          title: 'order',
          value: 'boolean',
          showProp: 'type',
          showVal: 6,
        },
        {
          label: '引用父模块',
          type: 'select',
          prop: 'referenceParentId',
          title: 'name',
          value: 'id',
          showProp: 'type',
          showVal: 8,
        },
        {
          label: '引用子模块',
          type: 'select',
          prop: 'reference',
          title: 'name',
          value: 'id',
          showProp: 'type',
          showVal: 8,
        },
        {
          label: '权重',
          type: 'input',
          prop: 'sort',
        },
      ],
      formRules: {
        name: [
          { required: true, message: '子模块名称不能为空', trigger: 'blur' },
        ],
        parentId: [
          { required: true, message: '父模块不能为空', trigger: 'change' },
        ],
        type: [
          { required: true, message: '子模块类型不能为空', trigger: 'change' },
        ],
        contentOrder: [
          { required: true, message: '排版方式不能为空', trigger: 'change' },
        ],
        reference: [
          { required: true, message: '引用子模块不能为空', trigger: 'change' },
          { validator: validateType, trigger: 'change' },
        ],
        referenceParentId: [
          { required: true, message: '引用父模块不能为空', trigger: 'change' },
        ],
      },
      options: {},
      isCreate: false,
      idList: [],
      type: '',
      submoduleList: [],
    });
    let METHODS: any = reactive({
      // 获取所有子模块
      handleGetAllSubModule: async () => {
        let { data } = await getAllSubModule();
        if (data.code === RES_SUCCESS) {
          sessionWrite('SUBMODULE', data.data);
        }
      },
      // 分页获取子模块
      handlePagingSubModule: async () => {
        DATA.loading = true;
        let { data } = await pagingSubModule(DATA.pagingObj);
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
        METHODS.handlePagingSubModule();
      },
      // 修改表格页数
      handleCurrentChange: (val: number) => {
        DATA.pagingObj.page = val;
        METHODS.handlePagingSubModule();
      },
      // 点击添加
      handleCreate: () => {
        DATA.dialogTitle = '添加子模块';
        DATA.dialogFormVisible = true;
        DATA.isCreate = true;
        DATA.formData = Object.assign(
          {},
          {
            createTime: '',
            isEnable: true,
            name: '',
            parentId: '',
            reference: '',
            referenceParentId: '',
            sort: 0,
            type: '',
            updateTime: '',
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
            DATA.dialogTitle = '编辑子模块';
            DATA.dialogFormVisible = true;
            DATA.isCreate = false;
            sessionRead('PARENMODULE').some((item: any) => {
              return item.id === row.referenceParentId;
            }) || (row.referenceParentId = '');
            sessionRead('SUBMODULE').some((item: any) => {
              return item.id === row.reference;
            }) || (row.reference = '');
            DATA.formData = Object.assign({}, row);
            DATA.type = row.type;
            if (row.type === 8) {
              METHODS.handleQuerySubModule(row.referenceParentId);
            }
            nextTick(() => {
              proxy.$refs['formRef'].clearForm();
            });
            break;
          case 'delete':
            proxy
              .$confirm(
                '删除该子模块会将此模块下关联数据一并删除,是否确认删除',
                '提示',
                {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning',
                  customClass: 'configBox',
                }
              )
              .then(() => {
                deleteSubModule({ id: row.id }).then(({ data }) => {
                  if (data.code === RES_SUCCESS) {
                    proxy.$message({
                      type: 'success',
                      message: '删除成功!',
                    });
                    METHODS.handleGetAllSubModule();
                    METHODS.handleGetAllMedia();
                    METHODS.handlePagingSubModule();
                  }
                });
              })
              .catch(() => {});
            break;
          case 'admin':
            switch (row.type) {
              case 1:
                ROUTER.push({
                  name: 'singleImg',
                  query: { id: row.id, type: row.type, parentId: row.parentId },
                });
                break;
              case 2:
                ROUTER.push({
                  name: 'moreImg',
                  query: { id: row.id, type: row.type, parentId: row.parentId },
                });
                break;
              case 3:
                ROUTER.push({
                  name: 'singleVideo',
                  query: { id: row.id, type: row.type, parentId: row.parentId },
                });
                break;
              case 4:
                ROUTER.push({
                  name: 'moreVideo',
                  query: { id: row.id, type: row.type, parentId: row.parentId },
                });
                break;
              case 5:
                ROUTER.push({
                  name: 'singleDoc',
                  query: { id: row.id, type: row.type, parentId: row.parentId },
                });
                break;
              case 6:
                ROUTER.push({
                  name: 'moreDoc',
                  query: { id: row.id, type: row.type, parentId: row.parentId },
                });
                break;
              case 7:
                ROUTER.push({
                  name: 'twoClassify',
                  query: { id: row.id, type: row.type, parentId: row.parentId },
                });
                break;
              case 8:
                ROUTER.push({
                  name: 'twoDocument',
                  query: { id: row.id, type: row.type },
                });
                break;
              default:
                break;
            }
            break;
          default:
            break;
        }
      },
      // switch
      handleEmitChange: (val: any, item: any) => {
        enableSubModule({ id: val.id }).then(({ data }) => {
          if (data.code === RES_SUCCESS) {
            if (val.isEnable) {
              ElMessage({
                message: '子模块启用成功',
                type: 'success',
              });
            } else {
              ElMessage({
                message: '子模块不启用成功',
                type: 'success',
              });
            }
            METHODS.handleGetAllSubModule();
          }
        });
      },
      // 确认编辑、添加
      handleConfirm: () => {
        delete DATA.formData.createTime;
        delete DATA.formData.updateTime;
        if (DATA.isCreate) {
          proxy.$refs['formRef'].submitForm().then((res: boolean) => {
            if (res) {
              createSubModule(DATA.formData).then(({ data }) => {
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: '添加子模块成功',
                    type: 'success',
                  });
                  DATA.dialogFormVisible = false;
                  METHODS.handlePagingSubModule();
                  METHODS.handleGetAllSubModule();
                }
              });
            }
          });
        } else {
          delete DATA.formData.children;
          proxy.$refs['formRef'].submitForm().then((res: boolean) => {
            if (res) {
              // delete DATA.formData.referenceParentId;
              updateSubModule(DATA.formData).then(({ data }) => {
                if (data.code === RES_SUCCESS) {
                  if (DATA.type !== DATA.formData.type) {
                    METHODS.handleGetAllMedia();
                  }
                  ElMessage({
                    message: '编辑子模块成功',
                    type: 'success',
                  });
                  DATA.dialogFormVisible = false;
                  METHODS.handlePagingSubModule();
                  METHODS.handleGetAllSubModule();
                }
              });
            }
          });
        }
      },
      // 根据父模块查询子模块
      handleQuerySubModule: async (id: number) => {
        let { data } = await querySubModuleList({ id });
        if (data.code === RES_SUCCESS) {
          data.data.forEach((item: any) => {
            if (item.id === DATA.formData.id) {
              item.disabled = true;
            }
          });
          DATA.options.reference = data.data;
        }
      },
      // 切换下拉框
      handleChange: async ({ formdata, item }: any) => {
        if (item.prop === 'referenceParentId') {
          DATA.formData.reference = null;
          METHODS.handleQuerySubModule(formdata.referenceParentId);
        }
        if (item.prop === 'type' && !DATA.isCreate) {
          // proxy.$notify({
          //   title: '警告',
          //   message: '切换子模块类型会将删除之前关联数据',
          //   type: 'warning',
          // });
          proxy
            .$confirm(
              '切换子模块类型会删除之前关联该子模块类型数据,是否确认切换',
              '提示',
              {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              }
            )
            .then(() => {})
            .catch(() => {
              DATA.formData.type = DATA.type;
            });
        }
        if (item.prop === 'type') {
          DATA.formData.reference = null;
          DATA.formData.referenceParentId = null;
          DATA.options.reference = [];
        }
      },
      handleChangeCascader: async (value: any) => {
        DATA.submoduleList = [];
        DATA.pagingObj.id = '';
        await METHODS.handlePagingSubModule();
        let { data } = await querySubModuleList({
          id: DATA.pagingObj.parentId,
        });
        if (data.code === RES_SUCCESS) {
          DATA.submoduleList = data.data;
        }
      },
      handleChangeSubmodule: () => {
        METHODS.handlePagingSubModule();
      },
      // handleSearch: () => {
      //   METHODS.handlePagingSubModule();
      // },
    });
    onMounted(() => {
      METHODS.handlePagingSubModule();
      DATA.options.parentId = sessionRead('PARENMODULE');
      DATA.options.referenceParentId = sessionRead('PARENMODULE');
      DATA.options.type = sessionRead('SUBMODULETYPE');
      DATA.options.contentOrder = [
        {
          order: '横向排版',
          boolean: true,
        },
        {
          order: '纵向排版',
          boolean: false,
        },
      ];
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      sessionRead,
    };
  },
});
</script>
<style lang="scss" scoped>
</style>
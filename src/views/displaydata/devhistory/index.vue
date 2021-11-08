<template>
  <div class="devhistory_container">
    <div class="devhistory_container_head">
      <el-button
        type="primary"
        @click="handleCreate"
      >添加时间节点</el-button>
    </div>
    <div class="devhistory_container_body">
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
        :options="options"
        @handleChange="handleChange"
        v-loading="dialogLoading"
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
import {
  createDevHistory,
  deleteDevHistory,
  enableDevHistory,
  pagingDevHistory,
  updateDevHistory,
} from '@/api/displaydata/devhistory';
import EleTable from '@/components/eleTable/index.vue';
import EleForm from '@/components/eleForm/index.vue';
import ElePagination from '@/components/elePagination/index.vue';
import EleUpload from '@/components/eleUpload/index.vue';
import { IMG_File, RES_SUCCESS, sessionRead } from '@/api/common/common';
import {
  findTypeSubModule,
  queryTypeSubModuleList,
} from '@/api/displaydata/subModule';
import {
  getMediaByType,
  getSecondLevelMediaByType,
} from '@/api/displaydata/media';
import { ElMessage } from 'element-plus/lib';
export default defineComponent({
  components: {
    EleTable,
    EleForm,
    ElePagination,
    EleUpload,
  },
  setup() {
    // 获取vue实例
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
          label: '节点标题',
          type: 'text',
          prop: 'title',
        },
        {
          label: '节点图片',
          type: 'image',
          prop: 'image',
        },
        {
          label: '节点年份',
          type: 'text',
          prop: 'year',
        },
        {
          label: '引用',
          type: 'multiText',
          formatter: (row: any) => {
            if (row.type === 9) {
              return '无';
            }
            let prev = '';
            let mid = '';
            let next = '';
            let stern = '';
            sessionRead('PARENMODULE').forEach((item: any) => {
              if (item.id === row.parentModuleId) {
                prev = item.name;
              }
            });
            sessionRead('SUBMODULE').forEach((item: any) => {
              if (item.id === row.submoduleId) {
                mid = item.name;
              }
            });
            sessionRead('MEDIAMODULE').forEach((item: any) => {
              if (item.id === row.reference) {
                next = item.name;
              }
            });

            sessionRead('PARENMODULE').some((item: any) => {
              return item.id === row.parentModuleId;
            }) || (prev = '');
            sessionRead('SUBMODULE').some((item: any) => {
              return item.id === row.submoduleId;
            }) || (mid = '');
            sessionRead('MEDIAMODULE').some((item: any) => {
              return item.id === row.reference;
            }) || (next = '');
            if (row.type === 7) {
              sessionRead('MEDIAMODULE').forEach((item: any) => {
                if (item.id === row.mediaId) {
                  stern = item.name;
                }
              });
              sessionRead('MEDIAMODULE').some((item: any) => {
                return item.id === row.mediaId;
              }) || (stern = '');
              return `${prev} - ${mid} - ${next} - ${stern}`;
            } else {
              return `${prev} - ${mid} - ${next}`;
            }
          },
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
          prop: 'isEnable',
          type: 'switch',
          label: '是否启用',
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
      dialogTitle: '',
      dialogFormVisible: false,
      formData: {
        createTime: '',
        image: '',
        isEnable: true,
        mediaId: '',
        parentModuleId: '',
        reference: '',
        sort: 0,
        submoduleId: '',
        title: '',
        type: '',
        updateTime: '',
        year: '',
      },
      renderFormArr: [
        {
          label: '节点标题',
          type: 'input',
          prop: 'title',
        },
        {
          label: '节点图片',
          type: 'slot',
          slotName: 'image',
        },
        {
          label: '节点年份',
          type: 'date',
          prop: 'year',
          dateType: 'year',
          placeholder: '请选择年份',
        },
        {
          label: '引用类型',
          type: 'select',
          prop: 'type',
          title: 'typeName',
          value: 'type',
        },
        {
          label: '引用父模块',
          type: 'select',
          prop: 'parentModuleId',
          title: 'name',
          value: 'id',
          exceptVal: 9,
          showProp: 'type',
        },
        {
          label: '引用子模块',
          type: 'select',
          prop: 'submoduleId',
          title: 'name',
          value: 'id',
          exceptVal: 9,
          showProp: 'type',
        },
        {
          label: '引用分类',
          type: 'select',
          prop: 'mediaId',
          title: 'name',
          value: 'id',
          showProp: 'type',
          showVal: 7,
        },
        {
          label: '引用',
          type: 'select',
          prop: 'reference',
          title: 'name',
          value: 'id',
          exceptVal: 9,
          showProp: 'type',
        },
        {
          label: '权重',
          type: 'input',
          prop: 'sort',
        },
      ],
      formRules: {
        title: [
          { required: true, message: '模块名称不能为空', trigger: 'blur' },
        ],
        mediaId: [
          { required: true, message: '引用分类不能为空', trigger: 'change' },
        ],
        parentModuleId: [
          { required: true, message: '引用父模块不能为空', trigger: 'change' },
        ],
        reference: [
          { required: true, message: '引用不能为空', trigger: 'change' },
        ],
        submoduleId: [
          { required: true, message: '引用子模块不能为空', trigger: 'change' },
        ],
        year: [
          { required: true, message: '节点年份不能为空', trigger: 'change' },
        ],
        type: [
          { required: true, message: '引用类型不能为空', trigger: 'change' },
        ],
      },
      imageList: [],
      isCreate: false,
      options: {},
      dialogLoading: false,
    });
    let METHODS: any = reactive({
      // 分页获取表格数据
      handlePagingDevHistory: async () => {
        DATA.loading = true;
        let { data } = await pagingDevHistory(DATA.pagingObj);
        if (data.code === RES_SUCCESS) {
          DATA.loading = false;
          DATA.tableData = data.data.records;
          DATA.total = DATA.total;
        }
      },
      // 修改表格显示个数
      handleSizeChange: (val: number) => {
        DATA.pagingObj.limit = val;
        METHODS.handlePagingDevHistory();
      },
      // 修改表格显示页数
      handleCurrentChange: (val: number) => {
        DATA.pagingObj.page = val;
        METHODS.handlePagingDevHistory();
      },
      // 图片上传成功
      uploadSuccess: (res: any) => {
        DATA.formData.image = res.data;
      },
      // 确认添加编辑
      handleConfirm: () => {
        let year = '';
        delete DATA.formData.createTime;
        delete DATA.formData.updateTime;
        if (!DATA.formData.image) {
          proxy.$notify({
            title: '提示',
            message: '图片不能为空',
            type: 'warning',
          });
          return;
        }
        DATA.formData.year && (year = DATA.formData.year.getFullYear());
        if (DATA.isCreate) {
          proxy.$refs['formRef'].submitForm().then((res: boolean) => {
            if (res) {
              createDevHistory({ ...DATA.formData, year }).then(({ data }) => {
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: '添加时间节点成功',
                    type: 'success',
                  });
                  DATA.dialogFormVisible = false;
                  METHODS.handlePagingDevHistory();
                }
              });
            }
          });
        } else {
          proxy.$refs['formRef'].submitForm().then((res: boolean) => {
            if (res) {
              updateDevHistory({ ...DATA.formData, year }).then(({ data }) => {
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: '编辑时间节点成功',
                    type: 'success',
                  });
                  DATA.dialogFormVisible = false;
                  METHODS.handlePagingDevHistory();
                }
              });
            }
          });
        }
      },
      // 根据父模块及引用类型获取子模块
      queryTypeSubModuleList: async (id: number, typeId: number) => {
        let { data } = await queryTypeSubModuleList({ id, typeId });
        if (data.code === RES_SUCCESS) {
          DATA.options.submoduleId = data.data;
          if (data.data.length > 0 && !DATA.isCreate) {
            let submoduleId: number[] = [];
            data.data.forEach((item: any) => {
              submoduleId.push(item.id);
            });
            !submoduleId.includes(DATA.formData.submoduleId) &&
              (DATA.formData.submoduleId = '');
          }
          data.data.length === 0 && (DATA.formData.submoduleId = '');
        }
      },
      // 根据子模块及引用类型获取引用
      queryMediaByType: async (subModuleId: number, type: number) => {
        let { data } = await getMediaByType({ subModuleId, type });
        if (data.code === RES_SUCCESS) {
          if (type === 7) {
            DATA.options.mediaId = data.data;
            data.data.length === 0 && (DATA.formData.mediaId = '');
          } else {
            DATA.options.reference = data.data;
            data.data.length === 0 && (DATA.formData.reference = '');
          }
        }
      },
      // 根据引用分类获取引用
      querySecondLevelMediaByType: async (MediaId: number) => {
        let { data } = await getSecondLevelMediaByType({ MediaId });
        if (data.code === RES_SUCCESS) {
          DATA.options.reference = data.data;
          data.data.length === 0 && (DATA.formData.reference = '');
        }
      },
      // 下拉框切换
      handleChange: async ({ formdata, item }: any) => {
        switch (item.prop) {
          case 'parentModuleId':
            METHODS.queryTypeSubModuleList(
              formdata.parentModuleId,
              formdata.type
            );
            DATA.formData.submoduleId = null;
            DATA.formData.mediaId = null;
            DATA.formData.reference = null;
            DATA.options.submoduleId = [];
            DATA.options.mediaId = [];
            DATA.options.reference = [];
            break;
          case 'submoduleId':
            METHODS.queryMediaByType(formdata.submoduleId, formdata.type);
            DATA.formData.mediaId = null;
            DATA.formData.reference = null;
            DATA.options.mediaId = [];
            DATA.options.reference = [];
            break;
          case 'mediaId':
            METHODS.querySecondLevelMediaByType(formdata.mediaId);
            DATA.formData.reference = null;
            DATA.options.reference = [];
            break;
          case 'type':
            DATA.formData.parentModuleId = null;
            DATA.options.parentModuleId = [];
            DATA.options.parentModuleId = sessionRead('PARENMODULE');
            DATA.formData.submoduleId = null;
            DATA.formData.mediaId = null;
            DATA.formData.reference = null;
            DATA.options.submoduleId = [];
            DATA.options.mediaId = [];
            DATA.options.reference = [];
            break;
          default:
            break;
        }
      },
      // 获取所有子模块管理类型
      handleAllTypeSubModule: async () => {
        let nub: any = '';
        sessionRead('SUBMODULETYPE').forEach((item: any, index: number) => {
          if (item.type === 8) {
            nub = index;
          }
        });
        DATA.options.type = sessionRead('SUBMODULETYPE');
        DATA.options.type.splice(nub, 1);
        DATA.options.type.push({ type: 9, typeName: '无' });
      },
      // 点击添加
      handleCreate: () => {
        DATA.dialogTitle = '添加时间节点';
        DATA.dialogFormVisible = true;
        DATA.formData = Object.assign(
          {},
          {
            createTime: '',
            image: '',
            isEnable: true,
            mediaId: '',
            parentModuleId: '',
            reference: '',
            sort: 0,
            submoduleId: '',
            title: '',
            type: '',
            updateTime: '',
            year: '',
          }
        );
        DATA.isCreate = true;
        DATA.imageList = [];
        DATA.options.submoduleId = [];
        DATA.options.mediaId = [];
        DATA.options.reference = [];
        DATA.options.parentModuleId = [];
        nextTick(() => {
          proxy.$refs['formRef'].clearForm();
        });
      },
      // 操作按钮
      handleBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case 'edit':
            DATA.dialogTitle = '编辑时间节点';
            DATA.dialogFormVisible = true;
            DATA.dialogLoading = true;
            sessionRead('PARENMODULE').some((item: any) => {
              return item.id === row.parentModuleId;
            }) || (row.parentModuleId = null);
            sessionRead('SUBMODULE').some((item: any) => {
              return item.id === row.submoduleId;
            }) || (row.submoduleId = null);
            sessionRead('MEDIAMODULE').some((item: any) => {
              return item.id === row.reference;
            }) || (row.reference = null);
            sessionRead('MEDIAMODULE').some((item: any) => {
              return item.id === row.mediaId;
            }) || (row.mediaId = null);
            DATA.formData = Object.assign({}, row);
            DATA.isCreate = false;
            DATA.imageList = [];
            DATA.formData.image &&
              DATA.imageList.push({ url: IMG_File + DATA.formData.image });
            DATA.formData.year &&
              (DATA.formData.year = new Date(`${DATA.formData.year}`));
            METHODS.queryTypeSubModuleList(row.parentModuleId, row.type);
            DATA.options.parentModuleId = sessionRead('PARENMODULE');
            METHODS.queryMediaByType(row.submoduleId, row.type);
            if (row.type === 7) {
              METHODS.querySecondLevelMediaByType(row.mediaId);
            }
            DATA.dialogLoading = false;
            nextTick(() => {
              proxy.$refs['formRef'].clearForm();
            });
            break;
          case 'delete':
            proxy
              .$confirm('是否确定删除该时间进程', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              })
              .then(() => {
                deleteDevHistory({ id: row.id }).then(({ data }) => {
                  if (data.code === RES_SUCCESS) {
                    proxy.$message({
                      type: 'success',
                      message: '删除成功!',
                    });
                    METHODS.handlePagingDevHistory();
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
        let { data } = await enableDevHistory({ id: val.id });
        if (data.code === RES_SUCCESS) {
          if (val.isEnable) {
            ElMessage({
              message: '时间节点启用成功',
              type: 'success',
            });
          } else {
            ElMessage({
              message: '时间节点不启用成功',
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
      METHODS.handlePagingDevHistory();
      METHODS.handleAllTypeSubModule();
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
<template>
  <div class="CaseShow_container">
    <div class="CaseShow_container_head">
      <el-button
        type="primary"
        @click="handleCreate"
      >添加轮播文档</el-button>
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
    <!-- 添加、编辑轮播文档 -->
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
        :labelWidth="110"
        ref="formRef"
        v-loading="formLoading"
      >
        <template #image>
          <EleUpload
            @uploadSuccess="uploadSuccess"
            :imageList="imageList"
            ref="uploadRef"
            @uploadRemove="uploadRemove"
          />
        </template>
        <template #referenceType>
          <el-select
            v-model="formData.referenceType"
            placeholder="请选择引用类型"
            @change="handleChangeType"
          >
            <el-option
              v-for="item in documentTypeList"
              :key="item.type"
              :label="item.typeName"
              :value="item.type"
            >
            </el-option>
          </el-select>
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
  deleteCarouselDocument,
  enableDocument,
  findDocumentType,
  pagingCarouselDocument,
  saveCarouselDocument,
  updateCarouselDocument,
} from '@/api/homePagment/carouseldocument';
import { IMG_File, RES_SUCCESS, sessionRead } from '@/api/common/common';
import { queryTypeSubModuleList } from '@/api/displaydata/subModule';
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
          label: '轮播文档标题',
          type: 'text',
          prop: 'title',
        },
        {
          label: '轮播文档图片',
          type: 'image',
          prop: 'image',
        },
        {
          label: '引用文档',
          type: 'multiText',
          formatter: (row: any) => {
            let prev = '',
              mid = '',
              next = '',
              stern = '',
              type = '';
            sessionRead('SUBMODULE').forEach((item: any) => {
              if (item.id === row.submoduleId) {
                type = item.type;
              }
            });
            if (type != row.referenceType) {
              sessionRead('PARENMODULE').forEach((item: any) => {
                if (item.id === row.parentModuleId) {
                  prev = item.name;
                }
              });
              if (row.referenceType === 7) {
                return `${prev} -  -  -`;
              } else {
                return `${prev} -  - `;
              }
            }
            if (row.referenceType === 7) {
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
                if (item.id === row.mediaId) {
                  next = item.name;
                }
              });
              sessionRead('MEDIAMODULE').forEach((item: any) => {
                if (item.id === row.reference) {
                  stern = item.name;
                }
              });
              return `${prev} - ${mid} - ${next} - ${stern}`;
            } else {
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
                  stern = item.name;
                }
              });
              return `${prev} - ${mid} - ${stern}`;
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
      dialogTitle: '',
      dialogFormVisible: false,
      formData: {
        image: '',
        isEnable: true,
        mediaId: '',
        parentModuleId: '',
        reference: '',
        sort: 0,
        submoduleId: '',
        title: '',
        referenceType: '',
        createTime: '',
        updateTime: '',
      },
      renderFormArr: [
        {
          label: '轮播文档标题',
          type: 'input',
          prop: 'title',
        },
        {
          label: '轮播文档图片',
          type: 'slot',
          slotName: 'image',
        },
        {
          label: '引用类型',
          type: 'slot',
          slotName: 'referenceType',
          prop: 'referenceType',
        },
        {
          label: '引用父模板',
          type: 'select',
          prop: 'parentModuleId',
          title: 'name',
          value: 'id',
        },
        {
          label: '引用子模板',
          type: 'select',
          prop: 'submoduleId',
          title: 'name',
          value: 'id',
        },
        {
          label: '引用分类',
          type: 'select',
          prop: 'mediaId',
          showProp: 'referenceType',
          showVal: 7,
          title: 'name',
          value: 'id',
        },
        {
          label: '引用',
          type: 'select',
          prop: 'reference',
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
        referenceType: [
          { required: true, message: '引用类型不能为空', trigger: 'change' },
        ],
      },
      // 图片列表
      imageList: [],
      documentTypeList: [],
      isCreate: false,
      formLoading: false,
    });
    let METHODS: any = reactive({
      // 分页获取案例展示数据
      handlePagingData: async () => {
        DATA.loading = true;
        let { data } = await pagingCarouselDocument(DATA.pagingObj);
        if (data.code === RES_SUCCESS) {
          DATA.loading = false;
          DATA.tableData = data.data.records;
          DATA.total = data.data.total;
        }
      },
      // 修改表格显示个数
      handleSizeChange: (val: number) => {
        DATA.pagingObj.limit = val;
        METHODS.handlePagingData();
      },
      // 修改表格显示页数
      handleCurrentChange: (val: number) => {
        DATA.pagingObj.page = val;
        METHODS.handlePagingData();
      },
      // 点击添加轮播文档
      handleCreate: () => {
        DATA.dialogTitle = '添加轮播文档';
        DATA.dialogFormVisible = true;
        DATA.isCreate = true;
        DATA.formData = Object.assign(
          {},
          {
            image: '',
            isEnable: true,
            mediaId: '',
            parentModuleId: '',
            reference: '',
            sort: 0,
            submoduleId: '',
            title: '',
            referenceType: '',
            createTime: '',
            updateTime: '',
          }
        );
        DATA.options.submoduleId = [];
        DATA.options.mediaId = [];
        DATA.options.reference = [];
        DATA.options.parentModuleId = [];
        DATA.imageList = [];
        nextTick(() => {
          proxy.$refs['formRef'].clearForm();
        });
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
              formdata.referenceType
            );
            DATA.formData.submoduleId = null;
            DATA.formData.mediaId = null;
            DATA.formData.reference = null;
            DATA.options.submoduleId = [];
            DATA.options.mediaId = [];
            DATA.options.reference = [];
            break;
          case 'submoduleId':
            METHODS.queryMediaByType(
              formdata.submoduleId,
              formdata.referenceType
            );
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
          default:
            break;
        }
      },
      // 上传图片成功
      uploadSuccess: (res: any) => {
        DATA.formData.image = res.data;
      },
      // 确认编辑、添加
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
              saveCarouselDocument(DATA.formData).then(({ data }) => {
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: '添加轮播文档成功',
                    type: 'success',
                  });
                  DATA.dialogFormVisible = false;
                  METHODS.handlePagingData();
                }
              });
            }
          });
        } else {
          proxy.$refs['formRef'].submitForm().then((res: boolean) => {
            if (res) {
              updateCarouselDocument(DATA.formData).then(({ data }) => {
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: '修改轮播文档成功',
                    type: 'success',
                  });
                  DATA.dialogFormVisible = false;
                  METHODS.handlePagingData();
                }
              });
            }
          });
        }
      },
      // 获取轮播文档类型
      handlefagingType: async () => {
        let { data } = await findDocumentType();
        if (data.code === RES_SUCCESS) {
          DATA.documentTypeList = data.data;
        }
      },
      // 切换引用类型
      handleChangeType: () => {
        DATA.formData.parentModuleId = null;
        DATA.options.parentModuleId = [];
        DATA.options.parentModuleId = sessionRead('PARENMODULE');
        DATA.formData.submoduleId = null;
        DATA.formData.mediaId = null;
        DATA.formData.reference = null;
        DATA.options.submoduleId = [];
        DATA.options.mediaId = [];
        DATA.options.reference = [];
      },
      // 操作按钮
      handleBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case 'edit':
            DATA.dialogFormVisible = true;
            DATA.isCreate = false;
            DATA.formLoading = true;
            DATA.dialogTitle = '编辑轮播文档';
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
            DATA.imageList = [];
            DATA.formData.image &&
              DATA.imageList.push({ url: IMG_File + DATA.formData.image });
            METHODS.queryTypeSubModuleList(
              row.parentModuleId,
              row.referenceType
            );
            DATA.options.parentModuleId = sessionRead('PARENMODULE');
            METHODS.queryMediaByType(row.submoduleId, row.referenceType);
            if (row.referenceType === 7) {
              METHODS.querySecondLevelMediaByType(row.mediaId);
            }
            DATA.formLoading = false;
            nextTick(() => {
              proxy.$refs['formRef'].clearForm();
            });
            break;
          case 'delete':
            proxy
              .$confirm('是否确定删除该轮播文档', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              })
              .then(() => {
                deleteCarouselDocument({ id: row.id }).then(({ data }) => {
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
      // 切换switch
      handleEmitChange: async (val: any, item: any) => {
        let { data } = await enableDocument({ id: val.id });
        if (data.code === RES_SUCCESS) {
          if (val.isEnable) {
            ElMessage({
              message: '轮播文档启用成功',
              type: 'success',
            });
          } else {
            ElMessage({
              message: '轮播文档不启用成功',
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
      METHODS.handlefagingType();
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
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
      >添加文档</el-button>
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
    <!-- 添加案例模态框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogFormVisible"
      width="1350px"
      top="5vh"
      :close-on-click-modal="false"
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
            @uploadRemove="uploadRemove"
            :imageList="imageList"
            ref="uploadRef"
          />
        </template>
        <template #wangEdit>
          <div id="wangEdit"></div>
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
    <!-- 编辑案例模态框 -->
    <el-dialog
      title="编辑文档"
      v-model="dialogEditFormVisible"
      width="1350px"
      top="5vh"
      :close-on-click-modal="false"
    >
      <ele-form
        :formData="formEditData"
        :renderFormArr="renderEditFormArr"
        :rules="formEditRules"
        ref="formRef"
      >
        <template #image>
          <EleUpload
            @uploadSuccess="uploadEditSuccess"
            @uploadRemove="uploadEditRemove"
            :imageList="imageEditList"
            ref="uploadRef"
          />
        </template>
        <template #wangEdit>
          <div id="editWangEdit"></div>
        </template>
      </ele-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogEditFormVisible = false">取 消</el-button>
          <el-button
            type="primary"
            @click="handleEditConfirm"
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
  IMG_URL,
  multiUpload,
  RES_SUCCESS,
  sessionRead,
  sessionWrite,
  VIDEO_URL,
} from '@/api/common/common';
import E from 'wangeditor';
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
    const editEditor = new E('#editWangEdit');
    let DATA: any = reactive({
      pagingObj: {
        limit: 10,
        page: 1,
        subModuleId: '',
        type: '',
      },
      // 表格
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
          label: '标题图片',
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
      // 添加表单
      dialogTitle: '',
      dialogFormVisible: false,
      formData: {
        htmlData: '',
        isEnable: true,
        multimedia: '',
        name: '',
        plainText: '',
        submoduleId: ROUTE.query.id,
        type: ROUTE.query.type,
        sort: 0,
      },
      renderFormArr: [
        {
          label: '标题',
          type: 'input',
          prop: 'name',
        },
        {
          label: '标题图片',
          type: 'slot',
          slotName: 'image',
        },
        {
          label: '内容',
          type: 'slot',
          slotName: 'wangEdit',
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
      imageList: [],
      // 编辑表单
      dialogEditFormVisible: false,
      formEditData: {
        htmlData: '',
        isEnable: true,
        multimedia: '',
        name: '',
        plainText: '',
        submoduleId: ROUTE.query.id,
        type: ROUTE.query.type,
        sort: 0,
      },
      renderEditFormArr: [
        {
          label: '标题',
          type: 'input',
          prop: 'name',
        },
        {
          label: '标题图片',
          type: 'slot',
          slotName: 'image',
        },
        {
          label: '内容',
          type: 'slot',
          slotName: 'wangEdit',
        },
        {
          label: '权重',
          type: 'input',
          prop: 'sort',
        },
      ],
      formEditRules: {
        name: [
          { required: true, message: '标题名称不能为空', trigger: 'blur' },
        ],
      },
      imageEditList: [],
      editor: null,
      editEditor: null,
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
      // 点击添加文档
      handleCreate: () => {
        DATA.dialogTitle = '添加文档';
        DATA.dialogFormVisible = true;
        DATA.imageList = [];
        DATA.formData = Object.assign(
          {},
          {
            htmlData: '',
            isEnable: true,
            multimedia: '',
            name: '',
            plainText: '',
            submoduleId: Number(ROUTE.query.id),
            type: Number(ROUTE.query.type),
            sort: 0,
          }
        );
        DATA.editor = new E('#wangEdit');
        METHODS.initEditor();
        nextTick(() => {
          DATA.editor.create();
          DATA.editor.txt.html('');
          proxy.$refs['formRef'].clearForm();
        });
      },
      // 操作按钮
      handleBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case 'edit':
            DATA.dialogEditFormVisible = true;
            DATA.imageEditList = [];
            row.multimedia &&
              DATA.imageEditList.push({ url: IMG_File + row.multimedia });
            DATA.formEditData = Object.assign({}, row);
            DATA.editEditor = new E('#editWangEdit');
            METHODS.initEditEditor();
            nextTick(() => {
              DATA.editEditor.create();
              row.htmlData && DATA.editEditor.txt.html(row.htmlData);
              proxy.$refs['formRef'].clearForm();
            });
            break;
          case 'delete':
            proxy
              .$confirm('是否确定删除该文档', '提示', {
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
      handleEmitChange: async (val: any) => {
        let { data } = await enableMedia({ id: val.id });
        if (data.code === RES_SUCCESS) {
          if (val.isEnable) {
            ElMessage({
              message: '文档启用成功',
              type: 'success',
            });
          } else {
            ElMessage({
              message: '文档不启用成功',
              type: 'success',
            });
          }
          METHODS.handleGetAllMedia();
        }
      },
      // 图片上传成功
      uploadSuccess: (res: any) => {
        DATA.formData.multimedia = res.data;
        DATA.imageList = [];
        DATA.imageList.push({ url: IMG_File + res.data });
      },
      // 图片移除成功
      uploadRemove: (res: any) => {
        DATA.formData.multimedia = '';
      },
      // 确认添加
      handleConfirm: () => {
        // const editor = new E('#wangEdit');
        DATA.formData.htmlData = DATA.editor.txt.html();
        DATA.formData.plainText = DATA.editor.txt.text();
        proxy.$refs['formRef'].submitForm().then((res: boolean) => {
          if (res) {
            createMedia(DATA.formData).then(({ data }) => {
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  message: '文档添加成功',
                  type: 'success',
                });
                METHODS.handlePagingData();
                METHODS.handleGetAllMedia();
                DATA.dialogFormVisible = false;
              }
            });
          }
        });
      },
      // 确认编辑
      handleEditConfirm: () => {
        delete DATA.formEditData.createTime;
        delete DATA.formEditData.updateTime;
        delete DATA.formEditData.children;
        // const editEditor = new E('#editWangEdit');
        DATA.formEditData.htmlData = DATA.editEditor.txt.html();
        DATA.formEditData.plainText = DATA.editEditor.txt.text();
        proxy.$refs['formRef'].submitForm().then((res: boolean) => {
          if (res) {
            updateMedia(DATA.formEditData).then(({ data }) => {
              if (data.code === RES_SUCCESS) {
                ElMessage({
                  message: '文档编辑成功',
                  type: 'success',
                });
                METHODS.handlePagingData();
                METHODS.handleGetAllMedia();
                DATA.dialogEditFormVisible = false;
              }
            });
          }
        });
      },
      uploadEditSuccess: (res: any) => {
        DATA.formEditData.multimedia = res.data;
        DATA.imageEditList = [];
        DATA.imageEditList.push({ url: IMG_File + res.data });
      },
      // 图片移除成功
      uploadEditRemove: (res: any) => {
        DATA.formEditData.multimedia = '';
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
      initEditor: () => {
        //开启debug模式
        // editor.config.debug = true;
        // 关闭粘贴内容中的样式
        DATA.editor.config.pasteFilterStyle = false;
        // 忽略粘贴内容中的图片
        DATA.editor.config.pasteIgnoreImg = false;
        // 使用 base64 保存图片
        //editor.config.uploadImgShowBase64 = true
        // 上传图片到服务器
        DATA.editor.config.uploadFileName = 'file'; //设置文件上传的参数名称
        DATA.editor.config.uploadVideoName = 'file'; //设置视频文件上传的参数名称
        // 上传视频服务器
        DATA.editor.config.uploadVideoServer = VIDEO_URL;
        // DATA.editor.config.uploadImgServer = IMG_URL; //设置上传文件的服务器路径
        DATA.editor.config.uploadImgHeaders = {
          Authorization: localStorage.getItem('Admin-Token'), // 设置请求头
        };
        DATA.editor.config.uploadVideoHeaders = {
          Authorization: localStorage.getItem('Admin-Token'), // 设置请求头
        };
        DATA.editor.config.uploadImgMaxSize = 10 * 1024 * 1024; // 将图片大小限制为 3M
        DATA.editor.config.uploadImgMaxLength = 5;
        // 上传视频回调
        DATA.editor.config.uploadVideoHooks = {
          // 上传视频之前
          before: function (xhr: any) {
            // console.log(xhr);
            // 可阻止视频上传
            // return {
            //   prevent: true,
            //   msg: '需要提示给用户的错误信息',
            // };
          },
          // 视频上传并返回了结果，视频插入已成功
          success: function (xhr: any) {
            // console.log('success', xhr);
          },
          // 视频上传并返回了结果，但视频插入时出错了
          fail: function (xhr: any, editor: any, resData: any) {
            // console.log('fail', resData);
          },
          // 上传视频出错，一般为 http 请求的错误
          error: function (xhr: any, editor: any, resData: any) {
            // console.log('error', xhr, resData);
          },
          // 上传视频超时
          timeout: function (xhr: any) {
            // console.log('timeout');
          },
          // 视频上传并返回了结果，想要自己把视频插入到编辑器中
          // 例如服务器端返回的不是 { errno: 0, data: { url : '.....'} } 这种格式，可使用 customInsert
          customInsert: function (insertVideoFn: any, result: any) {
            // result 即服务端返回的接口
            // console.log('customInsert', result);

            // insertVideoFn 可把视频插入到编辑器，传入视频 src ，执行函数即可
            insertVideoFn(IMG_File + result.data);
          },
        };
        // DATA.editor.config.uploadImgHooks = {
        //   success: function (xhr: any, editor: any, result: any) {
        //     // console.log('result: ', result);
        //     // 图片上传并返回结果，图片插入成功之后触发
        //     // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象，result 是服务器端返回的结果
        //   },
        //   fail: function (xhr: any, editor: any, result: any) {
        //     // 图片上传并返回结果，但图片插入错误时触发
        //     // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象，result 是服务器端返回的结果
        //   },
        //   error: function (xhr: any, editor: any) {
        //     // console.log('editor: ', editor);
        //     // 图片上传出错时触发
        //     // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象
        //   },
        //   // 例如服务器端返回的不是 { errno: 0, data: [...] } 这种格式，可使用 customInsert
        //   customInsert: function (insertImgFn: any, result: any) {
        //     // result 即服务端返回的接口
        //     // console.log('customInsert', result);

        //     // insertImgFn 可把图片插入到编辑器，传入图片 src ，执行函数即可
        //     insertImgFn(IMG_File + result.data);
        //   },
        // };
        DATA.editor.config.customUploadImg = function (
          resultFilesa: any,
          insertImgFn: any
        ) {
          multiUpload(resultFilesa).then(({ data }) => {
            data.data.forEach((item: any) => {
              // insertImgFn 是获取图片 url 后，插入到编辑器的方法
              // 上传图片，返回结果，将图片插入到编辑器中
              insertImgFn(item);
            });
          });
        };
      },
      initEditEditor: () => {
        //开启debug模式
        // editor.config.debug = true;
        // 关闭粘贴内容中的样式
        DATA.editEditor.config.pasteFilterStyle = false;
        // 忽略粘贴内容中的图片
        DATA.editEditor.config.pasteIgnoreImg = false;
        // 使用 base64 保存图片
        //editor.config.uploadImgShowBase64 = true
        // 上传图片到服务器
        DATA.editEditor.config.uploadFileName = 'file'; //设置文件上传的参数名称
        DATA.editEditor.config.uploadVideoName = 'file'; //设置视频文件上传的参数名称
        // 上传视频服务器
        DATA.editEditor.config.uploadVideoServer = VIDEO_URL;
        // DATA.editEditor.config.uploadImgServer = IMG_URL; //设置上传文件的服务器路径
        DATA.editEditor.config.uploadImgHeaders = {
          Authorization: localStorage.getItem('Admin-Token'), // 设置请求头
        };
        DATA.editEditor.config.uploadVideoHeaders = {
          Authorization: localStorage.getItem('Admin-Token'), // 设置请求头
        };
        DATA.editEditor.config.uploadImgMaxSize = 10 * 1024 * 1024; // 将图片大小限制为 3M
        DATA.editEditor.config.uploadImgMaxLength = 5;
        // 上传视频回调
        DATA.editEditor.config.uploadVideoHooks = {
          // 上传视频之前
          before: function (xhr: any) {
            // console.log(xhr);
            // 可阻止视频上传
            // return {
            //   prevent: true,
            //   msg: '需要提示给用户的错误信息',
            // };
          },
          // 视频上传并返回了结果，视频插入已成功
          success: function (xhr: any) {
            // console.log('success', xhr);
          },
          // 视频上传并返回了结果，但视频插入时出错了
          fail: function (xhr: any, editor: any, resData: any) {
            // console.log('fail', resData);
          },
          // 上传视频出错，一般为 http 请求的错误
          error: function (xhr: any, editor: any, resData: any) {
            // console.log('error', xhr, resData);
          },
          // 上传视频超时
          timeout: function (xhr: any) {
            // console.log('timeout');
          },
          // 视频上传并返回了结果，想要自己把视频插入到编辑器中
          // 例如服务器端返回的不是 { errno: 0, data: { url : '.....'} } 这种格式，可使用 customInsert
          customInsert: function (insertVideoFn: any, result: any) {
            // result 即服务端返回的接口
            // console.log('customInsert', result);

            // insertVideoFn 可把视频插入到编辑器，传入视频 src ，执行函数即可
            insertVideoFn(IMG_File + result.data);
          },
        };
        // DATA.editEditor.config.uploadImgHooks = {
        //   success: function (xhr: any, editor: any, result: any) {
        //     // console.log('result: ', result);
        //     // 图片上传并返回结果，图片插入成功之后触发
        //     // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象，result 是服务器端返回的结果
        //   },
        //   fail: function (xhr: any, editor: any, result: any) {
        //     // 图片上传并返回结果，但图片插入错误时触发
        //     // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象，result 是服务器端返回的结果
        //   },
        //   error: function (xhr: any, editor: any) {
        //     // console.log('editor: ', editor);
        //     // 图片上传出错时触发
        //     // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象
        //   },
        //   // 例如服务器端返回的不是 { errno: 0, data: [...] } 这种格式，可使用 customInsert
        //   customInsert: function (insertImgFn: any, result: any) {
        //     // result 即服务端返回的接口
        //     // console.log('customInsert', result);

        //     // insertImgFn 可把图片插入到编辑器，传入图片 src ，执行函数即可
        //     insertImgFn(IMG_File + result.data);
        //   },
        // };
        DATA.editEditor.config.customUploadImg = function (
          resultFilesa: any,
          insertImgFn: any
        ) {
          multiUpload(resultFilesa).then(({ data }) => {
            data.data.forEach((item: any) => {
              // insertImgFn 是获取图片 url 后，插入到编辑器的方法
              // 上传图片，返回结果，将图片插入到编辑器中
              insertImgFn(item);
            });
          });
        };
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
#wangEdit {
  width: 1200px;
  height: auto;
  box-sizing: border-box;
  font-size: 16px;
  & /deep/ .w-e-text-container {
    height: 600px !important;
  }
  & /deep/ .w-e-text::-webkit-scrollbar {
    width: 0;
  }
}
#editWangEdit {
  width: 1200px;
  height: auto;
  box-sizing: border-box;
  font-size: 16px;
  & /deep/ .w-e-text-container {
    height: 600px !important;
  }
  & /deep/ .w-e-text::-webkit-scrollbar {
    width: 0;
  }
}
.el-breadcrumb {
  margin-bottom: 10px;
}
</style>
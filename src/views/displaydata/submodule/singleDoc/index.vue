<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item>{{formatName(ROUTE.query.parentId,sessionRead("PARENMODULE"))}}</el-breadcrumb-item>
      <el-breadcrumb-item>{{formatName(ROUTE.query.id,sessionRead("SUBMODULE"))}}</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card
      class="box-card"
      v-loading="loading"
    >
      <template #header>
        <div class="card-header d_flex d_flex_sb">
          <span>单文档管理</span>
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
        :rules="formRoules"
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
          <div id="wangEdit"> </div>
        </template>
      </ele-form>
    </el-card>
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
import ElePagination from '@/components/elePagination/index.vue';
import E from 'wangeditor';
import { useRoute } from 'vue-router';
import {
  createMedia,
  getAllMedia,
  getMediaByTypePage,
  updateMedia,
} from '@/api/displaydata/media';
import {
  IMG_File,
  IMG_MULTI_URL,
  IMG_URL,
  multiUpload,
  RES_SUCCESS,
  sessionRead,
  sessionWrite,
  VIDEO_URL,
} from '@/api/common/common';
import { ElMessage } from 'element-plus/lib';
import { getGlobalModule } from '@/api/displaydata/parenModule';
import axios from 'axios';
import { getToken } from '@/utils/auth';
export default defineComponent({
  components: {
    EleForm,
    EleUpload,
    ElePagination,
  },
  setup() {
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    // 获取路由实例
    const ROUTE = useRoute();
    // 创建富文本
    const editor: any = new E('#wangEdit');
    let DATA: any = reactive({
      pagingObj: {
        limit: 10,
        page: 1,
        subModuleId: '',
        type: '',
      },
      loading: false,
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
          prop: 'name',
          type: 'input',
        },
        {
          label: '标题图片',
          slotName: 'image',
          type: 'slot',
        },
        {
          label: '内容',
          slotName: 'wangEdit',
          type: 'slot',
        },
      ],
      formRoules: {
        name: [
          { required: true, message: '标题名称不能为空', trigger: 'blur' },
        ],
      },
      imageList: [],
      isCreate: false,
      idList: [],
      index: 0,
      myVideo: [],
    });
    let METHODS: any = reactive({
      // 分页获取表格数据
      handlePagingData: async () => {
        DATA.loading = true;
        let { data } = await getMediaByTypePage(DATA.pagingObj);
        if (data.code === RES_SUCCESS) {
          DATA.loading = false;
          if (data.data.records.length === 0) {
            DATA.isCreate = true;
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
            editor.txt.html('');
          } else {
            DATA.imageList = [];
            DATA.formData = data.data.records[0];
            data.data.records[0].multimedia &&
              DATA.imageList.push({
                url: IMG_File + data.data.records[0].multimedia,
              });
            data.data.records[0].htmlData !== null &&
              editor.txt.html(data.data.records[0].htmlData); // 重新设置编辑器内容
            DATA.isCreate = false;
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
        DATA.imageList = [];
        DATA.imageList.push({ url: IMG_File + res.data });
      },
      // 图片移除成功
      uploadRemove: (res: any) => {
        DATA.formData.multimedia = '';
      },
      // 添加、编辑保存
      handleSave: () => {
        DATA.formData.htmlData = editor.txt.html();
        DATA.formData.plainText = editor.txt.text();
        if (DATA.isCreate) {
          proxy.$refs['formRef'].submitForm().then((res: boolean) => {
            if (res) {
              createMedia(DATA.formData).then(({ data }) => {
                if (data.code === RES_SUCCESS) {
                  ElMessage({
                    message: '添加文档成功',
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
                    message: '编辑文档成功',
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
      initEditor: () => {
        //开启debug模式
        // editor.config.debug = true;
        // 关闭粘贴内容中的样式
        editor.config.pasteFilterStyle = false;
        // 忽略粘贴内容中的图片
        editor.config.pasteIgnoreImg = false;
        // 使用 base64 保存图片
        //editor.config.uploadImgShowBase64 = true
        // 上传图片到服务器
        editor.config.uploadFileName = 'file'; //设置文件上传的参数名称
        editor.config.uploadVideoName = 'file'; //设置视频文件上传的参数名称
        // 上传视频服务器
        editor.config.uploadVideoServer = VIDEO_URL;
        // editor.config.uploadImgServer = IMG_MULTI_URL; //设置上传文件的服务器路径
        editor.config.uploadImgHeaders = {
          Authorization: localStorage.getItem('Admin-Token'), // 设置请求头
        };
        editor.config.uploadVideoHeaders = {
          Authorization: localStorage.getItem('Admin-Token'), // 设置请求头
        };
        editor.config.uploadImgMaxSize = 10 * 1024 * 1024; // 将图片大小限制为 3M
        editor.config.uploadImgMaxLength = 5;
        // 上传视频回调
        editor.config.uploadVideoHooks = {
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
            DATA.index++;
            if (result.data.match(/.m3u8/) === null) {
              // insertVideoFn 可把视频插入到编辑器，传入视频 src ，执行函数即可
              // result 即服务端返回的接口
              insertVideoFn(IMG_File + result.data);
            } else {
              editor.txt.append(`
              <video
                id="video${DATA.index}"
                class="video-js vjs-default-skin"
                controls
                style="width: 300px;height: 200px;"
              >
                <source
                  src="${IMG_File + result.data}"
                  type="application/x-mpegURL"
                >
              </video>`);
              nextTick(() => {
                setTimeout(() => {
                  METHODS.initVideo(DATA.index);
                }, 1000);
              });
            }
          },
        };
        // editor.config.uploadImgHooks = {
        //   // 上传图片之前
        //   before: function (xhr: any) {
        //     console.log(xhr);
        //   },
        //   success: function (xhr: any, editor: any, result: any) {
        //     // console.log('result: ', result);
        //     // 图片上传并返回结果，图片插入成功之后触发
        //     // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象，result 是服务器端返回的结果
        //   },
        //   fail: function (xhr: any, editor: any, result: any) {
        //     console.log('result: ', result);
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
        //     console.log('customInsert', result);

        //     // insertImgFn 可把图片插入到编辑器，传入图片 src ，执行函数即可
        //     // insertImgFn(IMG_File + result.data);
        //   },
        // };
        editor.config.customUploadImg = function (
          resultFilesa: any,
          insertImgFn: any
        ) {
          // resultFiles 是 input 中选中的文件列表
          // console.log('resultFilesa: ', resultFilesa);
          // let files = new FormData();
          // if (resultFilesa.length > 0) {
          //   resultFilesa.forEach((item: any) => {
          //     files.append('files', item);
          //   });
          // }
          // let config = {
          //   headers: {
          //     Authorization: getToken(),
          //     'content-type': 'multipart/form-data',
          //   },
          // };
          // axios.post(IMG_MULTI_URL, files, config).then(({ data }) => {
          //   if (data.code === RES_SUCCESS && data.data.length > 0) {
          //     data.data.forEach((item: any) => {
          //       // insertImgFn 是获取图片 url 后，插入到编辑器的方法
          //       // 上传图片，返回结果，将图片插入到编辑器中
          //       insertImgFn(item);
          //     });
          //   }
          // });

          multiUpload(resultFilesa).then(({ data }) => {
            data.data.forEach((item: any) => {
              // insertImgFn 是获取图片 url 后，插入到编辑器的方法
              // 上传图片，返回结果，将图片插入到编辑器中
              insertImgFn(item);
            });
          });
        };
      },
      initVideo(index: number) {
        //初始化视频方法
        nextTick(() => {
          proxy.$video(`video${index}`, {
            bigPlayButton: false,
            textTrackDisplay: false,
            posterImage: true,
            errorDisplay: false,
            controlBar: true,
          });
          // .play();
        });
      },
    });
    onMounted(() => {
      DATA.pagingObj.subModuleId = ROUTE.query.id;
      DATA.pagingObj.type = ROUTE.query.type;
      METHODS.handlePagingData();
      METHODS.initEditor();
      editor.create();
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
.video-js {
  width: 300px;
  height: 200px;
}
</style>
<template>
  <div class="carousel_container">
    <div class="carousel_container_head">
      <el-button
        type="primary"
        @click="handleCreatePhoto"
      >添加图片</el-button>
    </div>
    <div class="carousel_container_body">
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
    <!-- 添加图片模态框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogFormVisible"
    >
      <ele-form
        :formData="carouselPictures"
        :renderFormArr="renderFormArr"
      >
        <template #image>
          <div>
            <EleUpload
              @uploadSuccess="uploadSuccess"
              ref="uploadRef"
              :imageList="imageList"
              @uploadRemove="uploadRemove"
            />
          </div>
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
  onMounted,
  reactive,
  toRefs,
} from 'vue';
import {
  pagingCarouselPictures,
  createCarouselPictures,
  deleteCarouselPictures,
  enablePictures,
} from '@/api/homePagment/amazingCarousel';
import { IMG_File, RES_SUCCESS } from '@/api/common/common';
import EleTable from '@/components/eleTable/index.vue';
import EleForm from '@/components/eleForm/index.vue';
import EleUpload from '@/components/eleUpload/index.vue';
import ElePagination from '@/components/elePagination/index.vue';
import { ElMessage } from 'element-plus/lib';
import { setOrderCarouselPictures } from '@/api/homePagment/amazingCarousel';
export default defineComponent({
  components: {
    EleForm,
    EleTable,
    EleUpload,
    ElePagination,
  },
  setup() {
    // 获取vue实例对象
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
          label: '图片',
          type: 'image',
          prop: 'image',
        },
        {
          label: '权重',
          type: 'tag',
          prop: 'sort',
          formatter: (row: any) => {
            let obj = {
              tagType: 'success',
              text: '',
            };
            if (row.sort === null) {
              obj.text = '无';
            } else {
              obj.text = row.sort;
            }
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
          type: 'primary',
          handleType: 'edit',
        },
        {
          text: '删除',
          type: 'danger',
          handleType: 'delete',
        },
      ],
      loading: false,
      total: 0,
      dialogFormVisible: false,
      dialogTitle: '',
      carouselPictures: {
        image: '',
        isEnable: true,
        sort: 0,
      },
      renderFormArr: [
        {
          label: '图片',
          type: 'slot',
          slotName: 'image',
        },
        {
          label: '权重',
          type: 'input',
          prop: 'sort',
        },
      ],
      imageList: [],
      isCreate: false,
    });
    let METHODS: any = reactive({
      // 分页获取轮播图
      handlePagingCarousel: async () => {
        DATA.loading = true;
        let { data } = await pagingCarouselPictures(DATA.pagingObj);
        if (data.code === RES_SUCCESS) {
          DATA.loading = false;
          DATA.tableData = data.data.records;
          DATA.total = data.data.total;
        }
      },
      // 点击添加图片
      handleCreatePhoto: () => {
        DATA.dialogFormVisible = true;
        DATA.imageList = [];
        DATA.isCreate = true;
        DATA.dialogTitle = '添加图片';
        DATA.carouselPictures = Object.assign(
          {},
          { image: '', isEnable: true, sort: 0 }
        );
      },
      // 确认添加图片
      handleConfirm: async () => {
        if (!DATA.carouselPictures.image) {
          ElMessage({
            type: 'warning',
            message: '请上传图片',
            customClass: 'message-override',
          });
          return;
        }
        if (DATA.isCreate) {
          let { data } = await createCarouselPictures(DATA.carouselPictures);
          if (data.code === RES_SUCCESS) {
            ElMessage({
              type: 'success',
              message: '添加成功',
            });
            DATA.dialogFormVisible = false;
            METHODS.handlePagingCarousel();
          }
        } else {
          delete DATA.carouselPictures.createTime;
          delete DATA.carouselPictures.updateTime;
          let { data } = await setOrderCarouselPictures(DATA.carouselPictures);
          if (data.code === RES_SUCCESS) {
            ElMessage({
              type: 'success',
              message: '编辑成功',
            });
            DATA.dialogFormVisible = false;
            METHODS.handlePagingCarousel();
          }
        }
      },
      uploadSuccess: ({ data }: any) => {
        DATA.carouselPictures.image = data;
      },
      // 操作按钮
      handleBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case 'edit':
            DATA.dialogFormVisible = true;
            DATA.imageList = [];
            row.image && DATA.imageList.push({ url: IMG_File + row.image });
            DATA.isCreate = false;
            DATA.dialogTitle = '编辑图片';
            DATA.carouselPictures = Object.assign({}, row);
            break;
          case 'delete':
            proxy
              .$confirm('是否确定删除该轮播图片', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              })
              .then(() => {
                deleteCarouselPictures({ id: row.id }).then(({ data }) => {
                  if (data.code === RES_SUCCESS) {
                    proxy.$message({
                      type: 'success',
                      message: '删除成功!',
                    });
                    METHODS.handlePagingCarousel();
                  } else {
                    proxy.$message({
                      type: 'error',
                      message: data.msg,
                    });
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
        METHODS.handlePagingCarousel();
      },
      // 修改表格当前页数
      handleCurrentChange: (val: number) => {
        DATA.pagingObj.page = val;
        METHODS.handlePagingCarousel();
      },
      // 切换switch
      handleEmitChange: async (val: any, item: any) => {
        let { data } = await enablePictures({ id: val.id });
        if (data.code === RES_SUCCESS) {
          if (val.isEnable) {
            ElMessage.success({
              message: '启用成功',
              type: 'success',
            });
          } else {
            ElMessage.success({
              message: '不启用成功',
              type: 'success',
            });
          }
        }
      },
      // 移除图片
      uploadRemove: () => {
        DATA.carouselPictures.image = null;
      },
    });
    onMounted(() => {
      METHODS.handlePagingCarousel();
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
<template>
  <el-pagination
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
    :current-page="currentPage"
    :page-sizes="[10, 20, 30, 50]"
    :page-size="size"
    layout="total, sizes, prev, pager, next, jumper"
    :total="total"
    class="pagination"
  >
  </el-pagination>
</template>
<script lang="ts">
import { defineComponent, getCurrentInstance, reactive, toRefs } from 'vue';
export default defineComponent({
  props: {
    total: {
      type: Number,
      default: 0,
    },
  },
  setup(props, { emit }) {
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    let DATA: any = reactive({
      currentPage: 1,
      size: 10,
    });
    let METHODS: any = reactive({
      handleSizeChange: (val: any) => {
        DATA.size = val;
        emit('handleSizeChange', val);
      },
      handleCurrentChange: (val: any) => {
        DATA.currmentPage = val;
        emit('handleCurrentChange', val);
      },
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>
<style lang="scss" scoped>
.pagination {
  text-align: right;
  margin-top: 10px;
}
</style>

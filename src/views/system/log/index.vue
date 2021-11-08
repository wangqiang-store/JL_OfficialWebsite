<template>
  <div class="container">
    <div class="container_head d_flex">
      <el-input
        placeholder="请输入用户名/用户操作/用户IP"
        v-model="getPageObj.content"
        clearable
      ></el-input>
      <el-date-picker
        v-model="value"
        type="datetimerange"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :default-time="defaultTime"
        class="datePicker"
      >
      </el-date-picker>
      <el-button
        type="primary"
        @click="handleSearch"
      >搜索</el-button>
    </div>
    <text-table
      :tableData="tableData"
      :isborder="true"
      :renderTable="renderTable"
      v-loading="loading"
    ></text-table>
    <elementPagination
      :total="total"
      @handleSizeChange="handleSizeChange"
      @handleCurrentChange="handleCurrentChange"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, reactive, toRefs } from 'vue';
import { getLog } from '@/api/system/sysLog';
import { RES_SUCCESS, filterTime } from '@/api/common/common';
import textTable from '@/components/eleTable/index.vue';
import elementForm from '@/components/eleForm/index.vue';
import elementPagination from '@/components/elePagination/index.vue';
import { useRoute } from 'vue-router';
export default defineComponent({
  components: {
    textTable,
    elementForm,
    elementPagination,
  },
  setup() {
    const ROUTE = useRoute();
    let DATA: any = reactive({
      getPageObj: {
        content: '',
        endTime: undefined,
        limit: 10,
        page: 1,
        startTime: undefined,
      },
      total: 0,
      defaultTime: [new Date(2000, 1, 1, 12, 0, 0)],
      value: '',
      tableData: [],
      renderTable: [
        {
          label: '序号',
          type: 'text',
          fixed: 'left',
          formatter: (row: any, column: any, cellValue: any, index: any) => {
            return index + 1;
          },
        },
        {
          label: '用户名',
          type: 'text',
          prop: 'username',
        },
        {
          label: '用户操作',
          type: 'text',
          prop: 'operation',
        },
        {
          label: '用户IP',
          type: 'text',
          prop: 'ip',
        },
        {
          label: '操作时间',
          type: 'text',
          prop: 'createTime',
          formatter: (row: any) => {
            return filterTime(row.createTime);
          },
        },
      ],
      isSearchBtn: false,
      loading: false,
    });
    let METHODS: any = reactive({
      handelGetLog: async () => {
        DATA.loading = true;
        let { data }: any = await getLog(DATA.getPageObj);
        if (data.code === RES_SUCCESS) {
          DATA.loading = false;
          DATA.total = data.data.total;
          DATA.tableData = data.data.records;
        }
      },
      handleSearch: () => {
        if (DATA.value != null && DATA.value.length > 0) {
          DATA.getPageObj.startTime !== null &&
            (DATA.getPageObj.startTime = filterTime(DATA.value[0], '/'));
          DATA.getPageObj.endTime !== null &&
            (DATA.getPageObj.endTime = filterTime(DATA.value[1], '/'));
        } else {
          DATA.getPageObj.startTime = null;
          DATA.getPageObj.endTime = null;
        }
        METHODS.handelGetLog();
      },
      handleSizeChange: (val: any) => {
        var aggregate = DATA.getPageObj.page * DATA.getPageObj.limit;
        if (aggregate > DATA.total) {
          aggregate = DATA.total;
        }
        DATA.getPageObj.limit = val;
        var size = Math.ceil(aggregate / DATA.getPageObj.limit);
        if (size <= 0) {
          DATA.getPageObj.page = 1;
        } else {
          DATA.getPageObj.page = size;
        }
        METHODS.handelGetLog();
      },
      handleCurrentChange: (val: any) => {
        DATA.getPageObj.page = val;
        METHODS.handelGetLog();
      },
    });
    onMounted(() => {
      METHODS.handelGetLog();
      if (ROUTE.meta.children) {
        METHODS.customButton(ROUTE.meta.children);
      }
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>
<style lang="scss" scoped>
.container {
  margin-top: 30px;
  .container_head {
    width: 600px;
    .el-input {
      margin-right: 10px;
    }
    .el-button {
      margin-left: 10px;
    }
    .el-date-editor {
      width: 200px;
    }
  }
}
</style>
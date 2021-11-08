<template>
  <div class="container">
    <div class="d_flex container_header">
      <el-input
        placeholder="请输入角色名称"
        v-model="searchRoleObj.content"
        class="container_header_input"
        clearable
      ></el-input>
      <el-button
        type="primary"
        @click="handleSearch"
      >搜索</el-button>
      <el-button
        type="primary"
        @click="handleAddRole"
      >添加</el-button>
    </div>
    <div class="contriner_body">
      <textTable
        :tableData="enableRoleArr"
        :renderTable="renderTable"
        :btnArr="btnArr"
        :isborder="true"
        @handleBtnEvent="handleBtnEvent"
        @handleEmitChange="handleEmitChange"
        v-loading="loading"
      ></textTable>
      <elementPagination
        :total="total"
        @handleSizeChange="handleSizeChange"
        @handleCurrentChange="handleCurrentChange"
      />
    </div>
    <!-- 添加、编辑模态框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogFormVisible"
    >
      <elementForm
        :renderFormArr="renderFormArr"
        :formData="roleFormObj"
        :rules="roleRules"
        :labelWidth="120"
        :refForm="'refForm'"
        ref="refForm"
      ></elementForm>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button
            type="primary"
            @click="handleConfirmRole"
          >确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 权限模态框 -->
    <el-dialog
      title="权限管理"
      v-model="dialogAuthVisible"
      @close="handleClose"
    >
      <el-tree
        :data="authTreeArr"
        show-checkbox
        node-key="id"
        :props="defaultProps"
        ref="treeRef"
        :default-checked-keys="checkedArr"
        v-if="isCheck"
      >
      </el-tree>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogAuthVisible = false">取 消</el-button>
          <el-button
            type="primary"
            @click="handleConfirmAuth"
            :loading="authLoading"
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
  onMounted,
  getCurrentInstance,
  nextTick,
  inject,
} from 'vue';
import textTable from '@/components/eleTable/index.vue';
import { useStore } from 'vuex';
import {
  localWrite,
  RES_SUCCESS,
  sessionRead,
  sessionWrite,
} from '@/api/common/common';
import {
  getSysRole,
  addRole,
  updateRole,
  getRoleModule,
  roleModuleAddDel,
  deleteRole,
  getEnableRole,
  getAllRole,
  enableRoleModule,
} from '@/api/system/sysRole';
import elementForm from '@/components/eleForm/index.vue';
import elementPagination from '@/components/elePagination/index.vue';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import { getAllModule } from '@/api/system/sysModule';

export default defineComponent({
  components: {
    elementForm,
    textTable,
    elementPagination,
  },
  setup() {
    // 获取Store实例
    const STORE = useStore();
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    const ROUTE = useRoute();
    // 检测角色名称 重复
    const validateRepeatRole = (rule: any, value: string, callback: any) => {
      if (!DATA.isAdd) {
        value === DATA.roleFormObj.name && callback();
      }
      sessionRead('ALLROLES').forEach((item: any) => {
        item.name === value && callback(new Error('已存在该角色名称'));
      });
      callback();
    };
    let DATA: any = reactive({
      searchRoleObj: {
        content: '',
        limit: 10,
        page: 1,
      },
      // 角色数组
      enableRoleArr: [],
      // 渲染表格
      renderTable: [
        {
          label: '序号',
          type: 'text',
          formatter: (row: any, columna: any, cellValue: any, index: any) => {
            return index + 1;
          },
        },
        {
          type: 'text',
          prop: 'name',
          label: '角色名称',
        },
        {
          type: 'switch',
          prop: 'isEnable',
          label: '是否启用',
        },
        {
          type: 'text',
          prop: 'remark',
          label: '备注',
        },
        {
          type: 'handle',
          label: '操作',
          width: 400,
        },
      ],
      btnArr: [
        {
          type: 'primary',
          text: '编辑',
          handleType: 'edit',
        },
        {
          type: 'warning',
          text: '权限配置',
          handleType: 'auth',
        },
      ],
      loading: true,
      total: 0,
      // 角色表单数据
      roleFormObj: {
        createId: '',
        createName: '',
        createTime: null,
        id: '',
        isEnable: true,
        name: '',
        remark: '',
        updateTime: null,
      },
      // 渲染表单
      renderFormArr: [
        {
          label: '角色名称',
          type: 'input',
          prop: 'name',
        },
        {
          label: '备注',
          type: 'input',
          prop: 'remark',
        },
        {
          label: '是否启用',
          type: 'switch',
          prop: 'isEnable',
        },
      ],
      roleRules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { validator: validateRepeatRole, trigger: 'blur' },
        ],
        remark: [
          { required: true, message: '请输入备注信息', trigger: 'blur' },
        ],
      },
      // 控制角色表单显示隐藏
      dialogFormVisible: false,
      dialogTitle: '',
      // 分辨用户点击的是添加还是编辑
      isAdd: false,
      // 控制权限管理模态框显示隐藏
      dialogAuthVisible: false,
      defaultProps: {
        children: 'children',
        label: 'label',
      },
      authTreeArr: [],
      selectedAuthArr: [],
      // 选择权限数组
      checkedArr: [],
      isCheck: false,
      changeCheckedArr: [],
      roleModuleAddDel: {
        addList: [],
        delList: [],
        roleId: '',
      },
      allModule: [],
      // 一级菜单id
      firstMenuIdList: [],
      // 二级菜单id
      twoMenuIdList: [],
      // 半选中数组
      getHalfCheckedKeys: [],
      authLoading: false,
      isCreateBtn: false,
      isSearchBtn: false,
      isTwoMenuID: [],
      confirmTwoMenuID: [],
      allModuleList: [],
    });
    let METHODS: any = reactive({
      getEnableRole: async () => {
        DATA.loading = true;
        let { data } = await getSysRole(DATA.searchRoleObj);
        if (data.code === RES_SUCCESS) {
          DATA.enableRoleArr = data.data.records;
          DATA.loading = false;
          DATA.total = data.data.total;
        }
      },
      // 获取所有可用角色
      getAllEnableRole: async () => {
        let { data }: any = await getEnableRole();
        if (data.code === RES_SUCCESS) {
          STORE.commit('SET_ROLES', data.data);
          sessionWrite('ROLES', data.data);
        }
      },
      // 获取所有角色
      getAllRole: async () => {
        let { data }: any = await getAllRole();
        data.data.forEach((item: any) => {
          if (!item.isEnable) {
            item.disabled = true;
          }
        });
        if (data.code === RES_SUCCESS) {
          sessionWrite('ALLROLES', data.data);
        }
      },
      // 获取角色模块
      getRoleModule: async (id: any) => {
        DATA.checkedArr = [];
        DATA.isTwoMenuID = [];
        let { data } = await getRoleModule(id);
        if (data.code === RES_SUCCESS) {
          DATA.isCheck = true;
          data.data.forEach((item: any) => {
            if (!DATA.firstMenuIdList.includes(item.moduleId))
              DATA.checkedArr.push(item.moduleId);
          });
          nextTick(() => {
            DATA.selectedAuthArr = proxy.$refs['treeRef'].getCheckedKeys();
            DATA.getHalfCheckedKeys = proxy.$refs[
              'treeRef'
            ].getHalfCheckedKeys();
            if (DATA.getHalfCheckedKeys.length > 0) {
              DATA.getHalfCheckedKeys.forEach((item: any) => {
                DATA.twoMenuIdList.includes(item) &&
                  DATA.isTwoMenuID.push(item);
              });
            }
          });
        }
      },
      handleSizeChange: (val: any) => {
        DATA.searchRoleObj.limit = val;
        METHODS.getEnableRole();
      },
      handleCurrentChange: (val: any) => {
        DATA.searchRoleObj.page = val;
        METHODS.getEnableRole();
      },
      // 关键字搜索角色
      handleSearch: () => {
        METHODS.getEnableRole();
      },
      // 添加角色
      handleAddRole: () => {
        DATA.dialogFormVisible = true;
        DATA.isAdd = true;
        DATA.roleFormObj = Object.assign(
          {},
          {
            createId: '',
            createName: '',
            createTime: null,
            id: '',
            isEnable: true,
            name: '',
            remark: '',
            updateTime: null,
          }
        );
        DATA.dialogTitle = '添加角色';
        nextTick(() => {
          proxy.$refs['refForm'].clearForm();
        });
      },
      // 确认添加角色
      handleConfirmRole: () => {
        delete DATA.roleFormObj.createTime;
        delete DATA.roleFormObj.updateTime;
        if (DATA.isAdd) {
          console.log(2);
          proxy.$refs['refForm'].submitForm().then((res: any) => {
            if (res) {
              console.log(1);
              addRole(DATA.roleFormObj).then(({ data }: any) => {
                if (data.code === RES_SUCCESS) {
                  ElMessage.success({
                    message: '角色添加成功',
                    type: 'success',
                  });
                  DATA.dialogFormVisible = false;
                  METHODS.getEnableRole();
                  METHODS.getAllEnableRole();
                  METHODS.getAllRole();
                }
              });
            }
          });
        } else {
          proxy.$refs['refForm'].submitForm().then((res: any) => {
            if (res) {
              updateRole(DATA.roleFormObj).then(({ data }: any) => {
                if (data.code === RES_SUCCESS) {
                  ElMessage.success({
                    message: '角色编辑成功',
                    type: 'success',
                  });
                  DATA.dialogFormVisible = false;
                  METHODS.getEnableRole();
                  METHODS.getAllEnableRole();
                  METHODS.getAllRole();
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
            DATA.roleFormObj = Object.assign({}, row);
            DATA.dialogFormVisible = true;
            DATA.dialogTitle = '编辑角色';
            DATA.isAdd = false;
            nextTick(() => {
              proxy.$refs['refForm'].clearForm();
            });
            break;
          case 'auth':
            DATA.roleModuleAddDel.roleId = row.id;
            METHODS.getRoleModule(row.id);
            DATA.authTreeArr = [];
            DATA.authTreeArr = METHODS.filtersAuthTreeArr(
              DATA.authTreeArr,
              DATA.allModuleList
            );
            DATA.dialogAuthVisible = true;
            break;
          default:
            break;
        }
      },
      // 确认权限模块
      handleConfirmAuth: async () => {
        DATA.roleModuleAddDel.addList = [];
        DATA.roleModuleAddDel.delList = [];
        DATA.changeCheckedArr = proxy.$refs['treeRef'].getCheckedKeys();
        DATA.changeCheckedArr.forEach((item: any) => {
          if (DATA.selectedAuthArr.indexOf(item) === -1) {
            DATA.roleModuleAddDel.addList.push(item);
          }
        });
        DATA.selectedAuthArr.forEach((item: any) => {
          if (DATA.changeCheckedArr.indexOf(item) === -1) {
            DATA.roleModuleAddDel.delList.push(item);
          }
        });
        DATA.firstMenuIdList.forEach((item: any) => {
          if (DATA.roleModuleAddDel.addList.indexOf(item) != -1) {
            DATA.roleModuleAddDel.addList.splice(
              DATA.roleModuleAddDel.addList.indexOf(item),
              1
            );
          }
        });
        DATA.firstMenuIdList.forEach((item: any) => {
          if (DATA.roleModuleAddDel.delList.indexOf(item) != -1) {
            DATA.roleModuleAddDel.delList.splice(
              DATA.roleModuleAddDel.delList.indexOf(item),
              1
            );
          }
        });
        DATA.getHalfCheckedKeys.forEach((item: any) => {
          if (DATA.roleModuleAddDel.addList.indexOf(item) != -1) {
            DATA.roleModuleAddDel.addList.splice(
              DATA.roleModuleAddDel.addList.indexOf(item),
              1
            );
          }
        });
        if (DATA.isTwoMenuID.length > 0) {
          DATA.isTwoMenuID.forEach((item: any) => {
            if (!proxy.$refs['treeRef'].getHalfCheckedKeys().includes(item)) {
              if (DATA.changeCheckedArr.includes(item)) {
                DATA.confirmTwoMenuID.push(item);
              } else {
                DATA.roleModuleAddDel.delList.push(item);
              }
            }
          });
        }
        proxy.$refs['treeRef'].getHalfCheckedKeys().forEach((item: any) => {
          if (!DATA.isTwoMenuID.includes(item)) {
            if (DATA.selectedAuthArr.includes(item)) {
              DATA.confirmTwoMenuID.push(item);
            } else {
              DATA.twoMenuIdList.includes(item) &&
                DATA.roleModuleAddDel.addList.push(item);
            }
          }
        });
        if (DATA.confirmTwoMenuID.length > 0) {
          DATA.getHalfCheckedKeys = proxy.$refs['treeRef']
            .getHalfCheckedKeys()
            .concat(DATA.confirmTwoMenuID);
        } else {
          DATA.getHalfCheckedKeys = proxy.$refs['treeRef'].getHalfCheckedKeys();
        }
        DATA.getHalfCheckedKeys.forEach((item: any) => {
          if (DATA.roleModuleAddDel.delList.indexOf(item) != -1) {
            DATA.roleModuleAddDel.delList.splice(
              DATA.roleModuleAddDel.delList.indexOf(item),
              1
            );
          }
        });
        DATA.authLoading = true;
        let { data } = await roleModuleAddDel(DATA.roleModuleAddDel);
        if (data.code === RES_SUCCESS) {
          ElMessage.success({
            message: '编辑成功',
            type: 'success',
          });
          DATA.dialogAuthVisible = false;
          DATA.authLoading = false;
          history.go(0);
        }
      },
      // switch
      handleEmitChange: async (val: any) => {
        let { data } = await enableRoleModule({ roleId: val.id });
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
          METHODS.getAllEnableRole();
          METHODS.getAllRole();
        }
      },
      // 自定义生成树状权限数据
      filtersAuthTreeArr: (arr: any, data: any) => {
        data.forEach((item: any) => {
          let obj = {
            id: item.id,
            label: item.name,
            children: [],
          };
          if (item.children != undefined && item.children.length > 0) {
            METHODS.filtersAuthTreeArr(obj.children, item.children);
          }
          if (item.name != '首页') {
            arr.push(obj);
          }
        });
        return arr;
      },
      handleClose: () => {
        DATA.isCheck = false;
      },
      // 获取所有模块
      getModule: async () => {
        let { data } = await getAllModule();
        if (data.code === RES_SUCCESS) {
          DATA.allModuleList = data.data;
          // 获取一级菜单id数组
          DATA.allModuleList.forEach((item: any) => {
            DATA.firstMenuIdList.push(item.id);
          });
        }
      },
    });
    onMounted(() => {
      METHODS.getEnableRole();
      METHODS.getModule();
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
  .container_header {
    width: 400px;
    .container_header_input {
      margin-right: 10px;
    }
  }
  .contriner_body {
    margin-top: 10px;
  }
}
</style>

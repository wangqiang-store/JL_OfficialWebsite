<template>
  <div class="account_container">
    <div class="account_container_head d_flex">
      <el-input
        placeholder="用户名关键字"
        clearable
        v-model="pagingObj.content"
      ></el-input>
      <el-select
        v-model="pagingObj.roleId"
        placeholder="请选择角色"
        clearable
      >
        <el-option
          v-for="item in roleOptions"
          :key="item.value"
          :label="item.name"
          :value="item.id"
        >
        </el-option>
      </el-select>
      <el-button
        type="primary"
        @click="handleSearch"
      >搜索</el-button>
      <el-button
        type="primary"
        @click="handleCreateUser"
      >添加用户</el-button>
    </div>
    <div class="account_container_body">
      <ele-table
        :tableData="tableData"
        :renderTable="renderTable"
        :btnArr="btnArr"
        :isborder="true"
        v-loading="loading"
        @handleEmitChange="handleEmitChange"
        @handleBtnEvent="handleBtnEvent"
      ></ele-table>
      <ele-pagination
        :total="total"
        @handleSizeChange="handleSizeChange"
        @handleCurrentChange="handleCurrentChange"
      ></ele-pagination>
    </div>
    <!-- 添加模态框 -->
    <el-dialog
      title="添加"
      v-model="dialogAddFormVisible"
    >
      <ele-form
        :renderFormArr="renderAddFormArr"
        :formData="FormAddData"
        :rules="FormAddRules"
        :labelWidth="120"
        :options="options"
        :refForm="'addForm'"
        ref="addForm"
      ></ele-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogAddFormVisible = false">取 消</el-button>
          <el-button
            type="primary"
            @click="handleAddConfirmUser"
          >确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 编辑模态框 -->
    <el-dialog
      title="编辑"
      v-model="dialogEditFormVisible"
    >
      <ele-form
        :renderFormArr="renderEditFormArr"
        :formData="FormEditData"
        :rules="FormEditRules"
        :labelWidth="120"
        :options="options"
        :refForm="'addForm'"
        ref="addForm"
      ></ele-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogEditFormVisible = false">取 消</el-button>
          <el-button
            type="primary"
            @click="handleEditConfirmUser"
          >确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 详情 -->
    <el-dialog
      title="详情"
      v-model="dialogDetailsFormVisible"
    >
      <el-card>
        <ele-form
          :renderFormArr="renderDetailsFormArr"
          :formData="FormDetailsData"
          :labelWidth="120"
        ></ele-form>
      </el-card>
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
  selectAllUser,
  getAllUser,
  checkRepeat,
  addUser,
  editUser,
  resetPassword,
  enableUser,
} from '@/api/system/sysUser';
import { getAllRole, getEnableRole } from '@/api/system/sysRole';
import { RES_SUCCESS } from '@/api/common/common';
import md5 from 'js-md5';
import {
  validateChinese,
  validateEmail,
  validatePhone,
  validatePwd,
} from '@/api/common/validRules';
import { ElMessage } from 'element-plus/lib';
export default defineComponent({
  components: {
    EleTable,
    EleForm,
    ElePagination,
  },
  setup() {
    // 获取vue实例对象
    const { proxy }: any = getCurrentInstance();
    // 检查用户名
    let validateUsername = async (rule: any, value: any, callback: any) => {
      let reg = /[\u4e00-\u9fa5]/g;
      if (reg.test(value.trim())) {
        callback(new Error('用户名不能是中文'));
      }
      if (value === DATA.username) {
        callback();
      } else {
        let { data } = await checkRepeat({ username: value });
        if (data.code === 500) {
          callback(new Error('用户名重复'));
        } else {
          callback();
        }
      }
    };
    // 确认密码
    let validateConfirmPwd = (rule: any, value: any, callback: any) => {
      if (value === DATA.FormAddData.password) {
        callback();
      } else {
        callback(new Error('密码输入错误'));
      }
    };
    let DATA: any = reactive({
      pagingObj: {
        content: '',
        limit: 10,
        page: 1,
        roleId: '',
      },
      roleOptions: [],
      // 表格数据
      tableData: [],
      // 渲染表格数据
      renderTable: [
        {
          label: '序号',
          type: 'text',
          formatter: (row: any, columna: any, cellValue: any, index: any) => {
            return index + 1;
          },
        },
        {
          label: '用户名',
          prop: 'username',
          type: 'text',
        },
        {
          label: '名称',
          prop: 'name',
          type: 'text',
        },
        {
          label: '角色',
          prop: 'roleId',
          type: 'tag',
          formatter: (row: any) => {
            let val = {
              text: '',
              tagType: '',
            };
            DATA.roleOptions.forEach((item: any) => {
              if (row.roleId == item.id) {
                val.text = item.name;
              }
            });
            return val;
          },
        },
        {
          label: '是否启用',
          prop: 'isEnable',
          type: 'switch',
        },
        {
          label: '创建者',
          prop: 'createId',
          type: 'text',
          formatter: (row: any) => {
            let createName = '';
            DATA.userList.forEach((item: any) => {
              if (item.id === row.createId) {
                createName = item.username;
              }
            });
            return createName;
          },
        },
        {
          label: '操作',
          type: 'handle',
          width: '300',
        },
      ],
      // 操作按钮
      btnArr: [
        {
          text: '详情',
          handleType: 'info',
          type: 'primary',
        },
        {
          text: '编辑',
          handleType: 'edit',
          type: 'primary',
        },
        {
          text: '重置密码',
          handleType: 'resetPwd',
          type: 'warning',
        },
      ],
      loading: false,
      total: 0,
      userList: [],
      // 添加
      dialogAddFormVisible: false,
      renderAddFormArr: [
        {
          label: '用户名',
          prop: 'username',
          type: 'input',
        },
        {
          label: '名称',
          prop: 'name',
          type: 'input',
        },
        {
          label: '密码',
          prop: 'password',
          type: 'input',
          inputType: 'password',
        },
        {
          label: '确认密码',
          prop: 'confirmPwd',
          type: 'input',
          inputType: 'password',
        },
        {
          label: '角色',
          prop: 'roleId',
          type: 'select',
          title: 'name',
          value: 'id',
        },
        {
          label: '邮箱',
          prop: 'email',
          type: 'input',
        },
        {
          label: '联系方式',
          prop: 'phone',
          type: 'input',
        },
        {
          label: '是否启用',
          prop: 'isEnable',
          type: 'switch',
        },
      ],
      FormAddData: {
        createId: '',
        createTime: '',
        email: '',
        id: '',
        isEnable: true,
        name: '',
        password: '',
        phone: '',
        roleId: '',
        updateTime: '',
        username: '',
        confirmPwd: '',
      },
      FormAddRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { validator: validateUsername, trigger: 'blur' },
        ],
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { validator: validateChinese, trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { validator: validatePwd, trigger: 'blur' },
        ],
        confirmPwd: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { validator: validateConfirmPwd, trigger: 'blur' },
        ],
        phone: [
          { message: '请输入电话', trigger: 'blur' },
          { validator: validatePhone, trigger: 'blur' },
        ],
        email: [
          { message: '请输入邮箱', trigger: 'blur' },
          { validator: validateEmail, trigger: 'blur' },
        ],
        roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
      },
      options: {},
      // 编辑
      dialogEditFormVisible: false,
      renderEditFormArr: [
        {
          label: '用户名',
          prop: 'username',
          type: 'input',
        },
        {
          label: '名称',
          prop: 'name',
          type: 'input',
        },
        {
          label: '角色',
          prop: 'roleId',
          type: 'select',
          title: 'name',
          value: 'id',
        },
        {
          label: '邮箱',
          prop: 'email',
          type: 'input',
        },
        {
          label: '联系方式',
          prop: 'phone',
          type: 'input',
        },
      ],
      FormEditData: {
        createId: '',
        createTime: '',
        email: '',
        id: '',
        isEnable: true,
        name: '',
        phone: '',
        roleId: '',
        updateTime: '',
        username: '',
      },
      FormEditRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { validator: validateUsername, trigger: 'blur' },
        ],
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { validator: validateChinese, trigger: 'blur' },
        ],
        phone: [
          { message: '请输入电话', trigger: 'blur' },
          { validator: validatePhone, trigger: 'blur' },
        ],
        email: [
          { message: '请输入邮箱', trigger: 'blur' },
          { validator: validateEmail, trigger: 'blur' },
        ],
        roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
      },
      // 详情
      dialogDetailsFormVisible: false,
      renderDetailsFormArr: [
        {
          label: '用户名',
          type: 'tag',
          prop: 'username',
          filter: (val: any) => {
            return val ? val : '请填写';
          },
        },
        {
          label: '角色',
          type: 'tag',
          prop: 'roleId',
          filter: (val: any) => {
            let role = '';
            DATA.roleOptions.forEach((item: any) => {
              if (item.id === val) {
                role = item.name;
              }
            });
            return role;
          },
        },
        {
          label: '名称',
          type: 'tag',
          prop: 'name',
          filter: (val: any) => {
            return val ? val : '请填写';
          },
        },
        {
          label: '邮箱',
          type: 'tag',
          prop: 'email',
          filter: (val: any) => {
            return val ? val : '请填写';
          },
        },
        {
          label: '联系方式',
          type: 'tag',
          prop: 'phone',
          filter: (val: any) => {
            return val ? val : '请填写';
          },
        },
        {
          label: '是否启用',
          type: 'tag',
          prop: 'isEnable',
          filter: (val: any) => {
            return val ? '启用' : '不启用';
          },
        },
      ],
      FormDetailsData: {},
      username: '',
    });
    let METHODS: any = reactive({
      // 分页获取账号
      handlePagingAccount: async () => {
        DATA.tableData = [];
        DATA.loading = true;
        let { data } = await getAllUser(DATA.pagingObj);
        if (data.code === RES_SUCCESS) {
          if (data.data.records != null) {
            data.data.records.forEach((item: any) => {
              item.sysUser != null && DATA.tableData.push(item.sysUser);
            });
          }
          DATA.total = data.data.total;
          DATA.loading = false;
        }
      },
      // 搜索
      handleSearch: () => {
        METHODS.handlePagingAccount();
      },
      // 添加用户
      handleCreateUser: () => {
        DATA.dialogAddFormVisible = true;
        DATA.FormAddData = Object.assign(
          {},
          {
            createId: '',
            createTime: '',
            email: '',
            id: '',
            isEnable: true,
            name: '',
            password: '',
            phone: '',
            roleId: '',
            updateTime: '',
            username: '',
            confirmPwd: '',
          }
        );
        DATA.username = '';
        nextTick(() => {
          proxy.$refs['addForm'].clearForm();
        });
      },
      // 获取所有角色
      handleGetAllRole: async () => {
        let { data } = await getAllRole();
        if (data.code === RES_SUCCESS) {
          DATA.roleOptions = data.data;
        }
      },
      // 获取启用角色
      handleGetEnableRole: async () => {
        let { data } = await getEnableRole();
        if (data.code === RES_SUCCESS) {
          DATA.options.roleId = data.data;
        }
      },
      // 获取所有用户
      handleGetAllUser: async () => {
        let { data } = await selectAllUser();
        if (data.code === RES_SUCCESS) {
          DATA.userList = data.data;
        }
      },
      // 确认添加用户
      handleAddConfirmUser: () => {
        delete DATA.FormAddData.createTime;
        delete DATA.FormAddData.updateTime;
        delete DATA.FormAddData.updatePwdTime;
        proxy.$refs['addForm'].submitForm().then((res: any) => {
          if (res) {
            DATA.FormAddData.password = md5(DATA.FormAddData.password);
            addUser(DATA.FormAddData).then(({ data }) => {
              if (data.code === RES_SUCCESS) {
                ElMessage.success({
                  message: '用户添加成功',
                  type: 'success',
                });
                DATA.dialogAddFormVisible = false;
                METHODS.handlePagingAccount();
              }
            });
          }
        });
      },
      // 确认编辑用户
      handleEditConfirmUser: () => {
        delete DATA.FormEditData.createTime;
        delete DATA.FormEditData.updateTime;
        delete DATA.FormEditData.updatePwdTime;
        proxy.$refs['addForm'].submitForm().then((res: any) => {
          if (res) {
            editUser(DATA.FormEditData).then(({ data }) => {
              if (data.code === RES_SUCCESS) {
                ElMessage.success({
                  message: '用户编辑成功',
                  type: 'success',
                });
                DATA.dialogEditFormVisible = false;
                METHODS.handlePagingAccount();
              }
            });
          }
        });
      },
      // switch
      handleEmitChange: async (val: any) => {
        let { data } = await enableUser({ userId: val.id });
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
      // 操作按钮
      handleBtnEvent: ({ row, val }: any) => {
        switch (val.handleType) {
          case 'edit':
            DATA.dialogEditFormVisible = true;
            DATA.FormEditData = Object.assign({}, row);
            DATA.username = row.username;
            nextTick(() => {
              proxy.$refs['addForm'].clearForm();
            });
            break;
          case 'info':
            DATA.dialogDetailsFormVisible = true;
            DATA.FormDetailsData = Object.assign({}, row);
            break;
          case 'resetPwd':
            proxy
              .$confirm('是否确定重置密码', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              })
              .then(() => {
                resetPassword(row.id).then(({ data }: any) => {
                  if (data.code === RES_SUCCESS) {
                    proxy.$message({
                      type: 'success',
                      message: '密码重置成功!',
                    });
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
        METHODS.handlePagingAccount();
      },
      // 修改表格页数
      handleCurrentChange: (val: number) => {
        DATA.pagingObj.page = val;
        METHODS.handlePagingAccount();
      },
    });
    onMounted(() => {
      METHODS.handlePagingAccount();
      METHODS.handleGetAllRole();
      METHODS.handleGetAllUser();
      METHODS.handleGetEnableRole();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>
<style lang="scss" scoped>
.account_container {
  .account_container_head {
    width: 600px;
    & .el-input {
      flex: 1;
      margin-right: 10px;
    }
    .el-select {
      flex: 1;
      margin-right: 10px;
    }
  }
}
</style>
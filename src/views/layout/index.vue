<template>
  <div class="layout_container">
    <el-container class="container_item">
      <el-header class="header">
        <h3>广州劲联智能科技有限公司官网后台管理</h3>
        <div class="header">
          <el-dropdown @visible-change="dropdownChange">
            <span
              class="el-dropdown-link"
              :class="action ? 'textColor' : ''"
              style="display: flex;align-items:center;cursor: pointer;margin-right:10px"
            >
              <p class="userName">当前用户:{{STORE.getters.name}}</p>
              <i
                style="color:#fff"
                class="el-icon-arrow-down el-icon--right"
              > </i>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  icon="el-icon-edit"
                  @click="handleUpdatePwd"
                >
                  修改密码
                </el-dropdown-item>
                <el-dropdown-item
                  icon="el-icon-switch-button"
                  @click="handleLogout"
                >
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-container>
        <el-aside>
          <Menus
            :isCollapse="isCollapse"
            :routers="routers"
          />
          <div class="collapse">
            <i
              v-show="!isCollapse"
              class="el-icon-s-fold icon"
              @click="isCollapse=!isCollapse"
            ></i>
            <i
              v-show="isCollapse"
              class="el-icon-s-unfold icon"
              @click="isCollapse=!isCollapse"
            ></i>
          </div>
        </el-aside>
        <el-main>
          <!-- 嵌套页面 -->
          <router-view
            v-slot="{ Component }"
            v-if="refresh"
          >
            <transition
              name="fade-transform"
              mode="out-in"
            >
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
    <!-- 修改密码 -->
    <el-dialog
      title="修改密码"
      v-model="dialogFormVisible"
    >
      <ele-form
        :renderFormArr="renderFormArr"
        :refForm="'updatePwdForm'"
        :labelWidth="120"
        :formData="updatePwdForm"
        :rules="updatePwdRules"
        ref="updatePwdForms"
      ></ele-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button
            type="primary"
            @click="confirmUpdatePwd"
          >确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { useStore } from 'vuex';
import {
  defineComponent,
  getCurrentInstance,
  nextTick,
  onMounted,
  provide,
  reactive,
  toRefs,
} from 'vue';
import EleForm from '@/components/eleForm/index.vue';
import Menus from '@/views/layout/menus/index.vue';
import md5 from 'js-md5';
import { handleUpdatePwd } from '@/api/system/sysUser';
import { RES_SUCCESS, sessionRead, sessionWrite } from '@/api/common/common';
import { ElMessage } from 'element-plus/lib';
import { useRouter } from 'vue-router';
import {
  getAllParenModule,
  getGlobalModule,
} from '@/api/displaydata/parenModule';
import {
  findTypeSubModule,
  getAllSubModule,
} from '@/api/displaydata/subModule';
import { getAllMedia } from '@/api/displaydata/media';
import { getAllRole } from '@/api/system/sysRole';
export default defineComponent({
  components: {
    Menus,
    EleForm,
  },
  setup() {
    // 获取vue实例对象
    const { proxy }: any = getCurrentInstance();
    // 获取store实例
    const STORE = useStore();
    // 获取路由实例
    const ROUTER = useRouter();
    // 自定义验证规则
    let validatePass2 = (rule: any, value: string, callback: any) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== DATA.updatePwdForm.newPwd) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    let DATA: any = reactive({
      isCollapse: false,
      action: false,
      // 动态路由
      routers: [],
      // 控制修改密码模态框显示隐藏
      dialogFormVisible: false,
      // 修改密码对象
      updatePwdForm: {
        newPwd: '',
        oldPwd: '',
        confirmPwd: '',
      },
      // 渲染表单配置
      renderFormArr: [
        {
          label: '旧密码',
          prop: 'oldPwd',
          type: 'input',
          placeholder: '请输入旧密码',
          inputType: 'password',
        },
        {
          label: '新密码',
          prop: 'newPwd',
          type: 'input',
          placeholder: '请输入新密码',
          inputType: 'password',
        },
        {
          label: '确认密码',
          prop: 'confirmPwd',
          type: 'input',
          placeholder: '再输入一次密码',
          inputType: 'password',
        },
      ],
      // 表单验证
      updatePwdRules: {
        oldPwd: [
          { required: true, message: '旧密码不能为空', trigger: 'blur' },
        ],
        newPwd: [
          { required: true, message: '新密码不能为空', trigger: 'blur' },
        ],
        confirmPwd: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: validatePass2, trigger: 'blur' },
        ],
      },
      idList: [],
      refresh: true,
    });
    let METHODS: any = reactive({
      // 修改密码
      handleUpdatePwd: (): void => {
        DATA.dialogFormVisible = true;
        nextTick(() => {
          DATA.updatePwdForm = {
            newPwd: '',
            oldPwd: '',
            confirmPwd: '',
          };
          proxy.$refs['updatePwdForms'].clearForm();
        });
      },
      // 确认修改密码
      confirmUpdatePwd: () => {
        proxy.$refs['updatePwdForms']
          .submitForm()
          .then((res: any) => {
            if (res) {
              DATA.updatePwdForm.oldPwd = md5(DATA.updatePwdForm.oldPwd);
              DATA.updatePwdForm.newPwd = md5(DATA.updatePwdForm.newPwd);
              handleUpdatePwd(
                DATA.updatePwdForm.oldPwd,
                DATA.updatePwdForm.newPwd
              ).then((res) => {
                if (res.data.code === RES_SUCCESS) {
                  ElMessage.success('修改成功');
                  DATA.dialogFormVisible = false;
                } else {
                  ElMessage.warning(res.data.msg);
                }
              });
            }
          })
          .catch((err: any) => {
            console.log(err);
          });
      },
      // 退出登录
      handleLogout: (): void => {
        proxy
          .$confirm('是否退出登录', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          })
          .then(() => {
            STORE.dispatch('FedLogOut').then(() => {
              ROUTER.push({ path: '/' });
            });
            proxy.$message({
              type: 'success',
              message: '退出成功!',
            });
          })
          .catch((err: any) => {});
      },
      dropdownChange: (res: boolean) => {
        DATA.action = res;
      },
      // 获取所有父模块
      handleGetAllParenModule: async () => {
        if (!sessionRead('PARENMODULE')) {
          let { data } = await getAllParenModule();
          if (data.code === RES_SUCCESS) {
            sessionWrite('PARENMODULE', data.data);
          }
        }
      },
      // 获取所有子模块
      handleGetAllSubModule: async () => {
        if (!sessionRead('SUBMODULE')) {
          let { data } = await getAllSubModule();
          if (data.code === RES_SUCCESS) {
            sessionWrite('SUBMODULE', data.data);
          }
        }
      },
      // // 获取所有多媒体模块类型
      handleGetAllMedia: async () => {
        if (!sessionRead('MEDIAMODULE')) {
          let { data } = await getAllMedia();
          if (data.code === RES_SUCCESS) {
            sessionWrite('MEDIAMODULE', data.data);
          }
        }
      },
      // 获取所有子模块管理类型
      handleAllTypeSubModule: async () => {
        if (!sessionRead('SUBMODULETYPE')) {
          let { data } = await findTypeSubModule();
          if (data.code === RES_SUCCESS) {
            sessionWrite('SUBMODULETYPE', data.data);
          }
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
      handleRefresh: () => {
        DATA.refresh = false;
        nextTick(() => {
          DATA.refresh = true;
        });
      },
    });
    provide('refresh', METHODS.handleRefresh);
    onMounted(() => {
      DATA.routers = STORE.state.user.routers;
      METHODS.handleGetAllParenModule();
      METHODS.handleGetAllSubModule();
      METHODS.handleGetAllMedia();
      METHODS.handleAllTypeSubModule();
      METHODS.getAllRole();
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      STORE,
    };
  },
});
</script>
<style lang="scss" scoped>
.layout_container {
  margin-top: 0;
  .container_item {
    height: 100vh;
  }
  .el-header {
    background-color: #545c64;
    color: #eee;
    text-align: left;
  }

  .el-aside {
    width: auto !important;
    background-color: #545c64;
    color: #333;
    text-align: center;
    position: relative;
  }

  .el-main {
    background-color: #e9eef3;
    color: #333;
    position: relative;
    overflow: hidden;
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .container_item {
    height: 100vh;
  }
  .el-menu-vertical-demo {
    border-right: none;
    color: #ffd04b;
    text-align: left !important;
    // overflow: scroll;
    max-height: 100vh;
  }
  .el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 200px;
  }
  .el-menu-vertical-demo::-webkit-scrollbar {
    width: 0 !important;
  }
  /deep/ .el-menu-item-group__title {
    padding: 0;
  }
  .userName {
    color: #fff;
  }
  .collapse {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    color: #fff;
    background-color: #333333 !important;
    height: 50px;
    bottom: 0;
    cursor: pointer;
  }
  .icon {
    font-size: 28px;
  }
  .header .el-dropdown-link:focus {
    outline: 0;
  }
}
</style>
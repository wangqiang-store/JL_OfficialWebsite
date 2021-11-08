<template>
  <div class="admin_container">
    <div class="admin_container_bg">
    </div>
    <div class="admin_container_login">
      <h4 class="admin_title">广州劲联智能科技后台管理</h4>
      <el-form
        :model="loginForm"
        status-icon
        :rules="loginRules"
        ref="ruleForm"
        class="demo-ruleForm"
      >
        <el-form-item prop="username">
          <el-input
            type="text"
            v-model="loginForm.username"
            placeholder="请输入用户名"
          >
            <template #prefix>
              <i class="iconfont icon-yonghu"></i>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            placeholder="请输入密码"
            :type="isHidder ? 'password' : 'text'"
            @keydown.enter="handleSignin('ruleForm')"
          >
            <template #prefix>
              <i class="iconfont icon-mima"></i>
            </template>
            <template #suffix>
              <i
                @click="changeHidder"
                class="iconfont"
                :class="isHidder ? 'icon-bukejian' : 'icon-kejian1'"
              ></i>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <div style="text-align:center;width:100%" class="d_flex">
        <el-button
          type="primary"
          @click="handleSignin('ruleForm')"
        >提交</el-button>
        <el-button type="primary" @click="handleResetForm('ruleForm')">重置</el-button>
      </div>
    </div>
  </div>

</template>
<script lang="ts">
import { useRouter } from 'vue-router';
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  ref,
} from 'vue';
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';
import { validateSomeChinese } from '@/api/common/validRules';
import { RES_SUCCESS, sessionWrite } from '@/api/common/common';
import md5 from 'js-md5';

export default defineComponent({
  setup() {
    // 获取vue实例化对象
    const { proxy }: any = getCurrentInstance();
    let ruleForm: any = ref(null);
    // 获取router
    const ROUTER: any = useRouter();
    // 获取store
    const STORE: any = useStore();
    let DATA: any = reactive({
      loginForm: {
        username: '',
        password: '',
      },
      isHidder: true,
      // 登录表单验证规则
      loginRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { validator: validateSomeChinese, trigger: 'blur' },
        ],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
      },
    });
    let METHODS = reactive({
      changeHidder: () => {
        DATA.isHidder = !DATA.isHidder;
      },
      handleResetForm: (formName: any) => {
        ruleForm.value.resetFields();
        DATA.loginForm.username = '';
        DATA.loginForm.password = '';
      },
      handleSignin: (formName: string) => {
        ruleForm.value.validate((valid: boolean) => {
          if (valid) {
            if (DATA.loginForm.password != '') {
              DATA.loginForm.password = md5(DATA.loginForm.password);
            }
            STORE.dispatch('Login', DATA.loginForm).then(({ data }: any) => {
              //登录成功 跳转
              if (data.code == RES_SUCCESS) {
                ROUTER.push({ path: '/layout' });
                // sessionWrite('active', '0');
                // sessionWrite('openeds', []);
              }
            });
          }
        });
      },
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      ruleForm,
    };
  },
});
</script>
<style lang="scss" scoped>
@import url('../../font/iconfont/iconfont.css');
.admin_container {
  position: relative;
  margin-top: 0;
  height: 100vh;
  .admin_container_bg {
    width: 100vw;
    height: 100vh;
    background-image: url('../../assets/images/admin.jpg');
    background-repeat: no-repeat;
    background-size: cover;
    filter: blur(4px);
    position: absolute;
    top: 0;
    left: 0;
  }
  .admin_title {
    width: 100%;
    text-align: center;
    font-size: 24px;
    letter-spacing: 3px;
    margin-bottom: 30px;
  }
  .admin_container_login {
    width: 30%;
    height: 300px;
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 5px;
    transform: translateX(-50%) translateY(-50%);
    background-color: rgba(#fff, 0.2);
    padding-top: 30px;
    padding-left: 20px;
    padding-right: 20px;
    .el-button {
      width: 49%;
    }
  }
}
</style>
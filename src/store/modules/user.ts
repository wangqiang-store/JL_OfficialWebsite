import { getToken,setToken, removeToken} from "@/utils/auth";
import router,{ routes }  from "@/router";
import { generaMenu } from "@/api/common/route";
import { getInfo , signIn} from '@/api/system/sysUser';
import { getSide } from '@/api/system/sysModule';
import { ElMessage } from 'element-plus';

const user:any = {
  state: {
    token: getToken(),
    name: "",
    roleName:"",
    avatar: "",
    roles: [],//角色
    positions:[],//部门
    routers: [],
    addRouters:[],
    roleId : "",//角色id
    userId:"",//用户id
    deptId:"",//部门id
    routerModule:[],//路由模块
    depts:[],
    allModule:[],//所有模块
    users:[]//所有用户
  },
   mutations: {
    SET_TOKEN: (state:any, token:any) => {
      state.token = token;
    },
    SET_NAME: (state:any, name:any) => {
      state.name = name;
    },
    SET_ROLENAME: (state:any, name:any) => {
      state.roleName = name;
    },
    SET_ROLEID: (state:any,id:any) => {
      state.roleId = id;
    },
    SET_USERID:(state:any,id:any) => {
      state.userId = id;
    },
    SET_DEPTID:(state:any,id:any) => {
      state.deptId = id;
    },
    SET_AVATAR: (state:any, avatar:any) => {
      state.avatar = avatar;
    },
    SET_ROLES: (state:any, roles:any) => {
      state.roles = roles;
    },
    SET_ROUTER: (state:any, routers:any) => {
      state.addRouters = routers;
      state.routers = routes.concat(routers);
      router.options.routes = state.routers;
      for (let item of routers) {
        router.addRoute(item);
      }
      router.addRoute(
        {
          path: "/:catchAll(.*)",// :pathMatch(.*)  :catchAll(.*)
          name: "notFound",
          component: () => import("@/views/notFound/index.vue"),
          meta:{
            isShow:true
          },
        }
      )
    },
    CLEAR_ROUTER: (state:any, routers:any) => {
      router.options.routes = routers;
    },
    SET_POSITION : (state:any , position:any) => {
      state.positions = position
    },
    SET_ROUTERMODULES :(state:any,modules:any) => {
      state.routerModule = modules
    },
    SET_DEPT : (state:any,depts:any) => {
      state.depts = depts
    },
    SET_MODULE : (state:any,modules:any) => {
      state.allModule = modules
    },
    SET_USERS : (state:any,users:any) => {
      state.users = users
    }
  },
  actions: {
    // 登录
    Login({ commit }:any, userInfo:any) {
      commit("SET_ROLES", [], { root: true });
      const username = userInfo.username.trim();
      return new Promise((resolve, reject) => {
        signIn(username, userInfo.password).then(response => {
            const data = response.data;
            if (data.msg) {
              ElMessage.error({
                message: data.msg,
                type:"error"
              });
            }
            setToken(data.data.jws);
            localStorage.setItem("ExpirationTime", data.data.expirationTime);
            commit("SET_TOKEN", data.data.jws);
            resolve(response);
          }).catch(error => {
            reject(error);
          });
      });
    },

    // 获取用户信息
    GetInfo({ commit }:any) {
      return new Promise((resolve, reject) => {
        getInfo().then(response => {
            const data = response.data;
            // if (data.roles && data.roles.length > 0) { // 验证返回的roles是否是一个非空数组
            //   commit('SET_ROLES', data.roles)
            // } else {
            //   reject('getInfo: roles must be a non-null array !')
            // }
            commit("SET_NAME", data.data.name);
            commit("SET_ROLENAME", data.data.roleName);
            commit("SET_ROLEID", data.data.roleId);
            commit("SET_USERID", data.data.id);
            commit("SET_DEPTID", data.data.deptId);
            // commit('SET_AVATAR', data.avatar)
            resolve(response);
          }).catch(error => {
            reject(error);
          });
      });
    },

    GenerateRoutes({ commit, state }:any) {
      return new Promise<void>((resolve, reject) => {
        if (localStorage.getItem("Router") == null) {
          getSide().then(response => {
              const data = response.data.data;
              if (data.length == 0) {
                // alert('此账号关联权限出错,请联系管理员')
                // Message.error({
                //   message: "此账号关联权限出错,请联系管理员"
                // });
                // removeToken();
                commit("SET_ROUTER", []);
                resolve(); 
              } else {
                commit("SET_ROUTERMODULES",data)
                let routers:Array<any> = [];
                generaMenu(routers, data);
                commit("SET_ROUTER", routers);
                localStorage.setItem("Router", JSON.stringify(routers));
                resolve();
              }
            }).catch(error => {
              reject(error);
            });
        } else {
          commit("SET_ROUTER", JSON.parse(localStorage.getItem("Router") || '{}'));
          resolve();
        }
      });
    },

    // 前端 登出
    FedLogOut({ commit }:any) {
      return new Promise<void>( resolve => {
        commit("SET_TOKEN", "");
        commit("CLEAR_ROUTER", "");
        removeToken();
        // localStorage.removeItem("ExpirationTime");
        // localStorage.removeItem("Router");
        // localStorage.removeItem("Dict");
        // localStorage.removeItem("workflow");
        // localStorage.removeItem("RoleType");
        // localStorage.removeItem("editPidData");
        // localStorage.removeItem("pageId");
        localStorage.clear();
        sessionStorage.clear();
        history.go(0);
        resolve();
      });
    }
  }
}

export default user;
import router from "./router";
import store from "./store";
import NProgress from "nprogress"; // Progress 进度条
import "nprogress/nprogress.css"; // Progress 进度条样式
import { ElMessage } from 'element-plus';
import { getToken } from "@/utils/auth"; // 验权
const whiteList = ["/admin","/","/singleImg","/moreImg","/singleVideo","/moreVideo","/singleDoc","/moreDoc","/twoDoc","/devHistory","/document","/search","/NotFound"]; // 不重定向白名单

router.beforeEach(async (to, from,next) => {
  if (to.path == from.path) {
    next();
    return;
  }
  NProgress.start();
  if (getToken()) {
    if (to.path === "/admin") {
      next({ path: "/admin" });
      store.dispatch("FedLogOut");
      NProgress.done(); // if current page is dashboard will not trigger	afterEach hook, so manually handle it
    } else {
      if (store.getters.roles.length === 0) {
        try {
          const res = await store.dispatch("GetInfo");
          var roles = [res.data.data.username];
          store.commit("SET_ROLES", roles, { root: true });
          const accessRouter = await store.dispatch("GenerateRoutes");
          next({ ...to, replace: true });
        } catch (err) {
          store.dispatch("FedLogOut").then(() => {
            ElMessage.error(err || "Verification failed, please login again");
            next({
              path: "/admin"
            });
            NProgress.done();
          });
        }
      } else {
        next();
      }
    }
  } else {
    router.addRoute(
      {
        path: "/:catchAll(.*)",// :pathMatch(.*)  :catchAll(.*)
        component: () => import("@/views/notFound/index.vue"),
        meta:{
          isShow:true
        },
      }
    );
    if (whiteList.indexOf(to.path) !== -1) {
      next();
    } else {
      next({path:"/"});
      NProgress.done();
    }
  }
});

router.afterEach(() => {
  document.documentElement.scrollTo(0,0);
  NProgress.done(); // 结束Progress
});

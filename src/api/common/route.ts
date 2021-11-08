import Layout from '@/views/layout/index.vue';
import { getGlobalModule } from '@/api/displaydata/parenModule';
import { RES_SUCCESS, sessionRead, sessionWrite } from '@/api/common/common';
// 生成动态路由
export function generaMenu(routers: any, data: any) {
  data.forEach((item: any) => {
    if(item.component!=null && item.href!=null){
      const menu = {
        path: item.href,
        component: item.component == "Layout" ? Layout : () => import("@/views" + item.component + "/index.vue"),
        children: [],
        meta: { title: item.name, id: item.id, icon: item.icon},
      };
      if (item.children && item.children[0].href != "editable") {
        generaMenu(menu.children, item.children);
      }
      routers.push(menu);
    }
  });
  return routers;
}


// 获取路由模块中所有ID
let handleGetAllModuleId = (idList: any[], data: any[]) => {
    data.forEach((item) => {
        idList.push(item.id);
        if (item.children != null && item.children.length > 0) {
          handleGetAllModuleId(idList, item.children);
        }
    });
    return idList;
};

 // 获取所有路由模块
export let handleGetGlobalModule = async (idList:any[] = []) => {
    let { data } = await getGlobalModule();
    if (data.code === RES_SUCCESS) {
      idList = handleGetAllModuleId([], data.data);
      sessionWrite('ALLMOUDLEID', idList);
    }
};

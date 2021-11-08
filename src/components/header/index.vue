<template>
  <div class="nav_header">
    <!-- 公司logo -->
    <router-link to="/">
      <img
        style="height:80px"
        src="../../assets/images/logo.jpg"
        alt="广州劲联智能科技有限公司"
        class="logo"
        @click="handleClickLogo"
      />
    </router-link>
    <el-menu
      :default-active="activeIndex"
      mode="horizontal"
      background-color="#fff"
      text-color="#000"
      active-text-color="#0193de"
      class="menu"
    >
      <el-submenu
        :index="item.href + item.id"
        v-for="item in navList"
        :key="item.id"
        popper-class="el-submenu"
      >
        <template #title>
          <span class="nav-title">{{ item.title }}</span>
        </template>
        <div class="d_flex submenu_item">
          <div class="menu_item">
            <template
              v-for="itemchildren in item.children"
              :key="itemchildren.id"
            >
              <el-menu-item
                :index="itemchildren.href + itemchildren.id"
                @click="handleNavModule(itemchildren)"
                v-if="itemchildren.title!='发展历程'"
              >
                <span class="itemChildrenTitle">
                  {{ itemchildren.title }}
                </span>
              </el-menu-item>
            </template>
          </div>
          <el-image
            v-if="item.image"
            style="width: 200px; height: 200px"
            :src="IMG_File + item.image"
            fit="cover"
          ></el-image>
        </div>
      </el-submenu>
      <p
        class="devHistory"
        :index="'/devHistory'"
        @click="handleClickDevHistory"
      ><span class="nav-title">发展历程</span></p>
    </el-menu>
    <div class="nav_header_right">
      <el-input
        placeholder="请输入内容"
        prefix-icon="el-icon-search"
        v-model="content"
        class="mr-10 ml-10"
        @keydown.enter="handleSearch"
        clearable
      >
      </el-input>
      <el-button
        type="primary"
        @click="handleSearch"
        :loading="STORE.state.data.searchLoading"
      >搜索</el-button>
    </div>
  </div>
  <sub-module
    v-if="ROUTE.path!='/' && sessionRead('FRONTSUB')"
    :isShowTab="handleShowTableNav()"
    @handleClickTab="handleClickTab"
  ></sub-module>
</template>
<script lang="ts">
import { defineComponent, onMounted, reactive, toRefs, watch } from 'vue';
import { getGlobalModule, getParentModuleMedia } from '@/api/homePage/homePage';
import { IMG_File, sessionRead, sessionWrite } from '@/api/common/common';
import { useRoute, useRouter } from 'vue-router';
import SubModule from '@/components/submodule/index.vue';
import { useStore } from 'vuex';
export default defineComponent({
  components: {
    SubModule,
  },
  setup() {
    // 获取路由实例对象
    const ROUTER = useRouter();
    const ROUTE = useRoute();
    const STORE = useStore();
    let DATA: any = reactive({
      activeIndex: '',
      isshow: true,
      navList: [],
      content: '',
      index: 0,
      parentList: [],
      subList: [],
      type: '',
      searchLoading: false,
    });
    let METHODS: any = reactive({
      // 获取首页头部模块数据
      handleGetParentModuleMedia: async () => {
        let { data } = await getParentModuleMedia();
        DATA.navList = METHODS.formattData([], data.data);
        sessionWrite('HEADNAV', data.data);
      },
      // 格式化 路由数组
      formattData: (list: any[], data: any[]) => {
        data.forEach((item) => {
          let obj = {
            id: item.id,
            title: item.name,
            image: item.image,
            type: item.type,
            parentId: item.parentId,
            reference: item.reference,
            children: [],
            href: METHODS.handleCustomRouteList(item.type),
          };
          list.push(obj);
          if (item.children != null && item.children.length > 0) {
            METHODS.formattData(obj.children, item.children);
          }
        });
        return list;
      },
      // 全局搜索
      handleSearch: async () => {
        if (!DATA.content) {
          return;
        }
        let content = DATA.content;
        DATA.content = '';
        ROUTER.push({
          name: 'search',
          query: {
            key: content,
          },
        });
      },
      // 点击子模块
      handleNavModule: async (item: any) => {
        METHODS.handleRedirect(item);
        if (item.type == 8) {
          // 判断引用子模块是否存在
          let bool = sessionRead('FRONTSUB').some((val: any) => {
            return val.id === item.reference;
          });
          if (!bool) {
            ROUTER.push('/NotFound');
            return;
          }
          let type: any = '';
          sessionRead('FRONTSUB').forEach((val: any) => {
            if (item.reference === val.id) {
              type = val.type;
            }
          });
          let itemObj = Object.assign({}, { ...item, type });
          let query: any = {
            id: itemObj.id,
            refId: itemObj.reference,
            parentId: itemObj.parentId,
          };
          switch (type) {
            case 1:
              ROUTER.push({ name: 'frontpageSingleImg', query });
              break;
            case 2:
              ROUTER.push({ name: 'frontpageMoreImg', query });
              break;
            case 3:
              ROUTER.push({ name: 'frontpageSingleVideo', query });
              break;
            case 4:
              ROUTER.push({ name: 'frontpageMoreVideo', query });
              break;
            case 5:
              ROUTER.push({ name: 'frontpageSingleDoc', query });
              break;
            case 6:
              ROUTER.push({ name: 'frontpageMoreDoc', query });
              break;
            case 7:
              ROUTER.push({ name: 'frontpageTwoDoc', query });
              break;
            default:
              break;
          }
        }
      },
      // 跳转页面
      handleRedirect: (item: any) => {
        DATA.type = item.type;
        let query = { id: item.id, parentId: item.parentId };
        switch (item.type) {
          case 1:
            ROUTER.push({ name: 'frontpageSingleImg', query });
            break;
          case 2:
            ROUTER.push({ name: 'frontpageMoreImg', query });
            break;
          case 3:
            ROUTER.push({ name: 'frontpageSingleVideo', query });
            break;
          case 4:
            ROUTER.push({ name: 'frontpageMoreVideo', query });
            break;
          case 5:
            ROUTER.push({ name: 'frontpageSingleDoc', query });
            break;
          case 6:
            ROUTER.push({ name: 'frontpageMoreDoc', query });
            break;
          case 7:
            ROUTER.push({ name: 'frontpageTwoDoc', query });
            break;
          default:
            break;
        }
      },
      // 点击发展历程
      handleClickDevHistory: () => {
        ROUTER.push({
          name: 'devHistory',
        });
      },
      // 自定义路由类型数组
      handleCustomRouteList: (type: number) => {
        let content = '';
        switch (type) {
          case 1:
            content = '/singleImg';
            break;
          case 2:
            content = '/moreImg';
            break;
          case 3:
            content = '/singleVideo';
            break;
          case 4:
            content = '/moreVideo';
            break;
          case 5:
            content = '/singleDoc';
            break;
          case 6:
            content = '/moreDoc';
            break;
          case 7:
            content = '/twoDoc';
            break;
          case 8:
            content = '/reference';
            break;
          default:
            content = DATA.index++ + '';
            break;
        }
        return content;
      },
      // 获取所有路由
      handlegetGlobalModule: async () => {
        let childrenList: any[] = [];
        let { data } = await getGlobalModule();
        // 获得所有前台父模块数据
        if (data.data != null && data.data.length > 0) {
          data.data.forEach((item: any) => {
            DATA.parentList.push({
              id: item.id,
              name: item.name,
            });
            if (item.children != null && item.children.length > 0) {
              childrenList.push(item.children);
            }
          });
          if (childrenList.flat(Infinity).length > 0) {
            childrenList.flat(Infinity).forEach((item) => {
              DATA.subList.push({
                id: item.id,
                name: item.name,
                type: item.type,
                parentId: item.parentId,
              });
            });
          }
          sessionWrite('FRONTPARENT', DATA.parentList);
          sessionWrite('FRONTSUB', DATA.subList);
        }
      },
      handleClickTab: (item: any) => {
        if (item.type == 8) {
          DATA.type = 8;
        } else {
          DATA.type = item.type;
        }
      },
      // 动态显示table导航栏
      handleShowTableNav: () => {
        var navList = ['/devHistory', '/search', '/document'];
        if (navList.includes(ROUTE.path)) {
          return false;
        }
      },
    });
    watch([() => ROUTE.path, () => ROUTE.query.id], () => {
      if (ROUTE.path != '/document') {
        DATA.activeIndex = ROUTE.path + ROUTE.query.id;
        DATA.type === 8 && (DATA.activeIndex = '/reference' + ROUTE.query.id);
        METHODS.handleGetParentModuleMedia();
      }
    });
    onMounted(() => {
      METHODS.handleGetParentModuleMedia();
      METHODS.handlegetGlobalModule();
      DATA.activeIndex = ROUTE.path + (ROUTE.query.id || '');
      if (sessionRead('FRONTSUB')) {
        sessionRead('FRONTSUB').forEach((item: any) => {
          ROUTE.query.id == item.id && (DATA.type = item.type);
        });
      }
      DATA.type === 8 && (DATA.activeIndex = '/reference' + ROUTE.query.id);
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      IMG_File,
      ROUTE,
      sessionRead,
      STORE,
    };
  },
});
</script>
<style lang="scss" scoped>
a {
  color: #fff;
  text-decoration: none;
  background-color: transparent;
}
a:hover {
  color: #fff;
  text-decoration: none;
}
.el-menu.el-menu--horizontal {
  border-bottom: none;
}
.el-submenu__title:hover {
  background-color: #2a2e33;
}
.logo {
  user-select: none;
  -webkit-user-drag: none;
}
.nav_header {
  display: flex;
  height: 100px !important;
  // background-color: #343a40;
  background-color: #fff;
  padding: 10px;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  .el-menu {
    display: flex;
    align-items: center;
    /deep/ .el-submenu:hover {
      border-bottom: 2px solid $theme-colors !important;
    }
    /deep/ .el-menu-item:hover {
      border-bottom: 2px solid $theme-colors !important;
    }
    /* 消除动态添加的三角 */
    /deep/ .el-icon-arrow-down:before {
      content: none !important;
    }
    /deep/ .el-submenu__title {
      font-size: 15px;
    }
  }
  .nav_header_right {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    .el-input {
      width: 200px;
    }
    .el-button {
      background-color: $theme-colors;
      border: none;
    }
  }
}
.submenu_item {
  & :first-child {
    text-align: center;
    border: none;
  }
  /deep/ .el-image__inner {
    user-select: none;
    -webkit-user-drag: none;
  }
}
.menu_item {
  width: 200px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
.nav-title {
  font-weight: bold;
  font-size: 16px;
}
.devHistory {
  padding: 0 20px;
  width: 112px;
  height: 60px;
  display: flex;
  align-items: center;
  cursor: pointer;
  &:hover {
    border-bottom: 2px solid $theme-colors;
  }
}
/deep/ .el-menu-item {
  width: 100%;
}
</style>
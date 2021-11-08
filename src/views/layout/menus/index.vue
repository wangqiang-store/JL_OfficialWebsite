<template>
  <el-menu
    class="el-menu-vertical-demo"
    :uniqueOpened="true"
    text-color="#fff"
    background-color="#545c64"
    active-text-color="#ffd04b"
    :collapse="isCollapse"
    @open="handleOpen"
    @close="handleClose"
    :default-openeds="openeds"
    :default-active="active"
  >
    <!-- <el-menu-item
      index="/main"
      @click="skipMoudel('/main')"
    >
      <i class="el-icon-s-home"></i>
      <template #title>首页</template>
    </el-menu-item> -->
    <template
      v-for="(item) of routers"
      :key="item.path"
    >
      <!-- <el-menu-item
        :index="item.path"
        v-if=" item.name == 'Layout' || (item.children != undefined && item.children.length <= 1)"
        @click="skipMoudel(item.path)"
      >
        <i class="el-icon-menu"></i>
        <template #title>{{item.meta.title ? item.meta.title : ""}}</template>
      </el-menu-item> -->
      <el-submenu
        :index="item.path"
        v-if="item.name != 'Layout' && item.children != undefined && item.children.length > 0"
      >
        <template #title>
          <i :class="item.meta.icon ? item.meta.icon : 'el-icon-location'"></i>
          <span>{{item.meta.title ? item.meta.title : ""}}</span>
        </template>
        <template
          v-for="(val) of item.children"
          :key="val.path"
        >
          <el-menu-item-group>
            <el-menu-item
              :index="`${item.path}/${val.path}`"
              @click="skipMoudel(`${item.path}/${val.path}`)"
            >{{val.meta.title }}</el-menu-item>
          </el-menu-item-group>
          <!-- <template v-if="val.children.length>0">
            <el-submenu
              :index="`${item.path}/${val.path}`"
              v-for="key of val.children"
              :key="key.path"
            >
              <template #title>{{val.meta.title}}</template>
              <el-menu-item
                :index="`${item.path}/${val.path}/${key.path}`"
                @click="skipMoudel(`${item.path}/${val.path}/${key.path}`)"
              >{{key.meta.title}}</el-menu-item>
            </el-submenu>
          </template> -->
        </template>
      </el-submenu>
    </template>
  </el-menu>
</template>

<script lang="ts">
import {
  defineComponent,
  nextTick,
  onMounted,
  reactive,
  toRefs,
  watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { sessionWrite, sessionRead } from '@/api/common/common';
import { useStore } from 'vuex';

export default defineComponent({
  props: {
    isCollapse: {
      type: Boolean,
      default: false,
    },
  },
  setup(prop) {
    // 获取路由实例
    let ROUTER: any = useRouter();
    let ROUTE: any = useRoute();
    // 获取store实例
    let STORE: any = useStore();
    let data: any = reactive({
      openeds: sessionRead('openeds'),
      active: ROUTE.path,
      routers: STORE.state.user.routers,
    });
    let methods: any = reactive({
      skipMoudel: (path: string): void => {
        ROUTER.push(path);
      },
      handleOpen: (key: any, keyPath: any) => {
        data.openeds = keyPath;
        sessionWrite('openeds', keyPath);
      },
      handleClose: (key: any, keyPath: any) => {
        // data.openeds.forEach((item: any) => {
        //   if (keyPath.indexOf(item) != -1) {
        //     data.openeds.splice(keyPath.indexOf);
        //     sessionWrite('openeds', data.openeds);
        //   }
        // });
      },
    });
    watch(
      () => ROUTE.path,
      () => {
        data.active = ROUTE.path;
      }
    );
    onMounted(() => {});
    return {
      ...toRefs(data),
      ...toRefs(methods),
    };
  },
});
</script>

<style scoped>
</style>
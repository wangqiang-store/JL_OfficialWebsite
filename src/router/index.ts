import { createRouter, createWebHistory, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import main from '../views/main/index.vue'
export const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'main',
    component: main,
    meta:{
      isShow:true
    },
  },
  {
    path:"/admin",
    name:"admin",
    meta:{
      isShow:false
    },
    component: () => import("../views/login/index.vue"),
  },
  {
    path:"/layout",
    name:"Layout",
    meta:{ isShow:false },
    component: () => import("../views/layout/index.vue"),
    children:[
      {
        path:"singleImg",
        name:"singleImg",
        meta:{ isShow:false },
        component: () => import("../views/displaydata/submodule/singleImg/index.vue"),
      },
      {
        path:"moreImg",
        name:"moreImg",
        meta:{ isShow:false },
        component: () => import("../views/displaydata/submodule/moreImg/index.vue"),
      },
      {
        path:"singleVideo",
        name:"singleVideo",
        meta:{ isShow:false },
        component: () => import("../views/displaydata/submodule/singleVideo/index.vue"),
      },
      {
        path:"moreVideo",
        name:"moreVideo",
        meta:{ isShow:false },
        component: () => import("../views/displaydata/submodule/moreVideo/index.vue"),
      },
      {
        path:"singleDoc",
        name:"singleDoc",
        meta:{ isShow:false },
        component: () => import("../views/displaydata/submodule/singleDoc/index.vue"),
      },
      {
        path:"moreDoc",
        name:"moreDoc",
        meta:{ isShow:false },
        component: () => import("../views/displaydata/submodule/moreDoc/index.vue"),
      },
      {
        path:"twoClassify",
        name:"twoClassify",
        meta:{ isShow:false },
        component: () => import("../views/displaydata/submodule/twoClassify/index.vue"),
      },
      {
        path:"twoDocument",
        name:"twoDocument",
        meta:{ isShow:false },
        component: () => import("../views/displaydata/submodule/twoClassify/twoDocument/index.vue"),
      },
    ]
  },
  {
    path:"/singleImg",
    name: 'frontpageSingleImg',
    component: () => import("../views/frontpage/singleImg/index.vue"),
    meta:{
      isShow:true
    },
  },
  {
    path:"/moreImg",
    name: 'frontpageMoreImg',
    component: () => import("../views/frontpage/moreImg/index.vue"),
    meta:{
      isShow:true
    },
  },
  {
    path:"/singleVideo",
    name: 'frontpageSingleVideo',
    component: () => import("../views/frontpage/singleVideo/index.vue"),
    meta:{
      isShow:true
    },
  },
  {
    path:"/moreVideo",
    name: 'frontpageMoreVideo',
    component: () => import("../views/frontpage/moreVideo/index.vue"),
    meta:{
      isShow:true
    },
  },
  {
    path:"/singleDoc",
    name: 'frontpageSingleDoc',
    component: () => import("../views/frontpage/singleDoc/index.vue"),
    meta:{
      isShow:true
    },
  },
  {
    path:"/moreDoc",
    name: 'frontpageMoreDoc',
    component: () => import("../views/frontpage/moreDoc/index.vue"),
    meta:{
      isShow:true
    },
  },
  {
    path:"/twoDoc",
    name: 'frontpageTwoDoc',
    component: () => import("../views/frontpage/twoDoc/index.vue"),
    meta:{
      isShow:true
    },
  },
  {
    path:"/document",
    name: 'document',
    component: () => import("../views/frontpage/document/index.vue"),
    meta:{
      isShow:true
    },
  },
  {
    path:"/devHistory",
    name: 'devHistory',
    component: () => import("../views/frontpage/devHistory/index.vue"),
    meta:{
      isShow:true
    },
  },
  {
    path:"/search",
    name: 'search',
    component: () => import("../views/frontpage/search/index.vue"),
    meta:{
      isShow:true
    },
  },
  {
    path: "/NotFound",
    name: "notFound",
    component: () => import("@/views/notFound/index.vue"),
    meta:{
      isShow:true
    },
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  // history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router

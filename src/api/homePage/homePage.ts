import request from '@/utils/request';
import qs from 'qs';

//  获取全局路由菜单
export let getGlobalModule = () => {
  return request({
    url:"/homePage/getGlobalModule",
    method:"get"
  })
}

// 获取所有轮播文档
export let getAllCarouselDocument = () => {
  return request({
    url:"/homePage/getAllCarouselDocument",
    method:"get"
  })
}

//  获取所有轮播图片
export let getAllCarouselPictures = () => {
  return request({
    url:"/homePage/getAllCarouselPictures",
    method:"get"
  })
}

// 获取所有案例展示
export let getAllCaseShow = () => {
  return request({
    url:"/homePage/getAllCaseShow",
    method:"get"
  })
}

// 获取所有发展历史-时间轴
export let getAllDevHistory = () => {
  return request({
    url:"/homePage/getAllDevHistory",
    method:"get"
  })
}

// 关键字全局搜索
export let getKeywordSearch = (params:{key:string}) => {
  return request({
    url:"/homePage/getKeywordSearch",
    method:"get",
    params
  })
}

// 根据子模块id和类型获取该类型多媒体列表(前台分页)
export let getMediaByTypeAndEnable = (params:{ limit:number,page:number,subModuleId:number }) => {
  return request({
    url:"/homePage/getMediaByTypeAndEnable",
    method:"get",
    params
  })
}

// 获取企业信息
export let getPage = () => {
  return request({
    url:"/homePage/getPage",
    method:"get",
  })
}

// 获取首页头部父子模块数据
export let getParentModuleMedia = () => {
  return request({
    url:"/homePage/getParentModuleMedia",
    method:"get",
  })
}

// 根据子模块二级文档引用分类的id获取4级该多媒体列表(前台分页)
export let getSecondMediaByTypeAndEnable = (params:{ MediaId:number,limit:number,page:number }) => {
  return request({
    url:"/homePage/getSecondMediaByTypeAndEnable",
    method:"get",
    params
  })
}

// 根据多类型id获取该多媒体数据
export let getMediaByMyId = (params:{ MediaId:number }) => {
  return request({
    url:"/homePage/getMediaByMyId",
    method:"get",
    params
  })
}

// 查询子模块管理类型
export let findType = () => {
  return request({
    url:"/homePage/findType",
    method:"get",
  })
}






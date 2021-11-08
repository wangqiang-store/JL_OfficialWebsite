import request from '@/utils/request';
import qs from 'qs';

// 获取所有的多类型多媒体
export let getAllMedia = () => {
  return request({
    url:"/media/getAllMedia",
    method:"get"
  })
}

// 根据子模块id和类型获取该类型多媒体
export let getMediaByType = (params:{ subModuleId:number, type:number }) => {
  return request({
    url:"/media/getMediaByType",
    method:"get",
    params
  })
}

// 根据子模块id和类型分页获取该类型多媒体（后台分页）
export let getMediaByTypePage = (params:{ limit:number, page:number ,subModuleId:number,type:number }) => {
  return request({
    url:"/media/getMediaByTypePage",
    method:"get",
    params
  })
}

// 根据子模块二级文档引用分类的id获取4级该多媒体（后台分页）
export let getSecondLevelMediaByTypePage = (params:{ limit:number, page:number ,MediaId:number }) => {
  return request({
    url:"/media/getSecondLevelMediaByTypePage",
    method:"get",
    params
  })
}

// 根据子模块二级文档引用分类的id获取4级该多媒体
export let getSecondLevelMediaByType = (params:{ MediaId:number }) => {
  return request({
    url:"/media/getSecondLevelMediaByType",
    method:"get",
    params
  })
}

// 分页获取所有多类型多媒体管理
export let pagingMedia = (params:{ limit:number, page:number }) => {
  return request({
    url:"/media/search",
    method:"get",
    params
  })
}

// 新增多类型多媒体
export let createMedia = (params : object) => {
  return request({
    url:"/media/save",
    method:"post",
    data:params
  })
}

// 编辑多类型多媒体
export let updateMedia = (params:object) => {
  return request({
    url:"/media/update",
    method:"put",
    data:qs.stringify(params)
  })
}

// 删除多类型多媒体
export let deleteMedia = (params:{ id :number }) => {
  return request({
    url:"/media/delete",
    method:"delete",
    params
  })
}

// 该类型多媒体是否启用
export let enableMedia = (params:{ id :number }) => {
  return request({
    url:"/media/enableMedia",
    method:"put",
    params
  })
}

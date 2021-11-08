import request from '@/utils/request';
import qs from 'qs';

// 获取所有的父模块管理
export let getAllParenModule = () => {
  return request({
    url:"/parenModule/getAllParenModule",
    method:"get"
  })
}

// 分页获取所有模块管理
export let pagingParenModule = (params: { limit:number,page:number }) => {
  return request({
    url:"/parenModule/search",
    method:"get",
    params
  })
}

// 新增模块管理
export let createParenModule = (params: object) => {
  return request({
    url:"/parenModule/save",
    method:"post",
    data:params
  })
}

// 删除模块管理
export let deleteParenModule = (params: {id:number}) => {
  return request({
    url:"/parenModule/delete",
    method:"delete",
    params
  })
}

// 编辑模块管理
export let updateParenModule = (params: object) => {
  return request({
    url:"/parenModule/update",
    method:"put",
    data:qs.stringify(params)
  })
}

// 父模块管理是否启用
export let enableParenModule = (params: {id :number}) => {
  return request({
    url:"/parenModule/enableParenModule",
    method:"put",
    data:qs.stringify(params)
  })
}

//  获取全局路由菜单
export let getGlobalModule = () => {
  return request({
    url:"/parenModule/getGlobalModule",
    method:"get",
  })
}
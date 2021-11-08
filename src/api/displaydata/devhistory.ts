import request from '@/utils/request';
import qs from 'qs';

// 新增发展历史
export let createDevHistory = (params:object) => {
  return request({
    url:"/devHistory/save",
    method:"post",
    data:params
  })
}

// 编辑发展历史
export let updateDevHistory = (params:object) => {
  return request({
    url:"/devHistory/update",
    method:"put",
    data:qs.stringify(params)
  })
}

// 分页获取所有发展历史-时间轴
export let pagingDevHistory = (params:{ limit:number,page:number }) => {
  return request({
    url:"/devHistory/search",
    method:"get",
    params
  })
}

// 删除发展历史
export let deleteDevHistory = (params:{ id:number }) => {
  return request({
    url:"/devHistory/delete",
    method:"delete",
    params
  })
}

// 发展历史是否启用
export let enableDevHistory = (params:{id:number}) => {
  return request({
    url:"/devHistory/enableDevHistory",
    method:"put",
    data:qs.stringify(params)
  })
}
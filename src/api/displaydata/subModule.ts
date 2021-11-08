import request from '@/utils/request';
import qs from 'qs';

//  根据父模块id和引用类型获取子模块管理列表（ 级联查询 ）
export let queryTypeSubModuleList = (params:{ id :number,typeId:number }) => {
  return request({
    url:"/subModule/findSubModuleList",
    method:"get",
    params
  })
}

//  只根据父模块id获取子模块管理列表（级联查询）
export let querySubModuleList = (params:{ id :number }) => {
  return request({
    url:"/subModule/findSubModuleListByPid",
    method:"get",
    params
  })
}

//  分页获取所有子模块管理
export let pagingSubModule = (params:{ limit :number,page :number }) => {
  return request({
    url:"/subModule/search",
    method:"get",
    params
  })
}

// 查询子模块管理类型
export let findTypeSubModule = () => {
  return request({
    url:"/subModule/findType",
    method:"get",
  })
}

// 新增子模块管理
export let createSubModule = (params:object) => {
  return request({
    url:"/subModule/save",
    method:"post",
    data:params
  })
}

// 删除子模块管理
export let deleteSubModule = (params:{ id :number} ) => {
  return request({
    url:"/subModule/delete",
    method:"delete",
    params
  })
}

// 获取所有的子模块管理
export let getAllSubModule = () => {
  return request({
    url:"/subModule/getAllSubModule",
    method:"get",
  })
}

// 编辑子模块管理
export let updateSubModule = (params:object) => {
  return request({
    url:"/subModule/update",
    method:"put",
    data:qs.stringify(params)
  })
}

// 子模块管理是否启用
export let enableSubModule = (params:{id:number}) => {
  return request({
    url:"/subModule/enableSubModule",
    method:"put",
    data:qs.stringify(params)
  })
}

//  查询改变类型时，有无别的子模块与之关联
export let findChangeType = (params:{id:number,reference:number}) => {
  return request({
    url:"/subModule/findChangeType",
    method:"get",
    params
  })
}


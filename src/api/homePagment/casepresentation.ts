import request from '@/utils/request';
import qs from 'qs';

// 分页获取所有案例展示
export let pagingCaseShow = (params:{ limit:number,page:number }) => {
  return request({
    url:"/caseShow/search",
    method:"get",
    params
  })
}

// 新增案例展示
export let createCaseShow = (params:object) => {
  return request({
    url:"/caseShow/save",
    method:"post",
    data:params
  })
}

// 删除案例展示
export let deleteCaseShow = (params:object) => {
  return request({
    url:"/caseShow/delete",
    method:"delete",
    params
  })
}

// 编辑案例展示数据
export let updateCaseShow = (params:object) => {
  return request({
    url:"/caseShow/update",
    method:"put",
    data:qs.stringify(params)
  })
}

// 案例展示是否启用
export let enableCaseShow = (params:{id:number}) => {
  return request({
    url:"/caseShow/enableCaseShow",
    method:"put",
    data:qs.stringify(params)
  })
}

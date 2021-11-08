import request from '@/utils/request';
import qs from 'qs';

// 分页获取所有轮播文档
export let pagingCarouselDocument = (params:{ limit:number, page:number }) => {
  return request({
    url:"/carouselDocument/search",
    method:"get",
    params
  })
}

//  新增轮播文档
export let saveCarouselDocument = (params:object) => {
  return request({
    url:"/carouselDocument/save",
    method:"post",
    data:params
  })
}

// 删除轮播文档
export let deleteCarouselDocument = (params:{ id :number }) => {
  return request({
    url:"/carouselDocument/delete",
    method:"delete",
    params
  })
}

//  查询轮播文档类型
export let findDocumentType = () => {
  return request({
    url:"/carouselDocument/findDocumentType",
    method:"get",
  })
}

//  编辑轮播文档数据
export let updateCarouselDocument = (params:object) => {
  return request({
    url:"/carouselDocument/update",
    method:"put",
    data:qs.stringify(params)
  })
}

//  轮播文档是否启用
export let enableDocument = (params:{id:number}) => {
  return request({
    url:"/carouselDocument/enableDocument",
    method:"put",
    data:qs.stringify(params)
  })
}
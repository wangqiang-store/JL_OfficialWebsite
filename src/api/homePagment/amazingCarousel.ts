import request from '@/utils/request';
import qs from 'qs';

//  分页获取所有轮播图片
export let pagingCarouselPictures = (params:{ limit:number,page:number }) => {
  return request({
    url:"/carouselPictures/search",
    method:"get",
    params
  })
}

// 删除轮播图片
export let deleteCarouselPictures = (params:{ id:number}) => {
  return request({
    url:"/carouselPictures/delete",
    method:"delete",
    params
  })
}

//  新增轮播图片
export let createCarouselPictures = (params:object) => {
  return request({
    url:"/carouselPictures/save",
    method:"post",
    data:params
  })
}

// 编辑轮播图片数据
export let setOrderCarouselPictures = (params:object) => {
  return request({
    url:"/carouselPictures/update",
    method:"put",
    data:qs.stringify(params)
  })
}

// 轮播图片是否启用
export let enablePictures = (params:{id :number}) => {
  return request({
    url:"/carouselPictures/enablePictures",
    method:"put",
    data:qs.stringify(params)
  })
}



import request from '@/utils/request.ts';

//  获取所有模块
export let getAllModule = () => {
  return request({
    url:"/sysModule/getModule",
    method:"get"
  })
}

// 根据角色获取路由模块
export let getSide = () => {
  return request({
    url:"/sysModule/getSide",
    method:"get"
  })
}

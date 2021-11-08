import request from '@/utils/request';
import qs from 'qs';

// 获取token
export let signIn = (username:any,password:any) => {
  return request({
    url:"/sysUser/token",
    method:"get",
    params:{
      username,
      password
    },
  })
}

// 获取用户信息
export let getInfo = () => {
  return request({
    url:"/sysUser/info",
    method:"get",
  })
}

// 修改密码
export let handleUpdatePwd = (oldPwd:any,newPwd:any) => {
  return request({
    url:"/sysUser/updatePwd",
    method:"put",
    data:qs.stringify({oldPwd,newPwd})
  })
}

//  关键字分页获取所有用户
export let getAllUser = (params:object) => {
  return request({
    url:"/sysUser/search",
    method:"get",
    params
  })
}

//  用户密码是否六个月未修改(返回boolean结果,true为超过六个月没修改)
export let isUpdatePwd = (userId:any) => {
  return request({
    url:"/sysUser/isUpdatePwd",
    method:"get",
    params:{
      userId
    }
  })
}

// 添加用户
export let addUser = (params:object) => {
  return request({
    url:"/sysUser/addUser",
    method:"post",
    data:qs.stringify(params)
  })
}

// 编辑用户
export let editUser = (params:object) => {
  return request({
    url:"/sysUser/updateUser",
    method:"put",
    data:qs.stringify(params)
  })
}

//  重置用户密码
export let resetPassword = (userId:number) => {
  return request({
    url:"/sysUser/resetPassword",
    method:"put",
    data:qs.stringify({userId})
  })
}

//  用户名查重
export let checkRepeat = (params:object) => {
  return request({
    url:"/sysUser/checkRepeat",
    method:"get",
    params
  })
}

//  查询全部用户
export let selectAllUser = () => {
  return request({
    url:"/sysUser/getAllUser",
    method:"get",
  })
}

//  获取所有用户，角色是否可选根据is_enable判断
export let findAllUser = () => {
  return request({
    url:"/sysUser/getEnableUser",
    method:"get",
  })
}

// 用户是否启用
export let enableUser = (params:{ userId : number }) => {
  return request({
    url:"/sysUser/enableUser",
    method:"put",
    data:qs.stringify(params)
  })
}


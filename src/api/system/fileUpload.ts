import request from '@/utils/request';

//  文件上传
export let fileUpload = (params:object) => {
  return request({
    url:"/file/upload",
    method:"post",
    data:qs.stringify(params)
  })
}
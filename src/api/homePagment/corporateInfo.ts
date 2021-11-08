import request from '@/utils/request';
import qs from 'qs';

// 获取企业信息
export let getCompanyInfo = () => {
  return request({
    url:"/companyInfo/getPage",
    method:"get"
  })
}

// 更新企业信息
export let updateCompanyInfo = (params:object) => {
  return request({
    url:"/companyInfo/update",
    method:"put",
    data:qs.stringify(params)
  })
}

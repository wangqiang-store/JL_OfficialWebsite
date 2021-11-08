import request from '@/utils/request';

// 请求成功状态
export const RES_SUCCESS:number = 200;

// 图片基础路径
export const IMG_URL = "/file/upload";

//  批量文件上传
export const IMG_MULTI_URL = "/file/MultiUpload";

// 视频基础路径
export const VIDEO_URL = "/file/uploadVideo";

// 图片基础路径
export const IMG_File = "";

// 多文件上传
export let multiUpload = (result:any) => {
  let files = new FormData();
  if (result.length > 0) {
    result.forEach((item: any) => {
      files.append('files', item);
    });
  }
  return request({
    url:IMG_MULTI_URL,
    method:"post",
    headers: {
      'content-type': 'multipart/form-data',
    },
    data:files
  })
}

// localStorage存储数据
export let localWrite = (key:string, value:any) => {
  if (value) {
    value = JSON.stringify(value);
  }
  localStorage.setItem(key, value);
}

// localStorage读取数据
export let  localRead = (key: string) => {
  let value: string | null = localStorage.getItem(key);
  if (value && value != "undefined" && value != "null") {
      return JSON.parse(value);
  }
  return null;
}

// sessionStorage存储数据
export let sessionWrite = (key:string, value:any) => {
  if (value) {
    value = JSON.stringify(value);
  }
  sessionStorage.setItem(key, value);
}

// sessionStorage读取数据
export let  sessionRead = (key: string) => {
  let value: string | null = sessionStorage.getItem(key);
  if (value && value != "undefined" && value != "null") {
      return JSON.parse(value);
  }
  return null;
}

// 格式化时间
export function filterTime(time:any,sym:string = "-") {
    if (time== null) {
        return '';
    }
    let d = new Date(time);
    if (d.getHours() < 10) {
        var Hours: string | number = '0' + d.getHours();
    } else {
        var Hours: string | number = d.getHours();
    }
    if (d.getMinutes() < 10) {
        var Minutes: string | number = '0' + d.getMinutes();
    } else {
        var Minutes: string | number = d.getMinutes();
    }
    if (d.getSeconds() < 10) {
        var Seconds: string | number = '0' + d.getSeconds();
    } else {
        var Seconds: string | number = d.getSeconds();
    }
    return (d.getFullYear() +sym +(d.getMonth() + 1) +sym +d.getDate() + ' ' + Hours +':' + Minutes + ':' + Seconds);
}

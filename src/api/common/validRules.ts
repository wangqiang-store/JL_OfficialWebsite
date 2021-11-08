// 正整数
export let validateInt = (rule:any,value:any,callback:any) => {
  let reg:any = /^[1-9]\d*|0$/;
  if (value === '') {
    callback(new Error('内容不能为空'));
  } 
  reg.test(value.trim()) ? callback() : callback(new Error('请输入正整数'));
};

// 中文 
export let validateChinese = (rule:any,value:any,callback:any) => { 
  let reg:any = /^[\u4e00-\u9fa5]+$/;
  if(value === ''){
    callback(new Error('内容不能为空'));
  }
  reg.test(value.trim()) ? callback() : callback(new Error('请输入中文'));
}

// 不能为中文
export let validateSomeChinese = (rule:any,value:any,callback:any) => { 
  let reg:any = /^[\u4e00-\u9fa5]+$/;
  if(value === ''){
    callback(new Error('内容不能为空'));
  }
  reg.test(value.trim()) ? callback(new Error('用户名不能为中文')): callback();
}

// 电话
export let validatePhone = (rule:any,value:any,callback:any) => {
  let reg:any = /^(13[0-9]|15[0|1|3|6|7|8|9]|18[8|9])\d{8}$/;
  if(value === ''){
    callback()
  }
  reg.test(value.trim()) ? callback() : callback(new Error('电话格式不正确'))
}

// 邮箱
export let validateEmail = (rule:any,value:any,callback:any) => {
  let reg:any = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
  if(value === ''){
    callback()
  }
  reg.test(value.trim()) ? callback() : callback(new Error('邮箱格式不正确'))
}

// 下划线、英文、数字
export let validatePwd = (rule:any,value:any,callback:any) => {
  let reg:any = /^[_a-zA-Z0-9]+$/;
  if(value === ''){
    callback(new Error('内容不能为空'))
  }
  reg.test(value.trim()) ? callback() : callback(new Error('密码格式不正确'))
}



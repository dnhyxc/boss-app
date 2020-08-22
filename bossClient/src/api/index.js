// 包含N个接口请求的函数模块
// 函数返回值为：promise

// 一般获取查询数据用get请求方式，提交表单数据等使用post请求方式，
// 同时post可以做隐藏数据处理，如果需要隐藏数据要使用post方式。
// 总之要对数据进行操作，处理的情况基本使用post请求方式。

import ajax from "./ajax";

// 注册接口(将用户填写的登录信息传给ajax发送给服务端)
export const reqRegister=(user)=>ajax('/register',user,'post')

// 登录接口(将用户填写的登录信息传给ajax发送给服务端)
export const reqLogin=({username,password})=>ajax('/login',{username,password},'post')

// 更新用户接口
export const reqUpdateUser=(user)=>ajax('/update',user,'post')

// 获取用户信息、前台不需要传递参数，因为前台只需要发送get请求，
// userid这个参数后台可以通过cookie得到
// 用于处理自动登录功能的
export const reqUser=()=>ajax('/user')

// 获取用于列表(type是用户动态上传的参数)
// 用户显示老板主页显示大神列表的
export const reqUserList = (type) =>ajax('/userlist',{type})

// 获取当前用户的聊天消息列表
export const reqChatMsgList = () => ajax('/msglist')

// 修改指定消息为已读
export const reqReadMsg = (from) => ajax('/readmsg', {from}, 'POST')
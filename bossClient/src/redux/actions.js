import io from 'socket.io-client'
import {
    reqRegister,
    reqLogin,
    reqUpdateUser,
    reqUser,
    reqUserList,
    reqChatMsgList,
    reqReadMsg
} from '../api/index'
import {
    AUTH_SUCCESS, ERROR_MSG,
    RECEIVE_USER, RESET_USER,
    RECEIVE_USER_LIST,
    RECEIVE_MSG_LIST,
    RECEIVE_MSG,
    MSG_READ
} from './action-types'

/*
    单例对象：
        1，创建对象之前：判断对象是否已经存在，只有不存在才会去创建
        2，创建对象之后：保存对象
*/
function initIO(userid, dispatch) { //单例对象
    // 1，创建对象之前：判断对象是否已经存在，只有不存在才会去创建
    // 将socket创建在io中(而io是从'socket.io-client'中引入的)
    if (!io.socket) {

        // 连接服务器, 得到与服务器的连接对象
        // 2，创建对象之后：保存对象
        // 即在创建socket的同时，将socket保存在全局唯一的io中
        io.socket = io('ws://localhost:4000')

        // 绑定监听, 接收服务器发送的消息
        // 此处的io.socket是读取io中保存的socket
        // =============================================================================
        // 监听服务器端发送消息的事件名称receiveMsg，用于获取服务端响应的数据(chatMsg)
        io.socket.on('receiveMsg', function (chatMsg) {
            console.log('客户端接收服务器发送的消息', chatMsg)
            // 只有当chatMsg是与当前用户相关的消息，才去分发同步action保存消息
            // userid===chatMsg.from || userid===chatMsg.to：
            // 前者表示我发的，后者表示发给我的
            if (userid === chatMsg.from || userid === chatMsg.to) {
                // 分发接收单条聊天消息的同步action
                dispatch(receiveMsg(chatMsg, userid))
            }
        })
        /*
            注意:chatMsg中包含了：

            // 数据库中将read的状态默认设置为了false，即表示期初发送的每一条消息都是未读状态
            read: false  

            _id: "5e94d74dc71ec821c48aef1a" // 每条聊天信息的id

            from: "5e913140a3fb4f0f6c30d899" // 当前用户的userid，即我的userid

            to: 5e91541722639e22dcbdad39" // 当前目标用户的userid，即目标的userid

            content: "啊啊啊" // 聊天信息

            // 我与目标的userid进行拼接的id
            chat_id: "5e913140a3fb4f0f6c30d899_5e91541722639e22dcbdad39" 

            // 创建时间
            create_time: 1586812749397

            __v(pin): 0
        */
        // =============================================================================
    }

}

// 发送消息的异步action ===============================================

// 当chat聊天路由界面点击发送按钮后，
// 就会调用sendMsg()方法发送消息到服务端的 io 中，
// 再由服务端io接收到浏览器发送的消息后保存到ChatModel数据库中。

// 不保存在数据库，发送消息给离线的人时，
// 等到在离线的人上线后无法收到之前别人发过来的消息
// sendMsg由客户端chat路由界面(聊天页面)点击发送按钮时调用
export const sendMsg = ({ from, to, content }) => {
    return dispatch => {
        console.log('客户端向服务器发送消息', { from, to, content })

        // initIO() 不能在发送消息时调用initIO()函数，
        // 因为这样会导致自己没有发消息前，是没把发设置监听的，
        // 也就无法接收到别人发送过来的消息
        // 需要放在getMsgList()函数中调用

        // 由客户端socket发消息到服务端socket中，并保存聊天信息到数据库中
        // 因为socket保存在了全局中的io之中，所以此处可以直接使用io.socket.emit发送消息
        io.socket.emit('sendMsg', { from, to, content })
    }
    /*
    正常发送异步action写法：
        export const sendMsg=({from,to,content})=>{
            return async dispatch =>{
                const response=await reqSendMsg({from,to,content})
                const result=response.data
                if(result.code===0){
                    dispatch 同步成功action(result.data)
                }else{
                    dispatch 同步失败action(result.msg)
                }
            }
        }
    */
}
/* 
============================================================================= 
=============================================================================
    异步获取消息列表数据(从ChatModel数据库中获取，
因为所有的聊天消息都由服务端io保存到了ChatModel数据库中)。
在用户登录后立马发送获取聊天消息的请求有多种方式，分别为：
    》当用户登录成功时：login
    》当用户注册成功时：register
    》当用户实现自动登录时：getUser时(后台根据cookie信息查找一天之内登录过的用户信息)
以上三个方法中调用 getMsgList(getMsgList) 时都要传入dispatch。
    》原因在于getMsgList()方法内部并没有dispatch参数可传递，
    就只能从外部传入。
============================================================================== 
==============================================================================
*/
// 666666666666666666666666666666666666666666666666666666666666666666666666666
// ===========================================================================
// 异步获取消息列表数据
// 该方法在register、login、getUser三个异步action中调用
// 也就是说分别在注册页面，登录页面及路由主页面main这三个地方调用getMsgList方法
// 从而获取服务端返回的users 、 chatMsgs 用户聊天消息列表
async function getMsgList(userid, dispatch) { // 该函数用于获取用户聊天消息列表

    // 在此处调用initIO()用于监听服务端发送过来的消息
    // 因为getMsgList回调函数只会在用户登录成功以后才会调用，
    // 所以只要一登陆就去获取聊天信息
    initIO(userid, dispatch) //调用initIO函数，获取所有关于我的chatMsg聊天信息

    const response = await reqChatMsgList()
    // data中保存的是users(所有用户的id属性对应的username和头像的对象)
    // 和chatMsgs(所有与当前用户相关的聊天消息)
    const result = response.data
    if (result.code === 0) {
        const { users, chatMsgs } = result.data
        dispatch(receiveMsgList({ users, chatMsgs, userid }))
    }
}

// 读取消息的异步action
// 这里的from是目标id，to是当前user的id
export const readMsg = (from, to) => {
    return async dispatch => {
        const response = await reqReadMsg(from)//from指的是目标id
        const result = response.data
        if (result.code === 0) {
            // count是服务端返回的数据(count表示已读的数量)
            // res.send({code: 0, data: doc.nModified})
            const count = result.data
            dispatch(msgRead({ count, from, to }))
        }
    }
}


// =============================================================================
// =============================================================================

// 授权成功(注册或登录成功)的同步action
const authSuccess = (user) => ({ type: AUTH_SUCCESS, data: user })

// 错误提示信息的同步action
const errormsg = (msg) => ({ type: ERROR_MSG, data: msg })

// 接收用户更新成功时的同步action
const receiveUser = (user) => ({ type: RECEIVE_USER, data: user })

// 更新用户失败时的同步action
// 之所以向外暴露，是因为当用户退出登录时，
// 需要使用该方法清除用户的所有登录信息(cookie就没了，促使进入登录界面)
export const resetUser = (msg) => ({ type: RESET_USER, data: msg })

// 接收用户类表的同步action
// userList是用户动态提交的参数
const receiveUserList = (userList) => ({ type: RECEIVE_USER_LIST, data: userList })

// 接收聊天消息列表的同步action
const receiveMsgList = ({ users, chatMsgs, userid }) => ({ type: RECEIVE_MSG_LIST, data: { users, chatMsgs, userid } })

// 接收一条消息的同步action，即只接受当前用户与当前目标的相互聊天消息================================================
const receiveMsg = (chatMsg, userid) => ({ type: RECEIVE_MSG, data: { chatMsg, userid } })

// 读取过了某个聊天消息的同步action
const msgRead = ({ count, from, to }) => ({ type: MSG_READ, data: { count, from, to } })

// =============================================================================
// 异步注册action(传入的user为用户输入的注册信息)
export const register = (user) => {
    const { username, password, password2, type } = user

    // 做表单的前台验证，如果不通过，返回一个errorMsg的同步action
    // 就不会发送ajax请求得到服务端响应结果
    if (!username) {
        // 没输入用户名直接分发errormsg这个同步action
        return errormsg('用户名必须指定')
    }
    if (password !== password2) {
        // 两次密码不一致直接分发errormsg这个同步action
        return errormsg('密码不一致')
    }
    // 表单数据合法，返回一个发ajax请求的异步action函数
    return async dispatch => {
        // 发送注册的异步ajax请求
        // const promise = reqRegister(user)
        // promise.then(response => {
        //     const result = responst.data //{code:0/1,data:user,msg:''}
        // }) // 低级写法

        // 高级写法
        const response = await reqRegister({ username, password, type })
        const result = response.data
        if (result.code === 0) {//成功
            // 授权成功的同步action
            // data就是服务端返回的响应数据user code为0
            dispatch(authSuccess(result.data))

            // 由于getMsgList需要dispatch一个同步action，
            // 但是其中并没有dispatch这个参数传递，所以要从这里传入dispatch
            // 注册成功就调用该函数获取聊天消息列表
            getMsgList(result.data._id, dispatch)

        } else {//失败
            dispatch(errormsg(result.msg))
        }
    }
}

// =============================================================================
// 异步登录action(传入的user为用户输入的登录信息)
export const login = (user) => {
    const { username, password } = user

    // 做表单的前台验证，如果不通过，返回一个errorMsg的同步action
    // 就不会发送ajax请求得到服务端响应结果
    if (!username) {
        return errormsg('用户名必须指定')
    }
    if (!password) {
        return errormsg('密码必须指定')
    }
    // 表单数据合法，返回一个发ajax请求的异步action函数
    return async dispatch => {
        // 发送注册的异步ajax请求
        // const promise = reqRegister(user)
        // promise.then(response => {
        //     const result = responst.data //{code:0/1,data:user,msg:''}
        // }) // 低级写法

        const response = await reqLogin(user)
        // 获取到服务端响应回来的data(data:data)
        const result = response.data
        // 说明result是一个对象，包含了code和data
        if (result.code === 0) {//成功
            // 授权成功的同步action
            dispatch(authSuccess(result.data))

            // 登陆成功就立马获取聊天消息列表
            getMsgList(result.data._id, dispatch)

        } else {//失败
            dispatch(errormsg(result.msg))
        }
    }
}

// 更新(完善用户信息)用户信息异步action
export const updateUser = (user) => {
    return async dispatch => {
        // 得到异步ajax请求结果
        const response = await reqUpdateUser(user)
        // 该data是服务端响应回来的data()
        const result = response.data
        console.log('result', result)
        if (result.code === 0) {//更新成功：data
            // data中有username，possword，_id,post,salary,info等属性
            dispatch(receiveUser(result.data))
        } else {//更新失败：msg
            dispatch(resetUser(result.msg))
        }
    }
}

// 获取用户异步action(不需要传递参数，
// 因为服务端可以从cookie中获取userid)
// getUser用于自动登录时，发送的异步请求
export const getUser = () => {
    return async dispatch => {
        // 执行异步ajax请求，不需要传递参数
        const response = await reqUser()
        //这里的data是服务端响应回来的data(包括code，user)
        const result = response.data
        // 此时result中就包含了code和user
        if (result.code === 0) { //成功
            // 分发同步action
            // receiveUser()方法的第二个参数data(就是
            // 传入的后台data中的user)
            // result.data相当于user(得到username，_id,type，header等用户信息)
            dispatch(receiveUser(result.data))

            // 实现登陆成功后就立马获取聊天消息列表
            getMsgList(result.data._id, dispatch)

        } else { // 失败
            dispatch(resetUser(result.msg))
        }
    }
}

// 获取用户列表的异步action
// reqUserList是前后端接口
// 谁调用getUserList函数，那参数type就有谁上传
export const getUserList = (type) => {
    return async dispatch => {
        // 执行异步ajax请求
        const response = await reqUserList(type)
        const result = response.data
        // 得到结果后，分发一个同步action
        if (result.code === 0) {
            // 如果请求成功，将从服务端获取到的data(users),传递给同步action
            // 这里的data是所有相同type的集合
            dispatch(receiveUserList(result.data))
        }
    }
}




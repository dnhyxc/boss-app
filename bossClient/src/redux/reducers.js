import {
    combineReducers
} from 'redux'
import {
    AUTH_SUCCESS,
    ERROR_MSG,
    RECEIVE_USER,
    RESET_USER,
    RECEIVE_USER_LIST,
    RECEIVE_MSG_LIST,
    RECEIVE_MSG,
    MSG_READ
} from './action-types'
import {
    getRedirectTo
} from '../utils/index'
/*
    储存服务端返回的用户信息
*/

/*
    当接受到服务端的user信息以后，重定向的情况有四种，
    分别为：
        1，用户主界面路由
            》dashen: => /dashen
            》laoban: => /laoban
        2，完善信息主界面路由
            》dashen: => /dasheninfo
            》laoban: => /laobaninfo
        3,如何判断是否已经完善信息？
            》判断user.herder是否有值
            》如果header没有值，说明没有完善信息，
            因此跳转到完善信息的路由界面
        4,如何判断用户类型？
            》判断user.type
            》如果type：dashen => 跳转到：/dashen
            》如果type：laoban => 跳转到：/laoban
        5,定义一个getRedirectTo函数，用来返回对应的路径
        该函数从外部utils文件夹中引入
*/

// 定义state的初始状态
const initUser = {
    username: '', // 用户名
    type: '', // 用户类型：dashen/laoban
    msg: '', // 错误提示信息
    redirectTo: '' // 需要自动重定向的路由路径
}
// 产生user状态的reducer
function user(state = initUser, action) {
    switch (action.type) {
        case AUTH_SUCCESS: //data是user
            // 由于原来的state中保存有msg，所以获取到原来的state不好
            // 因此此处直接用最新的状态，不获取原来的state，即把...state删除
            // 即为了解决提交登录或注册表单一直有错误信息提示的内容，不管此时输入的是正确的还是依旧是错误的
            const {
                type, header
            } = action.data
            // getRedirectTo方法是从外部引入的
            return {
                ...action.data, redirectTo: getRedirectTo(type, header)
            } // 成功后自动跳转到主页面
            case ERROR_MSG: //data是msg
                return {
                    ...state, msg: action.data
                }
                // 当用户完善信息成功时返回更新后的user
                case RECEIVE_USER: //data是user
                    // data是action的第二个参数，就是服务端响应回来的user信息
                    return action.data
                case RESET_USER: //data是msg
                    // 状态使用initUser，清除原有的cookie，使其进入登录页面
                    return {
                        ...initUser, msg: action.data
                    }
                    default:
                        return state
    }
}


// =============================================================================
const initUserList = []
// 产生userlist状态的reducer(所有大神或者所有老板的列表数据)
function userList(state = initUserList, action) {
    switch (action.type) {
        case RECEIVE_USER_LIST:
            // action.data是从后台获取交到redux中管理的，
            // 对应type的所有用户列表userList
            return action.data
        default:
            return state
    }
}

// =============================================================================
const initChat = {
    // 所有用户信息的对象 属性名：userid，属性值：{username，header}
    users: {},
    // 当前用户所有相关msg的数组
    chatMsgs: [],
    // 总的未读数量，即需要显示在消息按钮上的未读数量
    unReadCount: 0
}
// 产生聊天状态的reducer
function chat(state = initChat, action) {
    switch (action.type) {
        case RECEIVE_MSG_LIST: // data{users,chatMsgs}
            const {
                users,
                chatMsgs,
                userid
            } = action.data
            return {
                users,
                // chatMsgs包含的是我(当前user)跟所有人的聊天信息
                chatMsgs,

                // 对所有不同分组的lastMsg中的unReadCount进行累加统计，
                // 得到所有分组未读消息的总unReadCount
                unReadCount: chatMsgs.reduce(
                    // preTotal为上一次累加的结果
                    (preTotal, msg) =>
                    preTotal + (!msg.read && msg.to === userid ? 1 : 0), 0)
            }

            case RECEIVE_MSG: //data:chatMsg
                const {
                    // =======================================================================
                    // 最新更改
                    chatMsg
                    // 这里不能取出userid，因为reducer中不能重复命名
                    // 因为上一个case中从action.data中使用解构赋值取出了userid，
                    // 在这里再取出userid就跟上面名字相同了
                } = action.data
                return {
                    // 表示之前的users，没有变化(
                    // 与上面case中的receiveMsgList中的users一样。)
                    users: state.users,
                        // chatMsgs包含的是我(当前user)跟所有人的聊天信息
                        // ===============================================================================
                        // 由于reducer是纯函数，不能改变原来状态的内容，所以使用三点运算符，
                        // ===============================================================================
                        // [...state.chatMsgs,chatMsg]其中三点运算符表示：
                        // 先拆解出之前的chatMsgs中所有的消息，
                        // 然后在后面再加上一个chatMsg
                        chatMsgs: [...state.chatMsgs, chatMsg],
                        // 之所以在这里取到userid是因为reducer中每个case中的不能重复命名
                        // 所以要在里面取action.data.userid，不能在外面的action.data中得到userid
                        unReadCount: state.unReadCount + (!chatMsg.read && chatMsg.to === action.data.userid ? 1 : 0)
                }

                case MSG_READ:
                    // 这里的from是目标，to是我,都是由UI组件中调用readMsg方法传递过来的参数
                    const {
                        from, to, count
                    } = action.data
                    /*
                    //  找出哪些需要改变read状态的msg。
                    //  这种写法会直接改变原来msg的值
                        》而reducer是纯函数，不能改变原有数据中的数据。
                        》如果直接改变msg中的属性，之前其他属性对msg的依赖就会改变，这样就会报错。
                        》因为已经找不到原来msg中的某个属性了
                        state.chatMsgs.forEach(msg =>{
                            if(msg.from === from && msg.to === to && !msg.read){
                                msg.read =true
                            }
                        })
                            
                    */
                    return {
                        // state.users表示上一次更新得到的users
                        users: state.users,
                            // 根据forEach遍历得到然后直接改变read的值会改变原来msg的值，会报错
                            // chatMsgs: state.chatMsgs 
                            chatMsgs: state.chatMsgs.map(msg => {
                                // msg.from代表的是目标id，msg.to代表的当前user的id
                                // 下面的if判断条件表示信息是从目标发送给我的，且是未读的
                                if (msg.from === from && msg.to === to && !msg.read) { //需要更新
                                    /*
                                    msg.read=true
                                    return msg
                                    这样做不行，因为这样就会改变以前的msg。
                                    =====即两个指向同一个引用的变量，其中一个改变了引用内部的属性，
                                        另一个得到的属性也会是改变后的。==================================
                                    在这里就不能改变原来的msg中的read属性，但是又要使read产生新的属性，就需要
                                    使用三点用算符，即可实现在不改变原来的属性的情况下得到新的状态
                                    */
                                    // 使用扩展运算符等同于使用Object.assign(msg,read:true),
                                    // 此时如果msg中有与read相同的属性时，就会被新定义的read的属性值覆盖
                                    // 也就是后面的会覆盖前面的相同属性值
                                    return {
                                        ...msg,
                                        read: true
                                    }
                                } else { //不需要更新
                                    return msg
                                }
                            }),
                            // 此时的总数量要使用上一次更新的总数量unReadCount减去当前已读的数量count
                            unReadCount: state.unReadCount - count
                    }
                    default:
                        return state
    }
}

// 向外暴露的状态的结构：{user{},userList[],chat{}}
export default combineReducers({
    user,
    userList,
    chat
})
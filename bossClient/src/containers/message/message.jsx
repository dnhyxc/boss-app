// 消息界面路由容器组件
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { List, Badge } from 'antd-mobile'

const Item = List.Item
const Brief = Item.Brief
/*
chatMsgs表示与我有关的所有聊天信息
    对chatMsgs按chat_id进行分组，并得到每个组的lastMsg组成的数组   
    1，找出每个组聊天的lastMsg，并用一个对象容器来保存{chat_id:lastMsg}
    2，得到所有lastMsg的数组，使用Object.values(lastMsgObjs)方法
    3，对数组进行排序(按create_time进行降序)
*/
function getLastMsgs(chatMsgs, userid) {
    // 1，找出每个组聊天的lastMsg，并用一个对象容器来保存{chat_id:lastMsg}
    const lastMsgObjs = {}
    // 对chatMsgs进行遍历，因为需要拿到每一个msg进行对比那条是最后的聊天记录
    chatMsgs.forEach(msg => {

        // 将从chatMsgs中遍历得到的所有msg进行统计，并且给每一个msg添加unReadCount属性，
        // 如果是别人发给我的消息，并且是未读的时，将unReadCount标记为1，否则为0
        if (msg.to === userid && !msg.read) {
            msg.unReadCount = 1
        } else {
            msg.unReadCount = 0
        }

        /*
        1，对lastMsgObjs中是否已经存在聊天信息进行判断，如果其中就有聊天信息了，
        那么此时遍历得到的这个msg就需要与lastMsgObjs中存在的聊天记录进行比较。
        看谁的create_time是更大的，则就是lastMsg
        2，如果lastMsgObjs中还没有聊天消息，那么说明遍历得到的当前msg就是第一条，
        也是最后一条
        */
        // 得到msg的聊天标识id。
        // 单个msg是我与当前目标的聊天信息，就是单个chatMsg
        const chatId = msg.chat_id //chatMsgs中保存有chat_id
        // 找出lastMsgObjs中已经保存的当前组的lastMsg(可能有，可能没有)
        const lastMsg = lastMsgObjs[chatId]
        // 对lastMsgObjs对象中获取得到的lastMsg有无进行判断
        if (!lastMsg) { // 没有
            // 此时说明msg就是当前组的lastmsg，
            // 即使用对象的形式进行键值对匹配的形式进行保存 ：
            // lastMsgObjs{chat_id：msg}
            lastMsgObjs[chatId] = msg
        } else { // 有
// =======================================================================================
            // 累加unReadCount = 已经统计的(lastMsgObjs中已经存在的) + 当前msg的
            // 即为将同一个消息列表中之前未读的消息lastMsg.unReadCount，
            // 再加上后来发的每一条消息msg.unReadCount就是当前聊天消息列表的所有未读消息
            const unReadCount = lastMsg.unReadCount + msg.unReadCount

            // 如果msg比lastMsg晚，就将msg保存为lastMsg
            if (msg.create_time > lastMsg.create_time) {
                lastMsgObjs[chatId] = msg
            }

            // 累加unReadCount并保存在最新的lastMsg上
            // 保存的unReadCount必须在最终确定的lastMsg上。
            // 向每一条不同的最终确定的lastMsg中添加unReadCount属性，
            // unReadCount属性值就是未读信息的数量
            lastMsgObjs[chatId].unReadCount = unReadCount
// =======================================================================================
        }
    });
    // 2，使用Object.values方法得到所有lastMsg的数组
    const lastMsgs = Object.values(lastMsgObjs)
    // 3，对数组进行排序(按create_time进行降序)
    lastMsgs.sort(function (m1, m2) { // 如果结果<0,则m1在前面，>0则m2在前面，=0则位置不变
        return m2.create_time - m1.create_time
    })
    // 函数的最后将所有LastMsgs返回
    // lastMsgs中包含：from、to、content、unReadCount四个属性
    return lastMsgs
}

class Message extends Component {
    render() {
        const { user } = this.props
        // users是又有的用户id与username即header的集合对象
        // chatMsgs包含from,to,content,chat_id(from与to拼接的id),create_time
        const { users, chatMsgs } = this.props.chat

        // 直接写成getLastMsgs意思是定义在Message组件的外部。
        // this.getLastMsgs表示定义在组件的内部
        // lastMsgs表示调用函数得到的所有最后一条聊天消息的数组
        const lastMsgs = getLastMsgs(chatMsgs, user._id)

// ===================================================================================
        // 统计所有lastMsgs中未读数量总数
        // 该未读总数需要在nav—footer组件中使用
        let count=0
        lastMsgs.forEach(msg=>{
            count += msg.unReadCount
        })
        console.log(count+'count')
    // 注意：该未读总数已经在reducer中统计好了，这里可以不需要了
// ===================================================================================

        return (
            <List style={{ marginTop: 50, marginBottom: 50 }}>
                {
                    // 遍历得到每一条lastMsg(就是我与每个不同目标的最后一条聊天消息)
                    lastMsgs.map(msg => {
                        // 本来from是代表我的id，而to是代表我的目标的id
                        // 如果msg.to等于我的id时：则表示当前我要发消息的目标的id就是from，否则就是to
                        // 得到targetUserId，就代表目标id
                        const targetUserId = (msg.to === user._id) ? msg.from : msg.to
                        // 得到targetUser，表示目标用户的信息
                        // targetUser中包含有目标用户的username以及header
                        const targetUser = users[targetUserId]
                        return (
                            <Item
                                key={msg._id}
                                // text={msg.unReadCount}用于显示未读信息的数量
                                extra={<Badge text={msg.unReadCount} />}
                                // 用来显示头像
                                thumb={targetUser.header ? require(`../../assets/images/${targetUser.header}.png`) : require('../../assets/images/头像1.png')}
                                arrow='horizontal'
                                onClick={() => this.props.history.push(`/chat/${targetUserId}`)}
                            >
                                <Brief>{targetUser.username}</Brief>
                                {msg.content}
                            </Item>
                        )
                    })
                }
            </List>
        )
    }
}
export default connect(
    state => ({ user: state.user, chat: state.chat }),
)(Message)
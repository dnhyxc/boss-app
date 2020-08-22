import React, { Component } from 'react'
import { connect } from 'react-redux';

// import QueueAnim from 'rc-queue-anim';

import { NavBar, List, InputItem, Grid, Icon } from 'antd-mobile';
import { sendMsg, readMsg } from '../../redux/actions';

const Item = List.Item

class Chat extends Component {

    state = {
        content: '',
        isShow: false //是否显示表情列表
    }

    // 在第一次render()之前调用
    componentWillMount() {
        // 初始化表情列表数据
        const emojis = ['😁', '😁', '😁', '😁', '😁', '😁', '😁', '😁', '😁', '😁', '😁', '😁', '😁'
            , '😁', '😁', '😁', '😁', '😁', '😁', '😁', '😁', '😁', '😁', '😁'
            , '😁', '😁', '😁', '😁', '😁', '😁', '😁', '😁', '😁', '😁', '😁'
            , '😁', '😁', '😁', '😁', '😁', '😁', '😁', '😁', '😁', '😁', '😁']
        this.emojis = emojis.map(emoji => ({ text: emoji }))
    }

    componentDidMount() {
        // 初始显示列表
        window.scrollTo(0, document.body.scrollHeight)
    }

    componentDidUpdate() {
        // 更新显示列表
        window.scrollTo(0, document.body.scrollHeight)
        document.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount() { // 在退出之前
        // 发请求更新消息的未读状态
        // from是目标用户的id
        const from = this.props.match.params.userid
        // to是当前用户自己的id(我的id)
        const to = this.props.user._id
        const {unReadCount}=this.props.chat
        // 只有当unReadCount不为0时才调用readMsg发起异步请求
        if(unReadCount!==0){
            this.props.readMsg(from, to)
        } 
    }

    toggleShow = () => {
        const isShow = !this.state.isShow
        this.setState({ isShow })
        if (isShow) {
            // 异步手动派发resize事件，解决表情列表显示的bug
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'))
            }, 0)
        }
    }



    // 当点击发送消息的时候，收集数据，并且将收集到的数据发送到服务器中
    handleSend = () => {
        // 收集数据

        // 代表当前发送消息的用户的userid(保存在redux中)
        const from = this.props.user._id
        // 此处写userid的原因在于main中在映射Chat路由的时候指定了动态的路径
        // '/chat/:userid'
        const to = this.props.match.params.userid
        const content = this.state.content.trim()

        // 发送请求(发消息)
        // 如果输入框中有值，就调用sendMsg发送异步请求
        if (content) {
            // 使用sendMsg使用客户端的io向服务端io发送聊天信息{from,to,content}
            // 再由服务端io监听接收到客户端io发送的消息，并保存到数据库
            this.props.sendMsg({ from, to, content })
        }

        // 消息发送完毕以后，清除输入框的内容数据
        // 在此isShow:false用于处理点击表情直接发送时表情列表不会自定隐藏的问题
        this.setState({ content: '', isShow: false })

    }

    onKeyDown = (e) => {
        if (e.keyCode === 13) {
            this.handleSend()
        }
    }



    render() {
        const { user } = this.props
        // console.log(user._id)
        // chatMsgs包含的是我(当前user)跟所有人的聊天信息
        // chatMsgs中包含有{from,to,content,chat_id,create_time}
        const { users, chatMsgs } = this.props.chat
        // 计算当前聊天的chatid
        const meId = user._id  //当前用户自己的userid

        // 如果还没有异步获取到数据（users,chatMsgs），直接不做任何显示
        // ===========================================================================
        // ===========================================================================
        // 原因在于在初始化渲染时，不会触发上面的handleSend函数调用发送异步请求
        // 需要在第二次渲染时才会调用挂载的方法发送异步请求
        if (!users[meId]) { //users[meId]表示的是user的username和header
            return null
        }

        //与当前用户聊天的目标id
        const targetId = this.props.match.params.userid
        const chatId = [meId, targetId].sort().join('_')

        // 对chatMsgs进行过滤，
        // 把与我当前与之聊天的人之外的所有别的人的聊天记录过滤掉
        // 注意：msgs要分别区分我发给别人的，和别人发给我的，
        // 因为这两种情况显示的位置不一样，别人显示在左边，我的显示在右边
        // msgs表示我与目标的所有chatMsgs
        const msgs = chatMsgs.filter(
            // chatMsgs中包含有{from,to,content,chat_id,create_time}
            msg => msg.chat_id === chatId // chatId当前我的id与目标id拼接起来的
        )

        // 【【【users就是所有用户的ID对应的username和header的对象】】】。
        // 根据users{}以及targetId得到目标用户的header
        const targetHeader = users[targetId].header
        // 得到目标用户的header图片对象(因为同一个人的头像只需要加载一次，所以在循环外面加载)
        const targetIcon = targetHeader ? require(`../../assets/images/${targetHeader}.png`) : null

        // 获取我的头像
        const myHeader = users[meId].header
        const myIcon = myHeader ? require(`../../assets/images/${myHeader}.png`) : null

        // 获取对象的username
        const targetUsername = users[targetId].username

        return (
            <div id='chat-page'>
                <NavBar
                    className='sticky-header'
                    // 添加左边回退箭头
                    icon={<Icon type="left" />}
                    // 为回退箭头添加点击事件，点击后回退一步
                    onLeftClick={() => this.props.history.goBack()}
                >
                    {targetUsername}
                </NavBar>
                {/* 使聊天区内容部分不会被上下导航条挡住 */}
                <List style={{ marginTop: 50, marginBottom: 50 }}>
                    {/* alpha left right top bottom scale scaleBig scaleX scaleY */}
                    {
                        msgs.map(msg => {

                            // 当我的id与to(目标)相同时，即表示消息是发给我的
                            // 也可写成targetId === msg.from 表示我的目标发过来的信息
                            // 因为我是from 目标是to
                            if (meId === msg.to) { //表示对方发给我的信息
                                return (
                                    // targetIcon表示目标头像
                                    <Item key={msg._id} className='chat-target'>
                                        <div className='chat-box1'>
                                            <div className='Icon-box1'><img className='img-wrap' src={targetIcon} alt='' /></div>
                                            <div className='msg-box1'>{msg.content}</div>
                                            <div className='circle-right'></div>
                                        </div>
                                    </Item>
                                )
                            } else { // 表示我发给对方的 此时就是myId===from
                                return (
                                    <Item key={msg._id} className="chat-me" >
                                        <div className='chat-box'>
                                            <div className='msg-box'>{msg.content}</div>
                                            <div className='circle-right'></div>
                                            <div className='Icon-box'><img className='img-wrap' src={myIcon} alt='' /></div>
                                        </div>
                                    </Item>
                                )
                            }
                        })
                    }
                </List>
                <div className='am-tab-bar'>
                    <InputItem
                        placeholder="请输入"
                        // 当content的值更新变成空串以后，
                        // 输入框需要读取这个空串来更新输入框的内容为空
                        value={this.state.content}
                        // 将输入框的值赋值给空串content，使其拥有用户输入的内容
                        /* onChange={val => {this.handleChange('content',val)}} 
                        然后在handleChange中更新数据：this.setState({ [content]: val })
                        给content加上中括号表示动态的进行赋值，此处只有一个可不加[ ]*/
                        onChange={val => { this.setState({ content: val }) }}
                        // onFocus用于获取输入框的焦点，isShow为false表示表情不显示
                        onFocus={() => this.setState({ isShow: false })}
                        extra={
                            <span>
                                <span onClick={this.toggleShow} style={{ marginRight: 12 }}>😁</span>
                                {/* 实现点击发送与回车键发送 */}
                                <span onClick={this.handleSend} onKeyDown={this.onKeyDown}>发送</span>
                            </span>
                        }
                    />

                    {this.state.isShow ? (
                        <Grid
                            data={this.emojis}
                            columnNum={8} // 表示网格有8列
                            carouselMaxRow={4} // 表示网格有4行
                            isCarousel={true} // 是否轮播
                            onClick={(item) => {
                                this.setState({ content: this.state.content + item.text })
                            }}
                        />
                    ) : null}
                </div>
            </div>
        )
    }
}
export default connect(
    state => ({ user: state.user, chat: state.chat }),
    { sendMsg, readMsg }
)(Chat)

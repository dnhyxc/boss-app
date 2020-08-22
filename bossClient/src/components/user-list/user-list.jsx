// 显示指定用户列表的UI组件
import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { WingBlank, WhiteSpace, Card } from 'antd-mobile';
import {withRouter} from 'react-router-dom'
import QueueAnim from 'rc-queue-anim';
const Header = Card.Header
const Body = Card.Body

class UserList extends Component {
    static propTypes = {
        userList: PropTypes.array.isRequired
    } // 对从父组件获取的userList进行类型及必要性限制
    render() {
        // 从父组件获取的userList
        const { userList } = this.props
        return (
            <WingBlank style={{marginBottom:50,marginTop:50}}>
                <QueueAnim type='scale'>
                {
                    // 将userList中的所有类容遍历以列表的形式显示出来
                    userList.map(user => (
                        // 注意：如果当前遍历的元素有自己的唯一标识，
                        // 那就尽量是用他自己的标识，如果没有，那就是用index代替
                        <div key={user._id}>
                            <WhiteSpace />
                            {/* 当某个userList被点击时，跳转到当前用户所对应的userid的聊天列表中*/}
                            <Card onClick={()=>this.props.history.push(`/chat/${user._id}`)}>
                                <Header
                                    // 如果头像有，就显示，没有就显示默认的
                                    // 注意：如果遇到有些东西有的有，有的没有的时候，就需要使用三元运算符进行判断
                                    // 有的就显示自己的，没有的就显示默认的
                                    thumb={user.header ? require(`../../assets/images/${user.header}.png`) :require('../../assets/images/头像1.png')}
                                    extra={user.username}
                                />
                                <Body>
                                    <div>职位：{user.post}</div>
                                    {/* 大神用户是没有company和salary的，所有需要进行判断*/}
                                    {user.company?<div>公司：{user.company}</div>:null}
                                    {user.salary?<div>公司：{user.salary}</div>:null}
                                    <div>描述：{user.info}</div>
                                </Body>
                            </Card>
                        </div>
                    ))
                }
                </QueueAnim>
            </WingBlank>
        )
    }
}
// 由于需要使用router的方法：this.props.history.push()
// 所以需要包装成路由组件
export default  (withRouter(UserList))

// 大神主界面路由容器组件

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getUserList } from '../../redux/actions';

import UserList from '../../components/user-list/user-list';

class Dashen extends Component {
    /*
    当需要初始化后直接显示内容时：
        》就需要在componentDidMount发送ajax异步请求等副作用操作
    
    当需要点击按钮或者在其他行为触发ajax发送请求时:
        》此时可以事件触发函数中发送ajax异步请求
    */
    componentDidMount() {
        // 获取userList
        //接口及actions中的type参数，这里传递的实参是：laoban
        this.props.getUserList('laoban')
    }
    render() {
        return (
            <div>
                <UserList userList={this.props.userList} />
            </div>
        )
    }
}
export default connect(
    // 大神主界面userList获取到的就是所有laoban的用户列表
    state => ({ userList: state.userList }),
    { getUserList }
)(Dashen)

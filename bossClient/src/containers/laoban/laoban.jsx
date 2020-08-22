// 老板主界面路由容器组件

import React, { Component } from 'react'
import { connect } from 'react-redux'
import {getUserList} from '../../redux/actions';

import UserList from '../../components/user-list/user-list';

class Laoban extends Component {
    /*
    当需要初始化后直接显示内容时：
        》就需要在componentDidMount发送ajax异步请求等副作用操作
    
    当需要点击按钮或者在其他行为触发ajax发送请求时:
        》此时可以在事件回调函数中发送ajax异步请求
    */ 
    componentDidMount(){
        // 获取userList
        // 接口及actions中的type参数，这里传递的实参是：dashen
        // 此为老板页面，即获取所有dashen用户的列表
        this.props.getUserList('dashen') 
    }
    render() {
        return (
            <div>
                {/* 将得到的大神列表传给子组件 */}
                <UserList userList={this.props.userList}/>
            </div>
        )
    }
}
export default connect(
    // userList 就是action中定义的data形参的值
    // 而userList的实参是从后台获取的result.data(是就是users)
    state=>({userList:state.userList}),
    {getUserList}
)(Laoban)

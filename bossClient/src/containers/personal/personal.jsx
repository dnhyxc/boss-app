// 个人中心界面路由容器组件
import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Result, List, WhiteSpace, Button, Modal } from 'antd-mobile'
import Cookies from 'js-cookie';

import { resetUser } from '../../redux/actions';

const Item = List.Item
const Brief = Item.Brief

class Personal extends Component {
  logout = () => {
    Modal.alert('退出', '确认退出登陆吗？', [
      {
        text: '取消',
      },
      {
        text: '确认',
        onPress: () => {
          // 去除cookie中的userid
          Cookies.remove('userid')
          // 去除redux管理的user
          // 调用resetUser方法，使state的值为初始值，
          // 这样用户信息就没有了，会直接去登录界面，
          // 因为在main中进行判断了，如果cookie中没有userid，就直接去登陆页面
          // 当按下退出按钮时，将当前user的所有登录信息的值更新为初始化状态(都为空)
          this.props.resetUser()
        }
      }
    ])
  }
  render() {
    const { username, info, header, company, post, salary } = this.props.user
    return (
      <div style={{ marginBottom: 50, marginTop: 50 }}>
        <Result
          img={<img src={require(`../../assets/images/${header}.png`)} style={{ width: 50 }} alt="header" />}
          title={username}
          message={company}//如果没有值，将不会显示该内容
        />
        <List renderHeader={() => '相关信息'}>
          <Item multipleLine>
            <Brief>职位: {post}</Brief>
            <Brief>简介: {info}</Brief>
            {salary ? <Brief>薪资: {salary}</Brief> : null}
          </Item>
        </List>
        <WhiteSpace />
        <List>
          <Button type='warning' onClick={this.logout}>退出登录</Button>
        </List>
      </div>
    )
  }
}
export default connect(
  state => ({ user: state.user }),
  // resetUser，该action返回的data为msg，
  // state为初始化的值(所有属性为空)
  { resetUser }
)(Personal)

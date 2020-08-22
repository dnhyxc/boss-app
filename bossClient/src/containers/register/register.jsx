// 注册路由组件
import React, { Component } from 'react'
import Logo from '../../components/logo/logo'
import{connect} from 'react-redux'
import {register} from '../../redux/actions'
import {Redirect} from 'react-router-dom';
import {
    NavBar,
    WingBlank,
    List,
    InputItem,
    WhiteSpace,
    Radio,
    Button
} from 'antd-mobile';
const ListItem=List.Item


class Register extends Component {
    state={
        username:'', //用户名
        password:'', //密码
        password2:'', //确认密码
        type:'laoban', //用户类型名称 dasheng/laoban
    }

    // 更新状态
    handleChange=(name,val)=>{
        this.setState({
            [name]:val // 属性名不是name，而是name变量的值
        })
    }

    // 点击注册调用
    register=()=>{
        // console.log(this.state)
        // 当点击注册时，触发dispatch分发action，
        // 并将表单数据传给action的第二个参数data。
        this.props.register(this.state)
    }

    toLogin=()=>{
        this.props.history.replace('./login')
    }

    render() {
        // 获取type属性的状态，为后面勾选dashen或老板做准备
        const {type}=this.state
        const {msg,redirectTo}=this.props.user
        // 如果redirectTo有值，就需要重定向到指定的路由
        // redirectTo是动态的，所以要写成大括号的形式
        if(redirectTo){
            return <Redirect to={redirectTo}/>
        }
        return (
            <div>
                <NavBar>boss&nbsp;直&nbsp;聘</NavBar>
                <Logo/>
                <WingBlank>
                    <List>
                        {msg?<div className="error-msg">{msg}</div>:null}
                        <WhiteSpace />
                        <InputItem placeholder='请输入用户名' onChange={val=>{this.handleChange('username',val)}}>用户名:</InputItem>
                        <WhiteSpace />
                        <InputItem placeholder='请输入密码' type="password" onChange={val=>{this.handleChange('password',val)}}>密&nbsp;&nbsp;&nbsp;码:</InputItem>
                        <WhiteSpace />
                        <InputItem placeholder='请输入确认密码' type="password" onChange={val=>{this.handleChange('password2',val)}}>确认密码:</InputItem>
                        <WhiteSpace />
                        <ListItem>
                            <span>用户类型:</span>
                            &nbsp;&nbsp;&nbsp;
                            {/* 当checked的值为true，则显示大神勾选 */}
                            <Radio checked={type === 'dashen'} onChange={()=>{this.handleChange('type','dashen')}}>大神</Radio>
                            &nbsp;&nbsp;&nbsp;
                            {/* 当checked的值为true，则显示laoban勾选 */}
                            <Radio checked={type === 'laoban'} onChange={()=>{this.handleChange('type','laoban')}}>老板</Radio>
                        </ListItem>
                        <WhiteSpace />
                        <Button type="primary" onClick={this.register}>注&nbsp;&nbsp;&nbsp;册</Button>
                        <WhiteSpace />
                        <Button onClick={this.toLogin}>已有账户</Button>
                    </List>
                </WingBlank>
            </div>
        )
    }
}
export default connect(
    state=>({user:state.user}),
    {register}
)(Register)

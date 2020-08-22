// 注册路由组件
import React, { Component } from 'react'
import Logo from '../../components/logo/logo'
import{connect} from 'react-redux'
import {login} from '../../redux/actions'
import {Redirect} from 'react-router-dom';
import {
    NavBar,
    WingBlank,
    List,
    InputItem,
    WhiteSpace,
    Button
} from 'antd-mobile';



class Login extends Component {
    state={
        username:'', //用户名
        password:'', //密码
    }

    login=()=>{
        this.props.login(this.state)
    }

    // 更新状态
    handleChange=(name,val)=>{
        this.setState({
            [name]:val // 属性名不是name，而是name变量的值
        })
    }

    toregister=()=>{
        this.props.history.replace('./register')
    }

    render() {
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
                        <Button type="primary" onClick={this.login}>登&nbsp;&nbsp;&nbsp;陆</Button>
                        <WhiteSpace />
                        <Button onClick={this.toregister}>没有账户？</Button>
                    </List>
                </WingBlank>
            </div>
        )
    }
}
export default connect(
    state=>({user:state.user}),
    {login}
)(Login)

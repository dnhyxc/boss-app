import React, { Component } from 'react'
import { connect } from 'react-redux'
import {NavBar,InputItem,Button,TextareaItem} from 'antd-mobile'
import HeaderSelector from '../../components/header-selector/header-selector';
import {Redirect} from 'react-router-dom'
import {updateUser} from '../../redux/actions'

class DashenInfo extends Component {
    state={
        header: '',
        post:'',
        info:''
    }

    // 更新header状态
    // 参数header为子组件HeaderSelector调用时传入的text
    // 当子组件调用之后，header就会有对应的值，此时header的直接不是空字符串了
    setHeader=(header)=>{
        this.setState({
            // 此时的header就是子组件调用setHeader传递的text
            header //是header:header的简写
        })
    }

    handleChange=(name,value)=>{
        this.setState({
            [name]:value
        })
    }

    save=()=>{
        // 调用updateUser触发action发送ajax请求
        // 提交的表单参数为：header：text(头像1-20）、post、info
        this.props.updateUser(this.state)
    }
    render() {
        // 如果信息已经完善，自动重定向到对应的主界面
        const {header,type}=this.props.user
        // 对header和type进行判断，根据这两个信息，
        // 自动跳转到指定的路由界面
        if(header){
            // 判断如果header有值，则从定向
            const path = type === 'dashen'?'/dashen':'/laoban'
            // 从定向到指定的url地址
            return <Redirect to={path}/>
        }
        // ====================================================================
        // 如果进入上面的if就不会进入下面的return了，直接会跳转到对应的路由界面
        // ====================================================================
        return (
            <div>
                <NavBar>大神信息完善</NavBar>
                {/* 将setHeader方法传递给子组件HeaderSelector调用，用于改变header
                的状态 */}
                <HeaderSelector setHeader={this.setHeader}/>
                <InputItem placeholder="请输入求职岗位"
                 onChange={val=>{this.handleChange('post',val)}}>求职岗位:</InputItem>
                <TextareaItem title="个人介绍:" rows={3} 
                onChange={val=>{this.handleChange('info',val)}}/>
                <Button type="primary" onClick={this.save}>保&nbsp;&nbsp;&nbsp;存</Button>
            </div>
        )
    }
}
export default connect(
    state => ({user:state.user}),
    {updateUser}
)(DashenInfo)
import React, { Component } from 'react'
import { connect } from 'react-redux'
import {NavBar,InputItem,TextareaItem,Button} from 'antd-mobile'
import HeaderSelector from '../../components/header-selector/header-selector';
import {updateUser} from '../../redux/actions'
import {Redirect} from 'react-router-dom'

class LaobanInfo extends Component {
    state={
        header: '',
        post:'',
        info:'',
        company:'',
        salary:''
    }

    // 更新header状态
    // 参数header为子组件HeaderSelector调用时传入的text
    setHeader=(header)=>{
        this.setState({
            header
        })
    }

    handleChange=(name,value)=>{
        this.setState({
            [name]:value
        })
    }

    save=()=>{
        // console.log(this.state)
        // 使用updateUser这个action发送异步请求获取服务端响应结果
        this.props.updateUser(this.state)
    }

    render() {
        // 如果信息已经完善，自动重定向到对应的主界面
        const {header,type}=this.props.user
        // 根据服务端响应回来的user信息
        // 对header和type进行判断，根据这两个信息，
        // 自动跳转到指定的路由界面
        if(header){
            // 判断如果header有值，则从定向
            const path = type === 'dashen'?'./dashen':'/laoban'
            return <Redirect to={path}/>
        }
        // ====================================================================
        // 初始化渲染界面时，如果进入上面的if，
        // 就不会进入下面的return了，直接会跳转到对应的路由界面
        // ====================================================================
        return (
            <div className='box'>
                <NavBar>老板信息完善</NavBar>
                <div className="box2">
                {/* 用于显示头像及有无头像时显示对应的文本内容 */}
                <HeaderSelector setHeader={this.setHeader}/>
                <InputItem placeholder="请输入招聘职位" 
                onChange={val=>{this.handleChange('post',val)}}>招聘职位:</InputItem>
                <InputItem placeholder="请输入公司名称" 
                onChange={val=>{this.handleChange('company',val)}}>公司名称:</InputItem>
                <InputItem placeholder="请输入职位薪资" 
                onChange={val=>{this.handleChange('salary',val)}}>职位薪资:</InputItem>
                <TextareaItem title="职位要求:" rows={3} 
                onChange={val=>{this.handleChange('info',val)}}/>
                </div>
                <Button type="primary" onClick={this.save}>保&nbsp;&nbsp;&nbsp;存</Button>
            </div>
        )
    }
}
export default connect(
    // 该user就是服务端响应回来的数据
    state => ({user:state.user}),
    // 该方法用于异步向服务端发送ajax请求，
    // 让服务端响应回data(完善信息后的user)
    // updateUser需要从UI组件中获取ajax请求所需要的参数（this.state），
    // 所以要在UI组件中调用该方法。
    {updateUser}
)(LaobanInfo)

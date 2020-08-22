import React, { Component } from 'react'
import {List,Grid} from 'antd-mobile'
import PropTypes from 'prop-types'

export default class HeaderSelector extends Component {
    static propTypes={
        setHeader:PropTypes.func.isRequired
    }

    state={
        icon:null // 图片对象，默认没有值
    }

    constructor(props){
        super(props)
        // 准备需要显示的列表数据
        // 将20张图片保存在headerList中用于在Grid网格标签中显示
        this.headerList=[]
        for (let i = 0; i < 20; i++) {
            this.headerList.push({
                text:'头像'+(i+1),
                icon: require(`../../assets/images/头像${i+1}.png`)//不能使用import
            })
        }
        // this.headerList保存的是所有的20张图片
        // console.log(this.headerList)     
    }
    
    // 当触发onClick事件后，将选中的对应icon索引的内容
    // 从headerList中提取出来，作为handleClick的第二个参数的实参
    handleClick=({text,icon})=>{
        // 更新当前组件状态
        this.setState({icon})
        // 调用函数更新父组件状态
        // 用于当父组件提交表单数据时，使header有对应的值(text)
        this.props.setHeader(text)
    }

    render() {
        const {icon}=this.state
        // 当没有icon(头像)时显示“请选择头像”，否则显示下面的
        const listHeader=!icon?'请选择头像':(
            <div>
                已选头像:<img src={icon} alt=""/>
            </div>
        )
        return (
            // 用于显示头部界面(头像以及文本)，文本根据是否有头像进行对应的显示
            <List renderHeader={()=>listHeader}>
                {/* 将20张头像都初始化显示在网格中 */}
                <Grid data={this.headerList} columnNum={5}
                // 点击哪张图片，就会根据其对应的索引显示对应的头像
                onClick={this.handleClick}/>
            </List>
        )
    }
}

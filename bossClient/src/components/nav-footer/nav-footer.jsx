import React, { Component } from 'react'
import { TabBar } from 'antd-mobile';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

const Item = TabBar.Item

// 希望在非路由组件中使用路由库的api？
// 使用withRouter()
class NavFooter extends Component {

    static propTypes = {
        navList: PropTypes.array.isRequired,
        unReadCount:PropTypes.number.isRequired
    }

    render() {
        let { navList , unReadCount} = this.props

        // 过滤掉hide为true的nav
        // 因为navList是数组，第一个是laoban路由，对应显示大神按钮，
        // 第二个是dashen路由，对应显示老板按钮
        // 当type是老板时，显示的就是laoban路由的界面，
        // 此时需要把老板按钮过滤掉(即将dashen路由过滤掉)
        navList=navList.filter(nav => !nav.hide)
        const path = this.props.location.pathname
        return (
            <TabBar>
                {
                    navList.map((nav) => (
                        <Item key={nav.path}
                            // 设置，只有navList为message时，才显示消息有没有读的提示
                            // 除了message，其他不显示
                            badge={nav.path==='/message'?unReadCount:0}
                            title={nav.text}
                            // require是commonJS语法
                            // 未选中时的图标显示
                            icon={{ uri: require(`./images/${nav.icon}.png`) }}
                            // 选中时的图标显示
                            selectedIcon={{ uri: require(`./images/${nav.icon}-selected.png`) }}
                            // 当loaction中的url与navList中的url相同时，设置为选中状态
                            // 选中时，显示selectedIcon的图片，否则显示icon中的图片
                            selected={path === nav.path}
                            // 设置跳转到当前路径页面
                            // 当按钮按下时设置需要跳转到的路由界面
                            // 哪个被按下时，哪个就触发onPress事件跳转到所对应的路径路由
                            onPress={() => this.props.history.replace(nav.path)}
                        />
                    ))
                }
            </TabBar>
        )
    }
}
// 向外暴露NavFooter()包装产生的组件，使非路由组件可使用路由组件的API
// 内部会向组件传入路由特有的属性：history、location、math
export default withRouter(NavFooter)

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Switch, Route, Redirect } from 'react-router-dom';
import {NavBar} from 'antd-mobile';

import DashenInfo from '../dashen-info/dashen-info';
import LaobanInfo from '../laoban-info/laoban-info';
import Dashen from '../dashen/dashen';
import Laoban from '../laoban/laoban';
import Message from '../message/message';
import Personal from '../personal/personal';
import NotFound from '../../components/not-found/not-found';
import NavFooter from '../../components/nav-footer/nav-footer';
import Chat from '../chat/chat';
import { getRedirectTo } from '../../utils'
import { getUser } from '../../redux/actions'

// 可以操作前端cookie对象。set()设置/get()获取/remove()移除
import Cookies from 'js-cookie'

class Main extends Component {

    // 给组件对象添加属性
    navList = [ // 包含所有导航组件的相关信息数据
        {
            path: '/laoban', // 路由路径
            component: Laoban,
            title: '大神列表',
            icon: 'dashen', // 显示type是dashen的
            text: '大神'
        },
        {
            path: '/dashen', // 路由路径
            component: Dashen,
            title: '老板列表',
            icon: 'laoban', // 显示type是laoban的
            text: '老板',
        },
        {
            path: '/message', // 路由路径
            component: Message,
            title: '消息列表',
            icon: 'message',
            text: '消息',
        },
        {
            path: '/personal', // 路由路径
            component: Personal,
            title: '用户中心',
            icon: 'personal',
            text: '个人',
        }
    ]

    /*
    【【【实现自动登录功能】】】
    1，componentDidMount()中做以下实现：(发送异步请求等副作用操作需要挂载在此方法中)
    注意：componentDidMount中挂载的异步ajax请求在初始化渲染时不会生效，
        【【【【【【要在初始化之后，即第二次render之后才会生效】】】】】-------------
        => 1），登陆过(cookie中有userid，因为cookie在后台设置了能保存一天)，
            但此时还没有登录上时(redux管理的user中没有_id，
            说明服务端没有响应给客户端数组库中保存的user信息)，
            就需要【【【发送ajax请求】】】获取对应的user，没获取到user时暂时不做任何展示。
            【初始化渲染不会发送请求，要在DidMount之后发送，所以初始化的时候页面没有内容】
    2，render()中做以下实现：
        》1），如果cookie中没有userid，自动进入login界面
        》2），判断redux管理的user中是否有_id，如果没有，暂时不做任何显示(发送ajax之后就会有)
        》3），如果有，说明当前用户已经登录，显示对应的界面
        》4），如果已经登录了，但是请求的是main根路径：
            则根据user的type和header来计算出一个重定向的路由路径，并自动重定向
    */

    componentDidMount() {
        /*
        》登陆过(cookie中有userid)，
            》但此时还没有登录上时(redux管理的user中没有_id，
            说明服务端没有响应给客户端数组库中保存的user信息)，
            就需要发请求获取对应的user，没获取到user信息时暂时不做任何展示
        */
        const userid = Cookies.get('userid') //获取cooike信息
        const { _id } = this.props //通过redux中传递过来的
        //表示有userid同时redux管理的user信息中没有_id
        if (userid && !_id) { 
            // 发送异步请求，获取user
            // console.log('发送ajax请求获取user')
            // 触发异步ajax发送异步请求，让服务器根据id获取user
            // 不需要传入参数，因为服务端中可以自己从cookie中获得userid
            this.props.getUser()
            // 以下redux中就有userid了，
            // 服务端向浏览器发送了code===0，
            // 表明用户已经登录了
        }
    }
    // 66666666666666666666666666666666666666666666666666666666666666666666666666
    // ==========================================================================
    // 当使用getUser()发送过请求之后，redux中的user信息就发生了改变，
    // 此时就会进行render重新渲染组件
    // 组件的特性就是一但状态发生改变了，就会重新进行render渲染页面
    // ==========================================================================
    // 66666666666666666666666666666666666666666666666666666666666666666666666666
    render() {
        // 【【【情况一没有cookie】】】
        // 读取cookie中的userid
        const userid = Cookies.get('userid')
        // 如果没有userid，自动重定向到登录界面
        if (!userid) {
            return <Redirect to='./login' />
        }

        // 【【【情况二有cookie】】】，redux无userid，此时就需要去发送ajax请求】】】
        // 如果有userid，读取redux中是否有保存有user的状态
        const { user,unReadCount } = this.props
        // 如果redux中的user没有_id，返回null(不做任何显示)
        if (!user._id) { // 在初始化渲染时，user中没有userid ，但是在第二次render()之后就会有
            
            return null //在没有发送ajax请求时，就显示为null
/***--------【【【初始化渲染时，代码解析到这就结束了】】】--------***/

        // 【【【情况三】】】有cookie，redux中有userid 在发送ajax请求之后就有了】】】
/***--------【【【第二次render后，代码将不再进入上面的if，
                                而是执行以下else的内容】】】--------***/
        } else {  // 在组件挂在完毕之后(第二次render方法执行后，user中就会有userid)
            
            // 如果redux中的user有_id，显示对应的界面
            // 如果已经登录，如果请求的是main的根路径
            // 》根据user的type和header来计算出一个重定向的路由路径，并自重定向
            let path = this.props.location.pathname
            if (path === '/') {
                // 得到一个重定向的路由路径
                // 使用getRedirectTo(type,header)函数进行判断，
                // 当type是dashen时，就跳转到大神列表，如果在跳转时检测到
                // 没有header信息，则跳转到register路由界面
                path = getRedirectTo(user.type, user.header)
                // 根据getRedirectTo只能跳转到:
                // dashen/laoban或者dasheninfo/laobaninfo四种情况的路由界面
                return <Redirect to={path} />
            }
        }

        // ==========================================================================
        // 如果没有进入上面的if else就直接进入if else以下的内容，
        // 自动根据path自动匹配到Route中对应的路由(
        // 如path=this.props.location.pathname==='/laoban'就跳转到老板路由主界面)
        // ==========================================================================

        const {navList}=this
        // 获取当前的请求路径
        const path=this.props.location.pathname 
        /*  
            》如果find方法返回的值为true，则返回第一个找到的navList。
            》找到就说明currentNav是有值的。
            》只有在当前的请求路径是nacList中的某一个时，
            才让currentNav等于当前路径所对应的路由
            》如果当前的请求路径等于navList中某一个路由的路径时，
            说明当前显示的就是当前路径所对应的路由界面
        */
        // 得到当前的nav(与请求路径对应的路由)，可能没有。 
        // 如果有，就说明当前显示的就是currentNav所对应的路由界面
        // 当navList中某个路由路径与当前location中的路径相同时，返回当前需要显示的路由currentNav
        const currentNav=navList.find(nav=> nav.path===path) 

        // 66666666666666666666666666666666666666666666666666666666666666666666666
        // =======================================================================
        // 动态向路由中添加hide属性，
        // 用于决定footer需要把哪个路由过滤掉。
        // 因为footer只需要显示当前type所对应路由页面的显示，
        // 当type是laoban时，就显示大神，消息，个人这三个按钮，
        // 不需要显示老板按钮，而老板按钮是/dashen路由所对应的页面显示。
        // 因此需要把当前路由显示不相关的按钮隐藏(即一个路由只能显示其相对应的页面显示
        // 老板路由就显示大神按钮，消息按钮，个人按钮)
        if(currentNav){
            // 决定哪个路由需要隐藏
            if(user.type==='laoban'){
                // 隐藏数组的第2个(dashen)
                // 当是老板路由时，就需要将大神路由屏蔽掉
                navList[1].hide=true
            }else{
                // 隐藏数组的第1个(老板)
                // 当是大神路由时，就需要把老板路由屏蔽掉
                navList[0].hide=true
            }
        }
        // 可在此处提前过滤好navList，再传给子组件，也可以在子组件中过滤
        // navList=navList.filter(nav => !nav.hide)

        return (
            <div>
                {/* 设置navList中title显示的情况，只有在当前路径与navList中
                某个路由的路径相同时才显示，即表示当前显示的就是当前路径所在的路由界面 */}
                {/* 老板路由中的title显示的是大神列表 */}
                {currentNav? <NavBar className='sticky-header'>{currentNav.title}</NavBar>:null}
                <Switch>
                    {/* 将navList数组中所有的路由映射到Switch标签中 */}
                    {
                        navList.map((nav,index) => <Route key={index} path={nav.path} component={nav.component}/>)
                    }
                    {/* 以下这三个路由不需要显示navList中的title属性，有自己的title */}
                    <Route path='/dasheninfo' component={DashenInfo} />
                    <Route path='/laobaninfo' component={LaobanInfo} />
                    <Route path='/chat/:userid' component={Chat} />
                    <Route component={NotFound} />
                </Switch>
                {/* 老板列表底部导航栏需要显示的是大神路由，消息路由，以及个人中心
                不需要显示老板列表 */}
                {currentNav? <NavFooter navList={navList} unReadCount={unReadCount}/>:null}
            </div>
        )
    }
}
export default connect(
    state => ({ user: state.user, unReadCount:state.chat.unReadCount }),
    { getUser } // 该方法得到了user的信息。表示已经登陆了
)(Main)



// 包含N个工具函数的模块

/*
    当接受到服务端的user信息以后，重定向的情况有四种，
    分别为：
        1，用户主界面路由
            》dashen: => /dashen
            》laoban: => /laoban
        2，完善信息主界面路由
            》dashen: => /dasheninfo
            》laoban: => /laobaninfo
        3,如何判断是否已经完善信息？
            》判断user.herder是否有值
        4,如何判断用户类型？
            》判断user.type

*/ 
// 返回对应的路由路径
export function getRedirectTo(type,header){
    let path
    // 判断type
    if(type==='laoban'){
        path='/laoban'
    }else{
        path='/dashen'
    }

    /*判断header,如果header没有值，
    说明没有完善信息，此时跳转到完善界面的路由 */
    if(!header){
        path += 'info'
    }

    return path
}

// export导出单个组件
// export default 可同时导出多个组件
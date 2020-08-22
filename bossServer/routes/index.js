/*
    实现聊天组件功能的代码步骤：
      》后台接口
      》chat静态组件
      》发送消息与接收消息
      》获取消息列表显示
      》接收消息显示
*/

var express = require('express')
var md5=require('blueimp-md5')
var router = express.Router()
var {UserModel,ChatModel} = require('../db/models')

var filter={password:0,_v:0} //过滤指定信息。即不显示

// router.get('/', (req, res, next) => {
//     res.render('index.html', {
//         title: 'hello Express yyy'
//     })
// })


router.post('/register',(req,res,next)=>{
    var {username,password,type}=req.body
    UserModel.findOne({username,},(err,user)=>{
        if(err){
            return next(err)
        }
        if(user){
            // 失败返回msg
            res.send({code:1,msg:'此用户已存在'})
        }else{
            // 成功返回data(user)
            new UserModel({username,type,password:md5(password)})
            .save((err,user)=>{
                // 生成cookie交给客户端保存
                res.cookie('userid',user._id,{maxAge:1000*60*60*24})
                const data={username,type,_id:user._id}
                // send中data是利用的简写：
                // 其实是：data：data(该data就是上面定义的data，包含username，type，_id)
                res.send({code:0,data})
            })
        }
    })
})

// router.get('/login', (req, res, next) => {
//     res.render('index.html', {
//         title: 'hello Express register'
//     })
// })

// 登陆
router.post('/login',(req,res)=>{
    const {username,password}=req.body
    // 根据username和password查询数据库users，如果没有，返回错误信息
    // 如果有，返回登录成功信息(包含user)
    UserModel.findOne(
        // 由于登陆时使用了md5对password进行了加密，
        // 所以使用findOne进行查找时也需要进行加密才能匹配到password。
        {username,password:md5(password)},
        filter, // 阻止定义的信息响应给客户端
        (err,user,next)=>{
            if(err){
                return next(err)
            }
            if(user){
                // 登陆成功生成cookie，将
                // 生成一个cookie(userid,user._id),并交给浏览器保存
                res.cookie('userid',user._id,{maxAge:1000*60*60*24})
                // 返回登录成功信息（包含user的登录信息，除密码外）
                res.send({code:0,data:user})
            }else{
                // 失败返回msg
                res.send({code:1,msg:'用户名或密码错误'})
            }   
        }
    )
})

// 更新用户信息(完善用户信息，设置头像，求职岗位post等等)
router.post('/update',(req,res)=>{
    
    // 从请求的cookie中得到user的id信息
    // cookie只在用户登陆成功或者注册成功才会产生
    const userid=req.cookies.userid
    // 判断如果userid不存在，说明用户没登录
    if(!userid){
       return res.send({code:1,msg:'请先登录'})
    }
    // 得到用户提交的数据 此时刚提交上来的user是没有_id的
    // 只有存入数据库中以后才会自动生成_id
    // req.body中获取到的是用户提交的表单信息
    // 不是数据库中的user，所以没有userid
    const user=req.body  // 该user没有_id 只有(header/post/info/...)
    // console.log(user)
    // 执行到这说明userid存在，
    // 即根据userid更新对应的数据库中user文档数据
    UserModel.findByIdAndUpdate({_id:userid},user,(error,oldUser)=>{
        // console.log(oldUser)
        if(!oldUser){
            // 如果oldUser不存在，通知浏览器删除userid cookie
            res.clearCookie('userid')
            // 假如响应该msg给客户端，就要使客户端自动跳转到登陆界面
            res.send({code:1,msg:'请先登录'})
        }else{
            // 准备一个返回的user数据对象
            const {_id,username,type}=oldUser
            // 使用新的user覆盖老的user
            // 此时user中有username，possword，_id,post,salary,info等属性
            const data=Object.assign({_id,username,type},user)
            // 返回准备好的数据对象
            res.send({
                code:0,
                // 该data是简写：其实是data：data(其中包含user的所有用户信息，密码除外)
                data
            })
        }
    })
})

// 获取用户信息的路由(根据cookie中的userid获取)
router.get('/user',(req,res)=>{
    // 从请求的cookie得到userid(即cookie中保存的登录信息_id)
    const userid=req.cookies.userid
    if(!userid){
        return res.send({code:1,msg:'请先登录'})
    }
    // 根据userid查询对应的user
    UserModel.findOne({_id:userid},filter,(error,user)=>{
        console.log(user)
        if(error){
            return res.status(500).send({code:1,msg:'请先登录'})
        }
        // 如果数据中中查到了与cookie中对应的userid的用户，
        // 则将这个user的用户信息返回到客户端
        res.send({code:0,data:user})
    })
})

// 根据用户类型获取用户列表(由老板页面或者大神页面在componentDidMount中发起请求)
router.get('/userlist',function(req,res){
    const {type}=req.query
    UserModel.find({type},filter,(error,users)=>{
        console.log(users)
        // if(error){
        //     return res.status(500).send('你需要的内容去火星了')
        // }
        // users包含的是所有相同type的用户列表，即所有laoban或所有dashen的用户列表
        res.send({code: 0 , data: users})
    })
})

/*
获取当前用户所有相关聊天信息列表msglist(需要返回users和chatMsgs)
msglist(聊天消息列表只要用户登录了，就立即获取)，
即可在register、login、getUser中调用getMsgList异步action发送请求到'/msglist'，
以便于获取聊天消息列表
*/
router.get('/msglist', function (req, res) {
    // 获取cookie中的userid
    const userid = req.cookies.userid
    // 查询得到所有user文档数组
    UserModel.find(function (err, userDocs) {
    // 用对象存储所有user信息: key为user的_id, val为name和header组成的user对象
    /*const users = {} // 对象容器
        userDocs.forEach(doc => {
            users[doc._id] = {username: doc.username, header: doc.header}
    })*/

        // reduce()方法用于对数组中的元素进行累加，返回累加后的结果(接收两个参数)
        // callback中users表示累加后的结果，user表示当前元素
        const users = userDocs.reduce((users, user) => {
            // 由于user.id是动态的值，所以用[]
            // console.log(users)
            users[user._id] = {username: user.username, header: user.header}
            return users
        } , {})
        /*
        查询userid相关的所有聊天信息(我发的，或者发给我的)
        参数1: 查询条件
        参数2: 过滤条件
        参数3: 回调函数
        */
        // to代表的是所有我发给的对象，和其他所有发给我的人
        // from和to在ChatModel这个数据库中本身就有，是由服务端io保存进入的
        // 就根据数据库中保存的from和to找到所有相关的聊天信息chatMsgs
        ChatModel.find({'$or': [{from: userid}, {to: userid}]}, filter, function (err, chatMsgs) {
            // 返回包含所有用户和当前用户相关的所有聊天消息的数据
            // chatMsgs包含的是我(当前user)跟所有人的聊天信息的一个数组
            res.send({code: 0, data: {users, chatMsgs}})
        })
    })
})

/*
修改指定消息为已读
 */
router.post('/readmsg', function (req, res) {
    // 得到请求中的from和to
    // req.body中的from是前端传过来的参数，是目标用户的id
    const from = req.body.from // 代表发消息的人,即为当前目标用户的id
    const to = req.cookies.userid // 表示接收消息的人，即为当前用户的id(我的id)
    /*
    更新数据库中的chat数据
    参数1: 查询条件
    参数2: 更新为指定的数据对象
    参数3: 是否1次更新多条, 默认只更新一条。{multi: true}表示一次性更新多条
    参数4: 更新完成的回调函数
     */
    // 将read的状态有false改为true，即表示用read为true覆盖前面的read为false。
    // 除了read以外，其他所有的属性都不改变
    ChatModel.update({from, to, read: false}, {read: true}, {multi: true}, function (err, doc) {
        console.log('/readmsg', doc)
        // nModified为doc中的一个属性，用于表明更新了多少条数据 
        // 而doc就是找到的需要更改的read的聊天消息   
      res.send({code: 0, data: doc.nModified}) // 更新的数量
    })
  })

module.exports = router
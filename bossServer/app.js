var express=require('express')
var router=require('./routes/index')
var bodyParser=require('body-parser')
var cookieParser = require('cookie-parser');


var app=express()

app.use('/public/',express.static('./public/'))
app.use('/node_modules/',express.static('./node_modules/'))


app.engine('html',require('express-art-template'))

app.use(express.json());
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(cookieParser())


// 挂载路由
app.use(router)

// 配置一个处理404的中间件 是一个无视请求及路径的中间件
// 该中间件不能放在上面，因为在他后面的中间件都会被这个中间件阻隔，不再响应
// 如果前面没有一个中间件进入进行处理相应，则进入404
app.use(function(req,res){
    res.render('error.html')
})

// 配置一个全局错误处理中间件
app.use(function(err,req,res,next){
    res.status(500).json({
        err_code:500,
        message:err.message
    })
})
module.exports = app

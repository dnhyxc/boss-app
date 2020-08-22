const {ChatModel}=require('../db/models')
module.exports = function (server) {
    const io = require('socket.io')(server)
    // 监视客户端与服务器端的连接(当有客户端连接时回调)。io.on监听所有
    io.on('connection', function (socket) {
        console.log('有一个客户端连接上了服务器')
        // 绑定监听,监听客户端发送消息的sendMsg事件，
        // 接收客户端发送的消息。socket.on针对某一个进行监听
        socket.on('sendMsg', function ({from,to,content}) {
            console.log('服务器接收到客户端发送的消息', {from,to,content})
            // 处理数据(保存消息)
            // 准备chatMsg对象的相关数据
            /*
                chat_id是from和to组成的字符串。
                chat_id的格式可能是from_to或者是to_from，因为服务器接收到的
                    数据可能是from发给to的，也有可能是to发给from的。
                chat_id的格式需要动态的固定，就需要使用：
                    sort()方法进行排序，然后使用 _ 连接进行拼串。
                这样不管chat_id的格式是什么，排序后的都是一样的。
            */ 
            const chat_id = [from,to].sort().join('_')
            const create_time=Date.now()
            new ChatModel({from,to,content,chat_id,create_time}).save((error,chatMsg)=>{
                // chatMsg就是最终保存成功的数据，也就是需要响应给客户端的
                // 向所有连接到服务端的客户端发消息(包含我(即from))
                // socket.emit('receiveMsg',chatMsg) //这种方式只能向我发送消息(即from)，无法向目标(即to)发送
                // =====【【【将聊天消息保存成功的同时，】】】】】】】】】】】】】
                // =====【【【服务端的io以receiveMsg这个名称 {{向浏览器的io中}} 发送消息】】】】】】、
                io.emit('receiveMsg',chatMsg) // 这种向全局发送消息的方式性能不好
            })
        })
    })
}
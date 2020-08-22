import io from 'socket.io-client'

// 连接服务器, 得到与服务器的连接对象
const socket = io('ws://localhost:4000')
// 绑定监听, 接收服务器发送的消息
// 浏览器端 监听的事件名 要与服务端使用的 发送消息的事件 名相互对应，
// 也就是客户端监听了receiveMsg事件名，服务端也要使用receiveMsg事件名进行发送消息
socket.on('receiveMsg', function (data) {
  console.log('客户端接收服务器发送的消息', data)
})

// 发送消息
// 客户端使用了sendMsg事件名进行发送消息，
// 服务端就需要对sendMsg事件名进行监听获取客户端发送的消息
socket.emit('sendMsg', {name: 'abc'})
console.log('客户端向服务器发消息', {name: 'abc'})

// socket是一个连接对象，用于连接客户端与服务端。

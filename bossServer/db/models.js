var mongoose=require('mongoose')
mongoose.set('useFindAndModify', false)
mongoose.connect('mongodb://localhost/bossDirecruit',{useNewUrlParser: true,useUnifiedTopology:true})

var Schema=mongoose.Schema

var userSchema=new Schema({
    username:{type:String,required:true},
    password:{type:String,required:true},
    type:{type:String,require:true}, //用户类型：dashen/laoban
    header:{type:String}, // 头像名称
    post:{type:String}, // 职位
    info:{type:String}, // 个人或职位简介
    company:{type:String}, // 公司名称
    salary:{type:String} // 月薪
})

const UserModel=mongoose.model('User',userSchema)

exports.UserModel=UserModel

// 定义chats集合的文档结构
const chatSchema = mongoose.Schema({
    from: {type: String, required: true}, // 发送用户的id
    to: {type: String, required: true}, // 接收用户的id
    chat_id: {type: String, required: true}, // from和to组成的字符串
    content: {type: String, required: true}, // 内容
    read: {type:Boolean, default: false}, // 标识是否已读
    create_time: {type: Number} // 创建时间
  })
  // 定义能操作chats集合数据的Model
  const ChatModel = mongoose.model('chat', chatSchema) // 集合为: chats
  // 向外暴露Model
  exports.ChatModel = ChatModel
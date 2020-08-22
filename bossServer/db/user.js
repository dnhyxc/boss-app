var mongoose=require('mongoose')
var md5=require('blueimp-md5')

mongoose.connect('mongodb://localhost/bossDirecruit',{useNewUrlParser: true,useUnifiedTopology:true})

var Schema=mongoose.Schema

var userSchema=new Schema({
    username:{
        type:String,
        required:true  
    },
    // nickname:{
    //     type:String,
    //     required:true
    // },
    password:{
        type:String,
        required:true
    },
    type:{
        type:String,
        require:true
    },
    header:{
        type:String
    }
})

const UserModel=mongoose.model('User',userSchema)

function testSave(){
    const usermodel=new UserModel({
        username:'Tom',
        password:md5('123'),
        type:'dashen'
    })

    usermodel.save(function(error,user){
        console.log('save()',error,user)
    })
}
testSave()

function testFind(){
    UserModel.find(function(err,users){
        console.log(users)
    })
}
testFind()

module.exports=UserModel


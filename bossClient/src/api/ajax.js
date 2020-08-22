/*
    能发送ajax请求的函数模块
    函数的返回值是promise对象 
*/ 
import axios from 'axios'
export default function ajax(url,data={},type="GET"){
    if(type==='GET'){
        // data: {username:Tom,password:123}
        // parmStr:username=Tom&password=123
        let parmStr=''
        Object.keys(data).forEach(key=>{
            parmStr += key + '=' + data[key] + '&'
        })
        if(parmStr){
            parmStr.substring(0,parmStr.length-1)
        }
        
        return axios.get(url+'?'+parmStr)
    }else{
        return axios.post(url,data)
    }
}
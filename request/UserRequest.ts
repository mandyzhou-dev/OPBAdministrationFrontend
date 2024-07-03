import { User } from "@/model/User";
import axios, { AxiosResponse } from "axios";

axios.defaults.withCredentials=true;
axios.defaults.headers.common['X-CSRF-TOKEN'] = "WksFJErk3XiDsnGYqi1olHqDJSWp1V4iCKUjeJZNmLkEGXYGaX8yE3qC6UuugkSskwBcpxvnCB2Z4DgPbJFGTPV_roA2KRUx"
export class UserRequest{
    

    getByRole = async (role: String):Promise<User[]> =>{
        try{
            console.log(process.env.EXPO_PUBLIC_API_URL)
            const response:AxiosResponse = await axios.get(process.env.EXPO_PUBLIC_API_URL+'api/presentor/user/getUserByRoleName',{
                params:{
                    role: role
                }
            });
            return response.data;
        }catch(e){
            throw new Error("Request Failure"+(e as Error).message)
        }
    }
    login = async(username:String, password:String):Promise<User> =>{
        try{
            
            const response:AxiosResponse = await axios.post(process.env.EXPO_PUBLIC_API_URL+'api/user/login',{
                    username: username,
                    password:password,   
            });
            return response.data;
        }catch(e){
            throw new Error("Post Failure"+(e as Error).message)
        }
    }

    resetPassword = async(username:String,password:String):Promise<Object>=>{
        try{
            const response:AxiosResponse = await axios.post(process.env.EXPO_PUBLIC_API_URL+'api/user/'+username+'/password',
                password,{
                    headers:{
                        'Content-type':'text/plain'
                    }
                }
            );
            return response.data;
        }catch(e){
            throw new Error("Post Failure"+(e as Error).message)
        }
    }
}
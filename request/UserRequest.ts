import { RegisterInfo } from "@/model/RegisterInfo";
import { User } from "@/model/User";
import axios, { AxiosResponse } from "axios";

axios.defaults.withCredentials=true;
axios.defaults.headers.common['X-CSRF-TOKEN'] = "WksFJErk3XiDsnGYqi1olHqDJSWp1V4iCKUjeJZNmLkEGXYGaX8yE3qC6UuugkSskwBcpxvnCB2Z4DgPbJFGTPV_roA2KRUx"
export class UserRequest{
    checkValidation = async(username:string):Promise<Boolean>=>{
        try{
            const response:AxiosResponse = await axios.get(process.env.EXPO_PUBLIC_API_URL+'api/user/check_validation',{
                params:{
                    username:username
                }
            });
            return response.data;
        }catch(e){
            throw new Error("Request Failure"+(e as Error).message)
        }
    }
    getUserByGroup = async(group: string):Promise<User[]>=>{
        try{
            const response:AxiosResponse = await axios.get(process.env.EXPO_PUBLIC_API_URL+'api/presentor/user/getUserByGroupName',{
                params:{
                    group: group
                }
            });
            return response.data;
        }catch(e){
            throw new Error("Request Failure"+(e as Error).message)
        }
    }

    verifyPassword = async(username:string,password:string):Promise<Boolean>=>{
        try{
            const response:AxiosResponse = await axios.post(process.env.EXPO_PUBLIC_API_URL+'api/user/verify_password',{
                    username:username,
                    password:password
            });
            return response.data;
        }catch(e){
            throw new Error("Post Failure"+(e as Error).message)
        }
    }

    getByRole = async (role: string):Promise<User[]> =>{
        try{
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
    login = async(username:string, password:string):Promise<User> =>{
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

    resetPassword = async(username:string,password:string):Promise<Object>=>{
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

    sendCode = async(email:string):Promise<Object>=>{
        try{
            const response:AxiosResponse = await axios.post(process.env.EXPO_PUBLIC_API_URL+'api/user/send_code', null,{
                params:{
                    email:email
                }
            });
            return response.data;
        }catch(e){
            throw new Error("Post Failure"+(e as Error).message)
        }
    }

    register = async(registerInfo:RegisterInfo,code:string):Promise<Object>=>{
        try{
            const response:AxiosResponse = await axios.post(process.env.EXPO_PUBLIC_API_URL+'api/user/register',
                registerInfo,{
                params:{
                    code:code
                }
            }
            );
            return response.data;
        }catch(e){
            throw new Error("Post Failure"+(e as Error).message)
        }
    }
    isInProbation =async(username:string):Promise<boolean>=>{
        try{
            const response:AxiosResponse = await axios.get(process.env.EXPO_PUBLIC_API_URL+'api/user/'+username+'/probation');
            return response.data;
        }catch(e){
            throw new Error("Get Failure"+(e as Error).message)
        }
    }
    getEmployeeBasic = async():Promise<User[]>=>{
        try{
            const response:AxiosResponse = await axios.get(process.env.EXPO_PUBLIC_API_URL+'api/presentor/user/employees/basic');
            return response.data;
        }catch(e){
            throw new Error("Get Failure"+(e as Error).message)
        }
    }

}
import { RegisterInfo } from "@/model/RegisterInfo";
import { User } from "@/model/User";
import{ UserRequest} from "@/request/UserRequest"
export const getUserByRole = async (role:string):Promise<User[]>=>{
    const userRequest = new UserRequest()
    return userRequest.getByRole(role)
}

export const getUserByGroup = async(group:string):Promise<User[]>=>{
    const userRequest = new UserRequest()
    return userRequest.getUserByGroup(group);
}

export const login = async(username:string, password:string):Promise<Object>=>{
    const userRequest = new UserRequest()
    let data = await userRequest.login(username,password)
    
    localStorage.setItem("user", JSON.stringify(data));
    return data;
}

export const resetPassword = async(username:string, password:string):Promise<Object>=>{
    const userRequest = new UserRequest()
    return userRequest.resetPassword(username,password);
}
export const checkValidation = async(username:string):Promise<Object>=>{
    const userRequest = new UserRequest()
    return userRequest.checkValidation(username);
}

export const sendCode = async(email:string):Promise<Object>=>{
    const userRequest = new UserRequest()
    return userRequest.sendCode(email);
}

export const register = async(registerInfo:RegisterInfo,code:string):Promise<Object>=>{
    const userRequest = new UserRequest();
    return userRequest.register(registerInfo,code);
}

export const isInProbation = async(username:string):Promise<boolean>=>{
    const userRequest = new UserRequest();
    return userRequest.isInProbation(username);
}
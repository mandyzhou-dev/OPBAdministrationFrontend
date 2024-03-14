import { User } from "@/model/User";
import{ UserRequest} from "@/request/UserRequest"
export const getUserByRole = async (role:String):Promise<User[]>=>{
    const userRequest = new UserRequest()
    return userRequest.getByRole(role)
}

export const login = async(username:String, password:String):Promise<Object>=>{
    const userRequest = new UserRequest()
    return userRequest.login(username,password)
}
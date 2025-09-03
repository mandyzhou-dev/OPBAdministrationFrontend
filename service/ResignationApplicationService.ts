import { ResignationApplication } from "@/model/ResignationApplication";
import { ResignationApplicationRequest } from "@/request/ResignationApplicationRequest"

export const newResignationApplication = async(createResigApp:object):Promise<ResignationApplication>=>{
    const resignationApplicationRequest = new ResignationApplicationRequest();
    return resignationApplicationRequest.postResignationApplication(createResigApp);

}
import { Announcement } from "@/model/Announcement";
import { AnnouncementReadLog } from "@/model/AnnouncementReadLog";
import axios, { Axios, AxiosResponse } from "axios";

export class AnnouncementRequest{
    postAnnouncement = async(postAnnouncement:object):Promise<Announcement>=>{
        try{
            const response:AxiosResponse = await axios.post(process.env.EXPO_PUBLIC_API_URL+'api/announcement',
            postAnnouncement);
            return response.data;
        }catch(e){
            throw new Error("Post Failure"+(e as Error).message)
        }
    
    }

    getAnnouncementByAfter = async(expireAfter:Date):Promise<Announcement[]>=>{
        try{
            const response:AxiosResponse = await axios.get(process.env.EXPO_PUBLIC_API_URL+'api/announcement',
            {params:{expireAfter:expireAfter}});
            return response.data;
        }catch(e){
            throw new Error("Request Failure"+(e as Error).message)
        }
    }

    getAnnouncementById = async(announcementId:number):Promise<Announcement>=>{
        try{
            const response:AxiosResponse = await axios.get(process.env.EXPO_PUBLIC_API_URL+'api/announcement/'+announcementId);
            return response.data;
        }catch(e){
            throw new Error("Request Failure"+(e as Error).message)
        }
    }
    deleteAnnouncementById = async(announcementId:number):Promise<Object>=>{
        try{
            const response:AxiosResponse = await axios.delete(process.env.EXPO_PUBLIC_API_URL+'api/announcement/'+announcementId);
            return response.data;
        }catch(e){
            throw new Error("Delete Failure"+(e as Error).message)
        }
    }
    putAnnouncementById = async(announcementId:number,announcement:Announcement):Promise<Object>=>{
        try{
            const response:AxiosResponse = await axios.put(process.env.EXPO_PUBLIC_API_URL+'api/announcement/'+announcementId,
            announcement);
            return response.data;
        }catch(e){
            throw new Error("Put Failure"+(e as Error).message)
        }
    }

    getReadLogByReader = async(reader:string):Promise<AnnouncementReadLog[]>=>{
        try{
            const response:AxiosResponse = await axios.get(process.env.EXPO_PUBLIC_API_URL+'api/announcement/readLog',{params:{reader:reader}});
            return response.data;
        }catch(e){
            throw new Error("Request Failure"+(e as Error).message)
        }
    }

    addReadLog = async(announcementId:number,postAnnouncementReadLog:object):Promise<Object>=>{
        try{
            const response:AxiosResponse = await axios.post(process.env.EXPO_PUBLIC_API_URL+'api/announcement/'+announcementId+'/read',
            postAnnouncementReadLog);
            return response.data;
        }catch(e){
            throw new Error("Post Failure"+(e as Error).message)
        }
    }
}
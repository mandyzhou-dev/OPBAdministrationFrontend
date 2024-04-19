import { Announcement } from "@/model/Announcement";
import axios, { AxiosResponse } from "axios";

export class AnnouncementRequest{
    postAnnouncement = async(postAnnouncement:object):Promise<Announcement>=>{
        try{
            const response:AxiosResponse = await axios.post('http://localhost:8080/api/announcement',
            postAnnouncement);
            return response.data;
        }catch(e){
            throw new Error("Post Failure"+(e as Error).message)
        }
    
    }

    getAnnouncementByAfter = async(expireAfter:Date):Promise<Announcement[]>=>{
        try{
            const response:AxiosResponse = await axios.get('http://localhost:8080/api/announcement',
            {params:{expireAfter:expireAfter}});
            return response.data;
        }catch(e){
            throw new Error("Request Failure"+(e as Error).message)
        }
    }

    getAnnouncementById = async(announcementId:number):Promise<Announcement>=>{
        try{
            const response:AxiosResponse = await axios.get('http://localhost:8080/api/announcement/'+announcementId);
            return response.data;
        }catch(e){
            throw new Error("Request Failure"+(e as Error).message)
        }
    }
    deleteAnnouncementById = async(announcementId:number):Promise<Object>=>{
        try{
            const response:AxiosResponse = await axios.delete('http://localhost:8080/api/announcement/'+announcementId);
            return response.data;
        }catch(e){
            throw new Error("Delete Failure"+(e as Error).message)
        }
    }
    putAnnouncementById = async(announcementId:number,announcement:Announcement):Promise<Object>=>{
        try{
            const response:AxiosResponse = await axios.put('http://localhost:8080/api/announcement/'+announcementId,
            announcement);
            return response.data;
        }catch(e){
            throw new Error("Put Failure"+(e as Error).message)
        }
    }
}
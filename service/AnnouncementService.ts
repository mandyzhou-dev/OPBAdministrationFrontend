import { AnnouncementRequest } from "@/request/AnnouncementRequest";
import { Announcement } from "@/model/Announcement";
export const getAnnouncementByAfter = async (expireAfter:Date, username: string): Promise<Announcement[]> => {
    const announcementRequest = new AnnouncementRequest()
    const announcements = await announcementRequest.getAnnouncementByAfter(expireAfter, username);
    return announcements;
}

export const postAnnouncement = async(postAnnouncement:object):Promise<Announcement>=>{
    const announcementRequest = new AnnouncementRequest()
    const announcement = await announcementRequest.postAnnouncement(postAnnouncement);
    return announcement;
}
export const getAnnouncementById = async(id:number):Promise<Announcement>=>{
    const announcementRequest = new AnnouncementRequest()
    const announcement = await announcementRequest.getAnnouncementById(id);
    return announcement;
}
export const deleteAnnouncement = async(id:number):Promise<Object>=>{
    const announcementRequest = new AnnouncementRequest()
    const object = await announcementRequest.deleteAnnouncementById(id);
    return object;
}

export const putAnnouncement = async(id:number,announcement:Announcement):Promise<Object>=>{
    const announcementRequest = new AnnouncementRequest()
    const object = await announcementRequest.putAnnouncementById(id,announcement);
    return object;
}
export const getReadStatusByIdAndReader = async(id:number,reader:string):Promise<boolean>=>{
    const announcementRequest = new AnnouncementRequest()
    const announcementReadLogList = await announcementRequest.getReadLogByReader(reader);
    let i:number;
    let flag = false;
    for(i =0;i<announcementReadLogList.length;++i){
        if(announcementReadLogList[i].announcementId===id){
            flag = true;
        }
    }
    return flag;
    
}

export const getUnreadListByReader = async(reader:string):Promise<number[]>=>{
    const announcementRequest = new AnnouncementRequest;
    const announcementReadLogList = await announcementRequest.getReadLogByReader(reader);
    const announcementList = await announcementRequest.getAnnouncementByAfter(new Date(),reader);
    let announcementIdList = new Array();
    let i:number;
    let j:number;
    let flag=false;
    for(i = 0;i<announcementList.length;++i){
        for(j = 0; j<announcementReadLogList.length;++j){
            if(announcementReadLogList[j].announcementId==announcementList[i].id){
                flag = true;            
            }
        }
        if(!flag) {
            announcementIdList.push(announcementList[i].id);
        }
        flag = false;
        
    }
    return announcementIdList;
}
export const readAnnouncement = async(announcementId:number,postAnnouncementReadLog:object):Promise<Object>=>{
    const announcementRequest = new AnnouncementRequest;
    const object = await announcementRequest.addReadLog(announcementId,postAnnouncementReadLog);
    return object;
}
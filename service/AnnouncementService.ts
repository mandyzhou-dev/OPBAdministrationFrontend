import { AnnouncementRequest } from "@/request/AnnouncementRequest";
import { Announcement } from "@/model/Announcement";
export const getAnnouncementByAfter = async (expireAfter:Date): Promise<Announcement[]> => {
    const announcementRequest = new AnnouncementRequest()
    const announcements = await announcementRequest.getAnnouncementByAfter(expireAfter);
    return announcements;
}

export const postAnnouncement = async(postAnnouncement:object):Promise<Announcement>=>{
    const announcementRequest = new AnnouncementRequest()
    const announcement = await announcementRequest.postAnnouncement(postAnnouncement);
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
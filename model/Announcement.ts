export class Announcement{
    id: number| undefined;
    title: string | undefined;
    createdTime: Date | undefined;
    content: string|undefined;
    expiryDate: Date|undefined;
    publisher:string|undefined;
    isRead:boolean;
    constructor () {
        this.isRead = true
    }
}
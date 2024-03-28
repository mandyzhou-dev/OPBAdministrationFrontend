export class WorkTimeStatistic{
    username!: string;
    userRealName!:string;
    hours!:number;

    constructor(username:string, userRealName:string,hours:number){
        this.username = username;
        this.userRealName = userRealName;
        this.hours = hours;
    }

}
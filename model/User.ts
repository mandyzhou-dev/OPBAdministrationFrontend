export class User{
    username!: string | undefined;
    realname!: string | undefined;

    constructor(username: string, realname: string){
        this.username = username;
        this.realname = realname;
    }
}
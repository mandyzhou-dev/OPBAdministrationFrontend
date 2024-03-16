export class User{
    username!: string | undefined;
    name!: string | undefined;
    roles!:string|undefined;
    jsessionID:string | undefined;

    constructor(username: string, name: string,roles:string){
        this.username = username;
        this.name = name;
        this.roles = roles;
    }
}
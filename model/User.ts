export class User{
    username!: string | undefined;
    name!: string | undefined;

    constructor(username: string, name: string){
        this.username = username;
        this.name = name;
    }
}
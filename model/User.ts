export class User{
    username!: string | undefined;
    name!: string | undefined;
    roles!:string|undefined;
    jsessionID:string | undefined;
    email!:string |undefined;
    phoneNumber!:string | undefined;
    address!:string |undefined;
    birthdate!:Date |undefined;
    active!:number |undefined;
    constructor(username: string, name: string,roles:string,email:string,phoneNumber:string,address:string,birthdate:Date,active:number){
        this.username = username;
        this.name = name;
        this.roles = roles;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.birthdate = birthdate;
        this.active = active;
    }
}
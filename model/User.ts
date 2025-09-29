export class User{
    username!: string;
    name!: string;
    legalName:string | undefined;
    roles!:string;
    jsessionID:string | undefined;
    email:string |undefined;
    phoneNumber:string | undefined;
    address:string |undefined;
    birthdate:Date |undefined;
    active!:number;
    groupName!:string;

    constructor(username: string, name: string,legalName: string,roles:string,email:string,phoneNumber:string,address:string,birthdate:Date,active:number,groupName:string){
        this.username = username;
        this.name = name;
        this.legalName = legalName;
        this.roles = roles;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.birthdate = birthdate;
        this.active = active;
        this.groupName = groupName;
    }
}
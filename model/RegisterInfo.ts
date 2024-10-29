import { Moment } from "moment";

export class RegisterInfo{
    username!: string | undefined;
    name!: string | undefined;
    password!: string | undefined;
    //roles!:string|undefined;
    legalname!: string|undefined;
    sinno!:string|undefined;
    email!:string |undefined;
    phoneNumber!:string | undefined;
    address!:string |undefined;
    birthdate!:Moment |undefined;
    personalDocumentsPath!: string | undefined;

    constructor(username: string, name: string,password:string, /*roles:string,*/legalname:string, email:string,phoneNumber:string,address:string,birthdate:Moment){
        this.username = username;
        this.name = name;
        this.password = password;
       // this.roles = roles;
        this.legalname = legalname;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.birthdate = birthdate;
    }
}
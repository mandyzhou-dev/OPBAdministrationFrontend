import { Moment } from "moment";
import { Shift } from "./Shift";
import { User } from "./User";

export class Schedule{
    day: string | undefined;
    workers: User[] = [];
    shifts: Map<string, Shift> =new Map<string,Shift>();
    date: Moment | undefined;  

    constructor () {

    }
}
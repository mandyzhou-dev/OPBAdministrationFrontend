import { ShiftStatus } from "@/constants/ShiftStatus";

export class Shift{
    id: number | undefined;
    username: string = "";
    userRealName: string = "";
    start: Date |undefined;
    end: Date | undefined;
    status!: ShiftStatus | string;
    groupName!:string | "";
}

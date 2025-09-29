import { Dayjs } from "dayjs";

export class Employment{
    id: number | undefined;
    username: string |undefined;
    legalName: string | undefined;
    bigDay: Dayjs | undefined;
    lastDay: Dayjs | undefined;
    noticeDate: Dayjs | undefined;
    roles: string | undefined;
    terminationReason: string | undefined;

    constructor () {

    }
}
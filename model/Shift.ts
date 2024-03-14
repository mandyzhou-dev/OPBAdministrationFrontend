export class Shift{
    id: number | undefined;
    username: string = "";
    userRealName: string = "";
    start: Date |undefined;
    end: Date | undefined;
    status!: string | "active"
}
import { LeaveApplication } from "@/model/LeaveApplication";

export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    sort: string;
}

export interface ApplicationHistoryQuery {
    operatorUsername: string;
    employeeUsername?: string | null;
    page?: number;
    size?: number;
    sort?: string;
}

export type ApplicationHistoryPage = PageResponse<LeaveApplication>;

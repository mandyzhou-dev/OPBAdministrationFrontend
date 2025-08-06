import { KPIRecordRequest } from "@/request/KPIRecordRequest";
import { KPIRecord } from "@/model/KPIRecord";


export const getKPIRecordsByYear = async (year: string): Promise<KPIRecord[]> => {
    const kpiRecordRequest = new KPIRecordRequest();
    return await kpiRecordRequest.getByYear(year);
};


export const createKPIRecord = async (record: KPIRecord): Promise<KPIRecord> => {
    const kpiRecordRequest = new KPIRecordRequest();
    return await kpiRecordRequest.create(record);
};


export const updateKPIRecord = async (id: number, record: KPIRecord): Promise<KPIRecord> => {
    const kpiRecordRequest = new KPIRecordRequest();
    return await kpiRecordRequest.update(id, record);
};

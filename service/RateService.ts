import { RateRequest } from "@/request/RateRequest";

export const getRate = async (): Promise<number> => {
    const rateRequest = new RateRequest();
    const rate = await rateRequest.getRate();
    return rate;
};

export const updateRate = async (rate: number): Promise<Object> => {
    const rateRequest = new RateRequest();
    const object = await rateRequest.updateRate(rate);
    return object;
};

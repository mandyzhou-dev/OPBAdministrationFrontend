import { RateRequest } from "@/request/RateRequest";

export const getTargetRate = async (): Promise<number> => {
    const rateRequest = new RateRequest();
    const rate = await rateRequest.getRate();
    return rate;
};

export const updateTargetRate = async (rate: number): Promise<Object> => {
    const rateRequest = new RateRequest();
    const object = await rateRequest.updateRate(rate);
    return object;
};

export const getBonusRate = async (): Promise<number> => {
    const rateRequest = new RateRequest();
    const rate = await rateRequest.getBonusRate();
    return rate;
};

export const updateBonusRate = async (bonusRate: number): Promise<Object> => {
    const rateRequest = new RateRequest();
    const object = await rateRequest.updateBonusRate(bonusRate);
    return object;
};

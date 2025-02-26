import { RegulationRequest } from "@/request/RegulationRequest";
import { Regulation } from "@/model/Regulation";

export const getRegulationById = async (id: number): Promise<Regulation> => {
    const regulationRequest = new RegulationRequest();
    const regulation = await regulationRequest.getRegulationById(id);
    return regulation;
};

export const putRegulation = async (id: number, regulation: Regulation): Promise<Object> => {
    const regulationRequest = new RegulationRequest();
    const object = await regulationRequest.putRegulationById(id, regulation);
    return object;
};

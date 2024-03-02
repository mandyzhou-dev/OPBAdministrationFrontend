import axios, {AxiosResponse} from 'axios'

export class ShiftRequest{

    getByStartDateScope = async (start: Date, end:Date): Promise<Shift[]> => {
        try{
            const response:AxiosResponse = await axios.get('http://localhost:8080/presentor/shift/getShiftByStartDateScope',{
                params:{
                    start: start,
                    end: end,
                }
            });
            return response.data;
        }catch (e) {
            throw new Error("Request Failure" + (e as Error).message)
        }
        
    }

}




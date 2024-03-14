import { Shift } from '@/model/Shift';
import axios, {AxiosResponse} from 'axios'
import moment from 'moment';

//axios.defaults.withCredentials=true;
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
    batchCreateByDate = async (workDate: Date, usernameList:string[]):Promise<Object> => {
        try{
            const response:AxiosResponse = await axios.put('http://localhost:8080/shift/shiftarrangement/batchCreateByDate',{
                    workDate: moment(workDate).format(),
                    usernames:usernameList,
            })
            return response.data
        }catch(e){
            throw new Error("Put Failure"+(e as Error).message)
        }
    }

    deleteCurrentShift = async (shift:Shift):Promise<Object>=>{
        try{
            const response:AxiosResponse = await axios.put('http://localhost:8080/shift/shiftarrangement/deleteCurrentShift',
                shift)
            return response.data
        }catch(e){
            throw new Error("Put Failure"+(e as Error).message)
        }
    }

    modifyCurrentShift = async(shift:Shift):Promise<Object>=>{
        try{
            const response:AxiosResponse = await axios.put('http://localhost:8080/shift/shiftarrangement/modifyCurrentShift',
            shift)
            return response.data
        }catch(e){
            throw new Error("Put Failure"+(e as Error).message)
        }
    }

}




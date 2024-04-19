import { Shift } from '@/model/Shift';
import axios, {AxiosResponse} from 'axios'
import moment from 'moment';
import Cookies from 'universal-cookie'
import { Header } from 'react-native/Libraries/NewAppScreen';

//axios.defaults.withCredentials=true;
export class ShiftRequest{
    

    getByStartDateScope = async (start: Date, end:Date): Promise<Shift[]> => {
        try{
            
            const response:AxiosResponse = await axios.get('http://localhost:8080/api/presentor/shift/getShiftByStartDateScope',{
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

    getByUsernameAndStartDateScope = async (username:string,start: Date, end:Date): Promise<Shift[]> => {
        try{
            
            const response:AxiosResponse = await axios.get('http://localhost:8080/api/presentor/shift/'+username+'/getShiftByStartDateScope',{
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
            const config = {
                withCredentials: true,
                headers:{
                }
            }
            const cookies = new Cookies();
            cookies.set('JSESSIONID', JSON.parse(localStorage.getItem("user") as string).jsessionID)
            console.log(cookies.get('JSESSIONID'))
            const response:AxiosResponse = await axios.put('http://localhost:8080/api/shift/shiftarrangement/batchCreateByDate',{
                    workDate: moment(workDate).format(),
                    usernames:usernameList,
            },config)
            return response.data
        }catch(e){
            throw new Error("Put Failure"+(e as Error).message)
        }
    }

    deleteCurrentShift = async (shift:Shift):Promise<Object>=>{
        try{
            
            const response:AxiosResponse = await axios.put('http://localhost:8080/api/shift/shiftarrangement/deleteCurrentShift',
                shift)
            return response.data
        }catch(e){
            throw new Error("Put Failure"+(e as Error).message)
        }
    }

    modifyCurrentShift = async(shift:Shift):Promise<Object>=>{
        try{
            const response:AxiosResponse = await axios.put('http://localhost:8080/api/shift/shiftarrangement/modifyCurrentShift',
            shift)
            return response.data
        }catch(e){
            throw new Error("Put Failure"+(e as Error).message)
        }
    }

}




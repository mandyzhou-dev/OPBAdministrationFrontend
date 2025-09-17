import { Shift } from '@/model/Shift';
import axios, {AxiosResponse} from 'axios'
import moment, { Moment } from 'moment';
import Cookies from 'universal-cookie'
import dayjs, { Dayjs } from 'dayjs';
import { kpi } from '@/model/KPI';
export class ShiftRequest{
    

    getByStartDateScope = async (username:string,start: Moment, end:Moment): Promise<Shift[]> => {
        try{
            
            const response:AxiosResponse = await axios.get(process.env.EXPO_PUBLIC_API_URL+'api/presentor/shift/'+username+'/getShiftByStartDateScopeAndGroup',{
                params:{
                    start: start.format(),
                    end: end.format(),
                }
            });
            return response.data;
        }catch (e) {
            throw new Error("Request Failure" + (e as Error).message)
        }
        
    }

    getByUsernameAndStartDateScope = async (username:string,start: Moment, end:Moment): Promise<Shift[]> => {
        try{
            
            const response:AxiosResponse = await axios.get(process.env.EXPO_PUBLIC_API_URL+'api/presentor/shift/'+username+'/getShiftByStartDateScope',{
                params:{
                    start: start.format(),
                    end: end.format(),
                }
            });
            return response.data;
        }catch (e) {
            throw new Error("Request Failure" + (e as Error).message)
        }
        
    }

    batchCreateByDate = async (workDate: string, group: string, usernameList:string[]):Promise<Object> => {
        
        try{
            const config = {
                withCredentials: true,
                headers:{
                }
            }
            const cookies = new Cookies();
            cookies.set('JSESSIONID', JSON.parse(localStorage.getItem("user") as string).jsessionID)
            //console.log(cookies.get('JSESSIONID'))
            const response:AxiosResponse = await axios.put(process.env.EXPO_PUBLIC_API_URL+'api/shift/shiftarrangement/batchCreateByDate',{
                    workDate: workDate,
                    group: group,
                    usernames:usernameList,
            },config)
            return response.data
        }catch(e){
            throw new Error("Put Failure"+(e as Error).message)
        }
    }

    deleteCurrentShift = async (shift:Shift):Promise<Object>=>{
        try{
            
            const response:AxiosResponse = await axios.put(process.env.EXPO_PUBLIC_API_URL+'api/shift/shiftarrangement/deleteCurrentShift',
                shift)
            return response.data
        }catch(e){
            throw new Error("Put Failure"+(e as Error).message)
        }
    }

    modifyCurrentShift = async(shift:Shift):Promise<Object>=>{
        try{
            const response:AxiosResponse = await axios.put(process.env.EXPO_PUBLIC_API_URL+'api/shift/shiftarrangement/modifyCurrentShift',
            shift)
            return response.data
        }catch(e){
            throw new Error("Put Failure"+(e as Error).message)
        }
    }

    getKPIByDateAndGroup = async(groupName:string, date:Dayjs):Promise<kpi>=>{
        try{
            const response:AxiosResponse = await axios.get(process.env.EXPO_PUBLIC_API_URL+'api/shift/kpi/groupName',{
                params:{
                    groupName: groupName,
                    date: date.format('YYYY-MM-DD'),
                }
            });
            return response.data
        }catch(e){
            throw new Error("Get Failure"+(e as Error).message)
        }
    }

    getKPIByUserAndGroupAndDate = async(username:string, groupName:string,date:Dayjs):Promise<kpi>=>{
        //业务逻辑要算哪个组就传哪个组，目前业务需求是传surrey
        try{
            const response:AxiosResponse = await axios.get(process.env.EXPO_PUBLIC_API_URL+'api/shift/kpi/user',{
                params:{
                    username:username,
                    groupName: groupName,
                    date: date.format('YYYY-MM-DD'),
                }
            }); 
            return response.data
        }catch(e){
            throw new Error("Get Failure"+(e as Error).message)
        }
    }

    getBiweekKPIByGroup = async (groupName: string): Promise<kpi> => {
        try {
            const response: AxiosResponse = await axios.get(process.env.EXPO_PUBLIC_API_URL + 'api/shift/kpi/groupName/biweek', {
                params: {
                    groupName: groupName
                }
            });
            return response.data;
        } catch (e) {
            throw new Error("Get Failure" + (e as Error).message)
        }
    }

    getBiweekKPIByUserAndGroup = async(username: string,groupName: string):Promise<kpi>=>{
        try {
            const response: AxiosResponse = await axios.get(process.env.EXPO_PUBLIC_API_URL + 'api/shift/kpi/user/biweek', {
                params: {
                    username:username,
                    groupName: groupName
                }
            });
            return response.data;
        } catch (e) {
            throw new Error("Get Failure" + (e as Error).message)
        }
    }
}




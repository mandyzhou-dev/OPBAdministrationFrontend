import { PreferWorkdays } from "@/model/PreferWorkdays";
import axios, { AxiosResponse } from "axios";

export class ShiftBoardRequest{
    getPreferredEmployeesBydate = async(date:Date):Promise<string[]>=>{
        try{
            const response:AxiosResponse = await axios.get('http://localhost:8080/api/shift/shiftboard/getBoardByDate',
            {params:{date:date}});
            return response.data;
        }catch(e){
            throw new Error("Get Failure"+(e as Error).message)
        }
    }
    updatePreferWorkday = async(preferWorkdays:PreferWorkdays):Promise<Object>=>{
        try{
            const response:AxiosResponse = await axios.put('http://localhost:8080/api/shift/shiftboard/updateBoard',preferWorkdays);
            return response.data;
        }catch(e){
            throw new Error("Put Failure"+(e as Error).message)
        }
    }

    shiftToNextMonth = async():Promise<Object>=>{
        try{
            const response:AxiosResponse = await axios.put('http://localhost:8080/api/shift/shiftboard/shiftToNextMonth');
            return response.data;
        }catch(e){
            throw new Error("Put Failure"+(e as Error).message)
        }
    }

    getCurrentMonth = async():Promise<number>=>{
        try{
            const response:AxiosResponse = await axios.get('http://localhost:8080/api/shift/shiftboard/getCurrentMonth');
            return response.data;
        }catch(e){
            throw new Error("Get Failure"+(e as Error).message)
        }
    }

    getPreferredDatesByUser = async(username:string):Promise<Date[]>=>{
        try{
            const response:AxiosResponse = await axios.get('http://localhost:8080/api/shift/shiftboard/getBoardByUser',{params:{username:username}});
            return response.data;
        }catch(e){
            throw new Error("Get Failure"+(e as Error).message)
        }
    }

}
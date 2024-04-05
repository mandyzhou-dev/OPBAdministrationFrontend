import { SelectItemProps } from "@/model/SelectItemProps";
import { View,Card,SelectItem, FormControlHelper, ChevronDownIcon, FormControl, FormControlLabel, FormControlLabelText, Select, SelectBackdrop, SelectContent, SelectIcon, SelectInput, SelectPortal, SelectTrigger, Icon, SelectDragIndicatorWrapper, FormControlHelperText, FormControlError, AlertCircleIcon, FormControlErrorText, FormControlErrorIcon, SelectDragIndicator } from "@gluestack-ui/themed";
import React from "react";
interface RequiredFormControlProps{
    isRequired?:boolean,
    isInvalid?:boolean,
    onUpdate:(value:string)=>void,
    items:SelectItemProps[],
    helper?:string,
    title:string,
    defaultSelection?: string,
    defaultLabel?:string
}
export const RequiredFormControl:React.FC<RequiredFormControlProps> = ({defaultLabel,defaultSelection,title,isRequired,isInvalid,onUpdate,items,helper}) =>{
    
    return(
        <Card>
        <FormControl isRequired={isRequired} isInvalid={isInvalid}  >
            <FormControlLabel>
                <FormControlLabelText>{title}</FormControlLabelText>
            </FormControlLabel>
            <Select onValueChange={(value)=>{onUpdate(value)}} defaultValue={defaultSelection} initialLabel={defaultLabel}>
                <SelectTrigger>
                    <SelectInput placeholder="Select" />
                    <SelectIcon mr="$3">
                        <Icon as={ChevronDownIcon} />
                    </SelectIcon>
                </SelectTrigger>
                <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent >
                        <SelectDragIndicatorWrapper>
                            <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        {items.map((item)=>{
                            return(   
                                <SelectItem key={item.value} label={item.label} value={item.value} /> 
                            )
                        })}

                    </SelectContent>
                </SelectPortal>
            </Select>
            <FormControlHelper>
                <FormControlHelperText>
                     {helper}
                </FormControlHelperText>
            </FormControlHelper>
            <FormControlError>
                <FormControlErrorIcon as={AlertCircleIcon} />
                <FormControlErrorText>Mandatory field</FormControlErrorText>
            </FormControlError>
        </FormControl>

        
    </Card>
    )
}
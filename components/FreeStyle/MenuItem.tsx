import { Pressable ,Text} from "@gluestack-ui/themed";
import React from "react";
interface MenuItemProps {
    text: string;
    onPress:()=>void;
}
export const MenuItem: React.FC<MenuItemProps> = ({ text ,onPress}) => {
    return (
        <Pressable

            onPress={onPress}
            p="$2"
            bg="$white"
            $hover-bg="$light200"
            rounded={8}
            borderTopWidth="$1"
            borderColor="$light300"
        >
            <Text margin={10}>{text}</Text>
        </Pressable>
    )
}
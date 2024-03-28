import { Card, Progress, ProgressFilledTrack, View, Text, HStack, VStack } from "@gluestack-ui/themed"
interface StatisticItemProps {
    name:string;
    value: number;
}
export const WorkTimeStatisticItem: React.FC<StatisticItemProps> = ({ value ,name}) => {
    return (
        <View>
            <Card margin={3}>
                <HStack flex={1} >
                    <VStack w={"20%"}>
                        <Text margin={3}>{name}</Text>
                    </VStack>
                    <VStack w={"70%"} alignItems="center" justifyContent="center">
                        <Progress value={value*2} w="100%" size="xs">
                            <ProgressFilledTrack />
                        </Progress >
                    </VStack>
                    <VStack w={"10%"} justifyContent="center" alignItems="center">
                        <Text>{value}</Text>
                    </VStack>
                </HStack>

            </Card>
        </View>
    )
}
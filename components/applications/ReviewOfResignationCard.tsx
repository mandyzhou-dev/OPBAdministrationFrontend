import { ResignationStatus } from "@/constants/ResignationStatus";
import { ResignationApplication } from "@/model/ResignationApplication"
import { BadgeText, Button, Card, Heading, Textarea, Text, TextareaInput, VStack, BadgeIcon, CheckIcon, ClockIcon } from "@gluestack-ui/themed"

interface ReviewOfApplicationCardProps {
    name: string|undefined,
    lastWorkingDay: string|undefined,
    reason: string|undefined,
    submittedAt: string|undefined,
    status: ResignationStatus|undefined;
    onClick:Function
}

export const ReviewOfResignationCard: React.FC<ReviewOfApplicationCardProps> = ({ name, lastWorkingDay, reason, submittedAt, onClick ,status}) => (
  <Card margin={10} width={360}>
    <Heading margin={3}>{name}</Heading>
    <Text margin={3}>
                {status}
                <BadgeIcon as={(status == ResignationStatus.REVIEWED) ? CheckIcon : ClockIcon} />
            </Text>
    <Text margin={3}>Last working day: {lastWorkingDay}</Text>
    <VStack margin={3}>
      <Heading>Reason</Heading>
      <Textarea isReadOnly w="$64">
        <TextareaInput value={reason} />
      </Textarea>
    </VStack>
    <Text margin={3}>Submitted At: {submittedAt}</Text>

    <VStack margin={3}>
      <Button variant="solid" action={status === "REVIEWED" ? "secondary" : "primary"} onPress={() => onClick()} disabled={status === "REVIEWED"} >
        <BadgeText>{status === "REVIEWED" ? "Confirmed" : "Confirm"}</BadgeText>
      </Button>
    </VStack>
  </Card>
)

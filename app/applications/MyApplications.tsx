import { ApplicationCardforE } from "@/components/applications/ApplicationCardforE"
import { LeaveApplication } from "@/model/LeaveApplication"
import { deleteApplication, getApplicationByApplicant } from "@/service/ApplicationService"
import { Text, Card, Input, Button,InputField, ScrollView, HStack, AlertDialog, AlertDialogBackdrop, AlertDialogContent, AlertDialogHeader, Heading, AlertDialogCloseButton, Icon, CloseIcon, AlertDialogBody, AlertDialogFooter, ButtonGroup, ButtonText } from "@gluestack-ui/themed"
import React from "react"
import { useEffect } from "react"

export default function MyApplications() {
    const [value,setValue] = React.useState(0);
    const [showAlertDialog,setShowAlertDialog] = React.useState(false)
    const [applicationList, setApplicationList] = React.useState<LeaveApplication[]>([])
    useEffect(() => {
        let user = JSON.parse(localStorage.getItem('user') as string);
        getApplicationByApplicant(user.name).then(
            (data) => {
                setApplicationList(data);
            }
        ).catch(
            (error) => {
                console.log((error as Error).message)
            }
        )
    },[setApplicationList])
    const showDeleteModal = (application:LeaveApplication)=>{
        /*if(application.currentHandler!==application.applicant||application.status=="approved"){
          alert("The current application status does not support deletion operations！")
          return;
        }*/
        if(application.status==="approved"){
          alert("The current application status does not support deletion operations！")
          return;
        }
        setValue(application.id ?? 0);
        setShowAlertDialog(true);
    }
    const deleteCurrentApplication = ()=>{
        alert("successfully deleted");
        deleteApplication(value);
        setShowAlertDialog(false);
    }
    return (
        <ScrollView>
            <Card>
                <Text>
                    Range
                </Text>
                <Input>
                    <InputField value="default all range" />
                </Input>
            </Card>

            <HStack flexWrap="wrap">
                {
                    applicationList.map((application) => {
                        return (
                            <ApplicationCardforE
                                key={application.id}
                                application={application}
                                deleteApplication={(application)=>showDeleteModal(application)}
                                />
                        )
                    })
                }


            </HStack>
            <AlertDialog
        isOpen={showAlertDialog}
        onClose={() => {
          setShowAlertDialog(false)
        }}
      >
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading size="lg">Delete this application</Heading>
            <AlertDialogCloseButton>
              <Icon as={CloseIcon} />
            </AlertDialogCloseButton>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text size="sm">
              Are you sure you want to delete this application? This application will
              be permanently removed and cannot be undone.
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <ButtonGroup space="lg">
              <Button
                variant="outline"
                action="secondary"
                onPress={() => {
                  setShowAlertDialog(false)
                }}
              >
                <ButtonText>Cancel</ButtonText>
              </Button>
              <Button
                bg="$error600"
                action="negative"
                onPress={deleteCurrentApplication}
              >
                <ButtonText>Delete</ButtonText>
              </Button>
            </ButtonGroup>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </ScrollView>
    )
}
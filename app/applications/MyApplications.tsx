import { ApplicationCardforE } from "@/components/applications/ApplicationCardforE"
import { resolveCanDelete } from "@/components/applications/applicationDeleteRules";
import { LeaveApplication } from "@/model/LeaveApplication"
import { deleteApplication, getApplicationByApplicant, uploadSickProof } from "@/service/ApplicationService"
import { Text, Card, Input, Button,InputField, ScrollView, HStack, AlertDialog, AlertDialogBackdrop, AlertDialogContent, AlertDialogHeader, Heading, AlertDialogCloseButton, Icon, CloseIcon, AlertDialogBody, AlertDialogFooter, ButtonGroup, ButtonText } from "@gluestack-ui/themed"
import React from "react"
import { useEffect } from "react"

export default function MyApplications() {
    const [value,setValue] = React.useState(0);
    const [selectedApplication,setSelectedApplication] = React.useState<LeaveApplication | null>(null);
    const [showAlertDialog,setShowAlertDialog] = React.useState(false)
    const [isDeleting,setIsDeleting] = React.useState(false)
    const [applicationList, setApplicationList] = React.useState<LeaveApplication[]>([])
    const loadApplications = React.useCallback(async () => {
        let user = JSON.parse(localStorage.getItem('user') as string);
        const data = await getApplicationByApplicant(user.username);
        setApplicationList(data);
    },[setApplicationList])
    useEffect(() => {
        loadApplications().catch(
          (error) => {
              console.log((error as Error).message)
          }
        )
    },[loadApplications])
    const showDeleteModal = (application:LeaveApplication)=>{
        if(!resolveCanDelete(application)){
          alert("This application can no longer be deleted.")
          return;
        }
        setValue(application.id ?? 0);
        setSelectedApplication(application);
        setShowAlertDialog(true);
    }
    const deleteCurrentApplication = async()=>{
        if(!selectedApplication || !resolveCanDelete(selectedApplication)){
            alert("This application can no longer be deleted.");
            setShowAlertDialog(false);
            await loadApplications().catch((error) => console.log((error as Error).message));
            return;
        }

        setIsDeleting(true);
        try{
            await deleteApplication(value);
            alert("successfully deleted");
            setApplicationList((currentApplications)=>
                currentApplications.filter((application)=>application.id !== value)
            );
            setShowAlertDialog(false);
            setSelectedApplication(null);
        }catch(error){
            const status = (error as {response?: {status?: number}})?.response?.status;
            if(status===409){
                alert("This application can no longer be deleted.");
                await loadApplications().catch((loadError) => console.log((loadError as Error).message));
            }else{
                alert("Failed to delete this application. Please try again.");
            }
        }finally{
            setIsDeleting(false);
        }
    }
    const uploadProofForApplication = async(application:LeaveApplication, proof:File | Blob):Promise<LeaveApplication>=>{
        let user = JSON.parse(localStorage.getItem('user') as string);
        const updatedApplication = await uploadSickProof(application.id ?? 0, proof, user.username);
        setApplicationList((currentApplications)=>
            currentApplications.map((currentApplication)=>
                currentApplication.id === updatedApplication.id ? updatedApplication : currentApplication
            )
        );
        alert("Proof uploaded successfully.");
        return updatedApplication;
    }
    return (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Card>
                <Text>
                    Range
                </Text>
                <Input>
                    <InputField value="default all range" />
                </Input>
            </Card>

            <HStack flexWrap="wrap" space="lg" alignItems="stretch">
                {
                    applicationList.map((application) => {
                        return (
                            <ApplicationCardforE
                                key={application.id}
                                application={application}
                                deleteApplication={(application)=>showDeleteModal(application)}
                                uploadSickProof={uploadProofForApplication}
                                />
                        )
                    })
                }


            </HStack>
            <AlertDialog
        isOpen={showAlertDialog}
                onClose={() => {
                  setShowAlertDialog(false)
                  setSelectedApplication(null)
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
                  setSelectedApplication(null)
                }}
                isDisabled={isDeleting}
              >
                <ButtonText>Cancel</ButtonText>
              </Button>
              <Button
                bg="$error600"
                action="negative"
                onPress={deleteCurrentApplication}
                isDisabled={isDeleting}
              >
                <ButtonText>{isDeleting?"Deleting...":"Delete"}</ButtonText>
              </Button>
            </ButtonGroup>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </ScrollView>
    )
}

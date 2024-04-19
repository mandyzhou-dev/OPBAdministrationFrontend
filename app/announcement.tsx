import { deleteAnnouncement, getAnnouncementByAfter } from '@/service/AnnouncementService';
import { HStack,Heading, ScrollView, Text  ,AlertDialog, AlertDialogBackdrop, AlertDialogContent, AlertDialogHeader, AlertDialogCloseButton, Icon, CloseIcon, AlertDialogBody, AlertDialogFooter, ButtonGroup, ButtonText ,Button} from '@gluestack-ui/themed';
import { useEffect } from 'react';
import { Announcement } from '@/model/Announcement'
import React from 'react';
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard';
import { DeviceEventEmitter } from 'react-native';
import { ModifyModal } from '@/components/announcements/ModifyModal';
export default function ModalScreen() {
  const [announcementList, setAnnouncementList] = React.useState<Announcement[]>([]);
  const [value, setValue] = React.useState(0);
  const [modifyValue,setModifyValue] = React.useState<Announcement>(new Announcement());
  const [showOP,setShowOP] = React.useState(false);
  const [showAlertDialog, setShowAlertDialog] = React.useState(false)
  const [showModal,setShowModal] = React.useState(false)
  useEffect(() => {
    let user = JSON.parse(localStorage.getItem('user'));
    if (user.roles == 'Manager') {
      getAnnouncementByAfter(new Date(2023-12-12)).then(
        (data) => {
          setAnnouncementList(data);
          setShowOP(true);
          console.log(data);
          console.log(announcementList);
          //console.log(new Date());
        }
      ).catch(
        (error) => {
          console.log((error as Error).message)
        }
      )
    }
    else {
      getAnnouncementByAfter(new Date()).then(
        (data) => {
          setAnnouncementList(data);

          console.log(data);
          console.log(announcementList);
          //console.log(new Date());
        }
      ).catch(
        (error) => {
          console.log((error as Error).message)
        }
      )
    }
  }, [])
  const showDeleteModal=(id: number)=>{
    setValue(id);
    setShowAlertDialog(true)
    // setShowAlertDialog(false)
    // deleteAnnouncement(id)
    // onClose()
  }
  const showModifyModal=(value:Announcement)=>{
    setModifyValue(value);
    console.log("announcement:" + value);
    setShowModal(true);
  }
  const deleteCurrentAnnouncement=()=>{
    deleteAnnouncement(value);
    setShowAlertDialog(false)
    
  }


  if (announcementList.length === 0) {
    return (<div>loading</div>)
  }

  return (
    <ScrollView>
      <HStack flexWrap="wrap">
        {
          //announcementList.length === 0 ? "Loading" :{
          announcementList.map((announcement) => {
            return (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                showOperation={showOP}
                deleteAnnouncement={(id) => showDeleteModal(id)}
                modifyAnnouncement={(id)=>showModifyModal(announcement)}
              />

            )
          })
        }

      </HStack>
      <ModifyModal
        announcement={modifyValue}
         showModal ={showModal}
         setShowModal={setShowModal}
      />
      <AlertDialog
                isOpen={showAlertDialog}
                onClose={() => {
                    setShowAlertDialog(false)
                }}
            >
                <AlertDialogBackdrop />
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Heading size="lg">Delete this announcement</Heading>
                        <AlertDialogCloseButton>
                            <Icon as={CloseIcon} />
                        </AlertDialogCloseButton>
                    </AlertDialogHeader>
                    <AlertDialogBody>
                        <Text size="sm">
                            Are you sure you want to delete this announcement? This announcement will
                            be permanently removed and cannot be undone.
                        </Text>ß
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
                                onPress={deleteCurrentAnnouncement}
                            >
                                <ButtonText>Delete</ButtonText>
                            </Button>
                        </ButtonGroup>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
    </ScrollView>
  );
}



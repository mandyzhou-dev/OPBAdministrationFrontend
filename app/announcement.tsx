import { deleteAnnouncement, getAnnouncementByAfter, getReadStatusByIdAndReader, getUnreadListByReader } from '@/service/AnnouncementService';
import { HStack, Heading, ScrollView, Text, AlertDialog, AlertDialogBackdrop, AlertDialogContent, AlertDialogHeader, AlertDialogCloseButton, Icon, CloseIcon, AlertDialogBody, AlertDialogFooter, ButtonGroup, ButtonText, Button, VStack } from '@gluestack-ui/themed';
import { useEffect } from 'react';
import { Announcement } from '@/model/Announcement'
import React from 'react';
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard';
import { DeviceEventEmitter } from 'react-native';
import { ModifyModal } from '@/components/announcements/ModifyModal';
import Badge from '@mui/material/Badge';
import { MoreModal } from '@/components/announcements/MoreModal';

export default function announcement(){
  const [announcementList, setAnnouncementList] = React.useState<Announcement[]>([]);
  const [value, setValue] = React.useState(0);
  const [modifyValue, setModifyValue] = React.useState<Announcement>(new Announcement());
  const [showOP, setShowOP] = React.useState(false);
  const [showAlertDialog, setShowAlertDialog] = React.useState(false)
  const [showModal, setShowModal] = React.useState(false)
  const [showMore,setShowMore] = React.useState(false);
  const [moreValue, setMoreValue] = React.useState<Announcement>(new Announcement());
  useEffect(() => {
    let user = JSON.parse(localStorage.getItem('user') as string);
    if (user.roles == 'Manager') {
      getAnnouncementByAfter(new Date(2023 - 12 - 12)).then(
        (announcementList) => {
          getUnreadListByReader(user.username).then(
            (data)=>{
              
              let i:number;
              let j:number;
              for(i = 0;i<announcementList.length;++i){
                announcementList[i].isRead = true;
              }
              for(i = 0;i<announcementList.length;++i){
                for(j = 0;j<data.length;j++){
                  if(announcementList[i].id == data[j]) announcementList[i].isRead = false;
                }
              }
              
              setAnnouncementList(announcementList);
              
              
            }
          ).catch(
            (error)=>{
              console.log((error as Error).message)
            }
          )
          //setAnnouncementList(announcementList);
          setShowOP(true);
          //console.log(announcementList);
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
        (announcementList) => {
          //set has delay. So transfer it to getunread first and then render it(set it).
          //setAnnouncementList(data);
          getUnreadListByReader(user.username).then(
            (data)=>{
              
              let i:number;
              let j:number;
              for(i = 0;i<announcementList.length;++i){
                announcementList[i].isRead = true;
              }
              for(i = 0;i<announcementList.length;++i){
                for(j = 0;j<data.length;j++){
                  if(announcementList[i].id == data[j]) announcementList[i].isRead = false;
                }
              }
              
              setAnnouncementList(announcementList);
              
              
            }
          ).catch(
            (error)=>{
              console.log((error as Error).message)
            }
          )
          //console.log(data);
          //console.log(announcementList);
          //console.log(new Date());
        }
      ).catch(
        (error) => {
          console.log((error as Error).message)
        }
      )
    }
   


  }, [])


  const showDeleteModal = (id: number) => {
    setValue(id);
    setShowAlertDialog(true)
    // setShowAlertDialog(false)
    // deleteAnnouncement(id)
    // onClose()
  }
  const showModifyModal = (value: Announcement) => {
    setModifyValue(value);
    console.log("announcement:" + value);
    setShowModal(true);
  }
  const showMoreModal = (value:Announcement)=>{
    setMoreValue(value);
    setShowMore(true);
  }
  const deleteCurrentAnnouncement = () => {
    deleteAnnouncement(value);
    setShowAlertDialog(false)

  }


  if (announcementList.length === 0) {
    return (<Text>loading</Text>)
  }

  return (
    <ScrollView>
      <HStack flexWrap="wrap">
        {
          //announcementList.length === 0 ? "Loading" :{
          announcementList.map((announcement) => {
            return (
              <VStack key={announcement.id} margin={3}>
                <Badge color="error" variant="dot" invisible={announcement.isRead} overlap='circular'>
                  <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    showOperation={showOP}
                    deleteAnnouncement={(id) => showDeleteModal(id)}
                    modifyAnnouncement={(id) => showModifyModal(announcement)}
                    
                    showMore = {()=>showMoreModal(announcement)}
                  />
                  </Badge>
              </VStack>


            )
          })
        }

      </HStack>
      <ModifyModal
        announcement={modifyValue}
        showModal={showModal}
        setShowModal={setShowModal}
      />
      <MoreModal 
        announcement = {moreValue}
        showModal = {showMore}
        setShowModal = {setShowMore}
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



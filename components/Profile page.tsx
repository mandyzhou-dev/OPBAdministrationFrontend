import { StyleSheet } from 'react-native';
import TextField from '@mui/material/TextField';
import { ButtonText, Card, Center, Text, View, Button,Pressable, HStack, VStack } from '@gluestack-ui/themed';
import { User } from '@/model/User';
import { ScrollView } from 'react-native';
import { router } from 'expo-router';
import moment from 'moment';

export const Profile: React.FC = () => {
        //password ，birthdate,roles,sin and documents
    //They donot need to see their birthdate roles, sin , legalname and documents
    //They donnot need to assign their roles .
    const user = JSON.parse(localStorage.getItem("user"));

    return (
            <VStack>
                <Center margin={3} >
                    <Text size="2xl" color="white" >{user.name}</Text>
                </Center>
                <Card margin={3}>
                    <TextField
                        required
                        id="outlined-required"
                        label="Username"
                        defaultValue={user.username}
                    />
                </Card>
                <Card margin={3}>
                    <Pressable
                        onPress={() => router.navigate("/setPassword?username=" + user.username)}
                        p="$2"
                        //bg="$primary500"
                        $hover-bg="$primary400"
                    >
                        <Text>Set Password</Text>
                    </Pressable>
                </Card>
                
                <Card margin={3}>
                    <TextField
                            required
                            id="outlined-required"
                            label="Email"
                            defaultValue={user.email}
                        />
                </Card>
                <Card margin={3}>
                    <TextField
                            required
                            id="outlined-required"
                            label="Birthdate"
                            defaultValue={moment(user.birthdate).format("YYYY/MM/DD")}
                            
                        />
                </Card>
                <Card margin={3}>
                    <TextField
                            required
                            id="outlined-required"
                            label="PhoneNumber"
                            defaultValue={user.phoneNumber}
                        />
                </Card>

                <Card margin={3}>
                    <TextField
                            required
                            id="outlined-required"
                            label="Address"
                            defaultValue={user.address}
                        />
                </Card>
                <Button
                    ml="auto"
                    variant="link"
                    onPress={() => {
                        localStorage.removeItem('user');
                        //should router to my,but some bugs that:log in cannot fetch the name
                        window.location.reload();

                        //router.navigate("/my")
                    }
                    }
                    marginLeft={0}
                >
                    <ButtonText color='white'>Log out</ButtonText>
                </Button>
            </VStack>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingBottom: 20,
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
});
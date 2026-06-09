import { StyleSheet } from 'react-native';
import TextField from '@mui/material/TextField';
import { ButtonText, Card, Center, Text, Button, Pressable, VStack } from '@gluestack-ui/themed';
import { router } from 'expo-router';

export const Profile: React.FC = () => {
    const user = JSON.parse(localStorage.getItem("user") as string);
    return (
        <VStack>
            <Center margin={3} >
                <Text size="2xl" color="white" >{user?.name}</Text>
            </Center>
            <Card margin={3}>
                <TextField
                    required
                    id="outlined-required"
                    label="Username"
                    defaultValue={user?.username}
                />
            </Card>
            <Card margin={3}>
                <Pressable
                    onPress={() => router.navigate("/setPassword?username=" + user?.username)}
                    p="$2"
                    bg="$white"
                    //bg="$primary500"
                    $hover-bg="$light200"
                >
                    <Text>Set Password</Text>
                </Pressable>
            </Card>
            <Button
                ml="auto"
                variant="link"
                onPress={() => {
                    localStorage.removeItem('user');
                    //should router to my,but nothing changed when router.naviate("/my")
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

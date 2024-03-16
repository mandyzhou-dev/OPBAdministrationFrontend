import { StyleSheet } from 'react-native';
import TextField from '@mui/material/TextField';
import { Card, Center, Text, View } from '@gluestack-ui/themed';
import { User } from '@/model/User';

export const Profile: React.FC = () => {
    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <View >
            <Center margin={3} >
                <Text size="2xl" color="white" >Profile Page</Text>
            </Center>
            <Card margin={3}>
                <TextField
                    required
                    id="outlined-required"
                    label="Name"
                    defaultValue={user.name}
                />
            </Card>
            <Card margin={3}>
            <TextField
                    required
                    id="outlined-required"
                    label="roles"
                    defaultValue={user.roles}
                />
            </Card>
            <Card margin={3}>
                <Text>
                    Email
                </Text>
            </Card>
        </View>
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
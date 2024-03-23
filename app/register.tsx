import { Button, ButtonText, Text, View ,Center, Card} from "@gluestack-ui/themed"
import { Stack } from "expo-router"
import TextField from '@mui/material/TextField';
export default function Register() {
    //password ，birthdate,roles,sin and documents
    //They donot need to see their birthdate roles, sin , legalname and documents
    //They donnot need to assign their roles .
    return (
        <View>
            <Center margin={3} >
                <Text size="2xl"  >Create Account</Text>
            </Center>
            <Card margin={3}>
            <TextField
                    required
                    id="outlined-required"
                    label="username"
                    placeholder="create your login name"
                />
            </Card>
            <Card margin={3}>
            <TextField
                    required
                    id="outlined-required"
                    label="name"
                    placeholder="The nickname you want to use in work"
                />
            </Card>
            <Card margin={3}>
            <TextField
                    required
                    id="outlined-required"
                    label="E-mail"
                    placeholder="Your email address for e-transfer payment"
                />
            </Card>
            <Card margin={3}>
            <TextField
                    required
                    id="outlined-required"
                    label="legalname"
                    placeholder="Your name on your lagal ID"
                />
            </Card>
            <Card margin={3}>
            <TextField
                    required
                    id="outlined-required"
                    label="sinno"
                    placeholder="Your SIN Number"
                />
            </Card>
            <Card margin={3}>
            <TextField
                    required
                    id="outlined-required"
                    label="address"
                    placeholder="Your address"
                />
            </Card>
            <Card margin={3}>
            <TextField
                    required
                    id="outlined-required"
                    label="phonenumber"
                    placeholder="Your phone number"
                />
            </Card>
            
            <Button
                margin={10}
                width={"$1/6"}
                action="positive"
                onPress={()=>{}}
            >
                <ButtonText>Done</ButtonText>
            </Button>
            
        </View>


    )
}
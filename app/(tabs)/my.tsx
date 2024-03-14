import { StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { View } from '@/components/Themed';
import { AtSignIcon, ButtonIcon, Image,ButtonText, Button, Text,Card, Input, InputField, FormControl, VStack, Heading, InputSlot, InputIcon, EyeIcon, EyeOffIcon, Center } from '@gluestack-ui/themed';
import { useState } from 'react';
import * as UserService from '@/service/UserService';
export default function MyScreen() {

    const [showPassword, setShowPassword] = useState(false)
    const [username,setUsername] = useState('')
    const [password, setPassword] = useState('')
    const handleState = () => {
      setShowPassword((showState) => {
        return !showState
      })
    }

    const login=()=>{
        console.log(username)
        UserService.login(username,password)
    }

    return (
        <View style={styles.container}>
            <View style={styles.separator} >
                <Center margin={50} >
                    <Image source={"../assets/images/brand.jpeg"} size='xs'/>
                    <Text color='white' fontWeight='bold'>Welcome back.</Text>
                    <Text color='white' fontWeight ='bold'>Sign in to your account.</Text>
                </Center>
                <FormControl
                    bgColor='white'
                    p="$4"
                    borderWidth="$1"
                    borderRadius="$lg"
                    borderColor="$borderLight300"
                    $dark-borderWidth="$1"
                    $dark-borderRadius="$lg"
                    $dark-borderColor="$borderDark800"
                    alignItems='center'
                >
                    <VStack space="xl">
                        <Heading color="$text900" lineHeight="$md">
                            Login
                        </Heading>
                        <VStack space="xs">
                            <Text color="$text500" lineHeight="$xs">
                                Email
                            </Text>
                            <Input>
                                <InputField value={username} onChangeText={(d)=>setUsername(d)} type="text" placeholder='Enter your Email address'/>
                            </Input>
                        </VStack>
                        <VStack space="xs">
                            <Text color="$text500" lineHeight="$xs">
                                Password
                            </Text>
                            <Input >
                                <InputField value={password} onChangeText={(d)=>setPassword(d)} type={showPassword ? "text" : "password"} placeholder='Password'/>
                                <InputSlot pr="$3" onPress={handleState}>
                                    {/* EyeIcon, EyeOffIcon are both imported from 'lucide-react-native' */}
                                    <InputIcon
                                        as={showPassword ? EyeIcon : EyeOffIcon}
                                        color="$darkBlue500"
                                    />
                                </InputSlot>
                            </Input>
                        </VStack>
                        <Button
                            ml="auto"
                            onPress={login}
                        >
                            <ButtonText color="$white">Sign in</ButtonText>
                        </Button>
                    </VStack>
                </FormControl>

            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: "#92a8d1",
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 50,
        height: 0,
        width: '90%',
        alignItems:'center'
    },
});

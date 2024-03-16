import EditScreenInfo from '@/components/EditScreenInfo';
import { View } from '@/components/Themed';
import { Image, ButtonText, Button, Text, Input, InputField, FormControl, VStack, Heading, InputSlot, InputIcon, EyeIcon, EyeOffIcon, Center, InfoIcon, HStack } from '@gluestack-ui/themed';
import { useState } from 'react';
import {Alert, AlertIcon, AlertText} from '@gluestack-ui/themed'
import * as UserService from '@/service/UserService';
interface LoginProps {
    //setShowLogin:React.Dispatch<any>;
    onLogined: () => void;
}
export const Login: React.FC<LoginProps> = ({ onLogined }) => {

    const [showPassword, setShowPassword] = useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showErrorAlert, setShowErrorAlert] = useState(false)
    const handleState = () => {
        setShowPassword((showState) => {
            return !showState
        })
    }

    const login = () => {
        console.log(username)
        UserService.login(username, password).then(onLogined)
            .catch(
                (error) => {
                    setShowErrorAlert(true);
                    setTimeout(()=>{setShowErrorAlert(false)},5000)
                }
            )
        //you can type "localStorage.removeItem("user")" to clear the sessionID for test
    }

    return (
        <View >
            <Center margin={50} >
                <Image source={"../assets/images/brand.jpeg"} size='xs' />
                <Text color='white' fontWeight='bold'>Welcome back.</Text>
                <Text color='white' fontWeight='bold'>Sign in to your account.</Text>
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
                            <InputField value={username} onChangeText={(d) => setUsername(d)} type="text" placeholder='Enter your Email address' />
                        </Input>
                    </VStack>
                    <VStack space="xs">
                        <Text color="$text500" lineHeight="$xs">
                            Password
                        </Text>
                        <Input >
                            <InputField value={password} onChangeText={(d) => setPassword(d)} type={showPassword ? "text" : "password"} placeholder='Password' />
                            <InputSlot pr="$3" onPress={handleState}>
                                {/* EyeIcon, EyeOffIcon are both imported from 'lucide-react-native' */}
                                <InputIcon
                                    as={showPassword ? EyeIcon : EyeOffIcon}
                                    color="$darkBlue500"
                                />
                            </InputSlot>
                        </Input>
                    </VStack>
                    <HStack>
                    <Button
                        ml="auto"
                        variant="link"
                        onPress={login}
                        marginLeft={0}
                    >
                        <ButtonText >Register</ButtonText>
                    </Button>
                    <Button
                        ml="auto"
                        onPress={login}
                    >
                        <ButtonText color="$white">Sign in</ButtonText>
                    </Button>
                    </HStack>
                    
                </VStack>
            </FormControl>
            { showErrorAlert?
                (<Alert mx="$2.5" action="error" variant="solid" >
                    <AlertIcon as={InfoIcon} mr="$3" />
                    <AlertText>
                        Login failed!
                    </AlertText>
                </Alert>) : ""}
        </View>
    )
}
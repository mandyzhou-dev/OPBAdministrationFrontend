import { StyleSheet } from 'react-native';
import { ScrollView, Card, Box, HStack, Pressable, Link, LinkText, VStack,Text} from '@gluestack-ui/themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
export default function TabTwoScreen() {


  return (
    <ScrollView style={styles.container}>
      <HStack>
        <VStack>
        <Pressable
          onPress={() => { router.navigate("/tasks/assignment") }}
          p="$5"
          $hover-bg="$secondary100"
        >
          <Card margin={3}>
            <FontAwesome name="edit" size={100} color="black" />

          </Card>
        </Pressable>
        <Text ml={40} mt={-20}>Make shifts</Text>

        </VStack>
        
        <VStack>
        <Pressable
          onPress={() => router.navigate("/tasks/statistics")}
          p="$5"
          $hover-bg="$secondary100"
        >
          <Card margin={3}>
            <FontAwesome name="bar-chart-o" size={100} color="black" />

          </Card>
        </Pressable>
        
          <Text ml={40} mt={-20}>Statistics</Text>
        

        </VStack>
        
      </HStack>
    </ScrollView>
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
  },
  separator: {
    marginVertical: 10,
    height: 1,
    width: '80%',
  },
});

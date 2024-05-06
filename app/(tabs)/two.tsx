import { StyleSheet } from 'react-native';
import { ScrollView, Card, Box, HStack, Pressable, Link, LinkText, VStack } from '@gluestack-ui/themed';
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
        <Link href="../tasks/assignment" ml={40} mt={-20}>
            <LinkText> Make a shift</LinkText>
        </Link>

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
        <Link href="../tasks/statistics" ml={40} mt={-20}>
            <LinkText> Statistics</LinkText>
        </Link>
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

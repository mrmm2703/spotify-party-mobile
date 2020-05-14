import React, { useState } from "react";
import { StyleSheet, Text, View, Image, Button, Dimensions, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

function ConnectToSpotifyPage({ navigation }) {
  const win = Dimensions.get("window").width;
  const win2 = win * 0.8;
  const ratio = win2/1500;
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#191414',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    button: {
      marginBottom: 100
    },
    logo: {
      width: win2,
      height: 475 * ratio,
      marginTop: 75,
    },
    text: {
      color: "#FFFFFF",
      textAlign: "center",
      fontWeight: "300"
    },
    text_header: {
      color: "#FFFFFF",
      fontSize: 30,
      textAlign: "center",
      fontWeight: "700"
    },
    scroller: {
      width: win2,
      height: win2,
    },
    image: {
      width: win2,
      height: (win2/ 1423) * 767,
      marginTop: 30,
      resizeMode: "cover",
    }
  });

  return (
    <View style={styles.container}>
      <Image source={require("./assets/logo.png")} style={styles.logo}/>
      <View style={styles.scroller}>
        <ScrollView
        horizontal = {true}
        decelerationRate={0}
        snapToInterval={win2}
        snapToAlignment={"center"}
        alignItems={"center"}
        justifyContent={"space-between"}
        style={styles.scroller}>
          <View style={{width: win2}}>
            <Text style={styles.text_header}>Music. Together.</Text>
            <Image style={styles.image} source={require("./assets/screenshot.png")} />
          </View>
          <View style={{width: win2}}>
          <Text style={styles.text_header}>Now on mobile.</Text>
          </View>
        </ScrollView>
      </View>

      <View style={styles.button}>
        <Button
          color="#1DB954"
          title="Connect to Spotify"
          onPress={() => navigation.navigate("Join Party")}
        />
      </View>
    </View>
  )
}

function JoinPartyPage({ navigation }) {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ff1111',
      alignItems: 'center',
      justifyContent: 'center',
    }
  });

  return (
    <View style={styles.container}>

    </View>
  )
}

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
      initialRouteName="Connect to Spotify"
      screenOptions={{headerShown: false}}>
        <Stack.Screen name="Connect to Spotify" component={ConnectToSpotifyPage} />
        <Stack.Screen name="Join Party" component={JoinPartyPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
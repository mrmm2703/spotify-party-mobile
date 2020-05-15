import React, { useState } from "react";
import { StyleSheet, Text, View, Image, Button, Dimensions, ScrollView, Linking, TextInput } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as WebBrowser from 'expo-web-browser';

const endpoint = "https://accounts.spotify.com/en/authorize?client_id=d7bc09b9fc624ecfb3345d126c96f61f&redirect_uri=exp:%2F%2F192.168.1.148:19000&response_type=token&scope=streaming%20user-read-email%20user-modify-playback-state%20user-read-private&show_dialog=true"
let access_token = "NULL";
let party_code = "NULL";
const Stack = createStackNavigator();

// Deep link handler
Linking.addEventListener("url", _handleUrl)

function _handleUrl(event) {
  WebBrowser.dismissBrowser();
  let acc = event.url;
  access_token = acc.split("=")[1].split("&")[0];
  console.log(access_token)
}

const win = Dimensions.get("window").width;
const win2 = win * 0.8;
const ratio = win2/1500;

// Connect to Spotify Landing Page
function ConnectToSpotifyPage({ navigation }) {
  // Stylesheet
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
    text_header_2: {
      color: "#FFFFFF",
      fontSize: 30,
      textAlign: "center",
      fontWeight: "700",
      marginTop: win2/3
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

  function buttonHandler() {
    navigation.push("Join Party");
    WebBrowser.openBrowserAsync(endpoint);
  }

  // Layout
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
        showsHorizontalScrollIndicator={false}
        style={styles.scroller}>
          <View style={{width: win2}}>
            <Text style={styles.text_header}>Music. Together.</Text>
            <Image style={styles.image} source={require("./assets/screenshot.png")} />
          </View>
          <View style={{width: win2}}>
          <Text style={styles.text_header_2}>Now on mobile.</Text>
          </View>
        </ScrollView>
      </View>

      <View style={styles.button}>
        <Button
          color="#1DB954"
          title="Connect to Spotify"
          onPress={buttonHandler}
        />
      </View>
    </View>
  )
}

// Join Party Page
function JoinPartyPage({ navigation }) {
    // Stylesheet
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
      text_header: {
        color: "#FFFFFF",
        fontSize: 30,
        textAlign: "center",
        fontWeight: "700"
      },
      text_input: {
        width: win2,
        height: 50,
        color: "#FFFFFF",
        backgroundColor: "#292424",
        textAlign: "center",
        marginTop: 50,
        fontSize: 20,
        borderRadius: 5,
      }
    });
  
  // Check for input and access token
  function buttonHandler() {
    if (access_token == "NULL") {
      alert("Please connect to Spotify first");
      navigation.popToTop();
    } else {
      if (party_inp == "") {
        alert("Please enter a valid party code");
      } else {
        console.log("Continueeeee");
      }
    }
    
  }

  const [party_inp, onChangeText] = React.useState("");
  return (
    <View style={styles.container}>
      <View style={{marginTop: 150}}>
      <Text style={styles.text_header}>Join Party</Text>
      <TextInput
        style={styles.text_input}
        onChangeText={text => onChangeText(text)}
        placeholder="Party code"
        value={party_inp}
      />  
      </View>
      <View style={styles.button}>
      <Button
        color="#1DB954"
        title="Join Party"
        onPress={buttonHandler}
      />
      </View>
    </View>
  )
}

// Main app
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
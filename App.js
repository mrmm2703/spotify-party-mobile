import React, { useState } from "react";
import { StyleSheet, Text, View, Image, Button, Dimensions, ScrollView, Linking, TextInput } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as WebBrowser from 'expo-web-browser';
import io from "socket.io-client";

const endpoint = "https://accounts.spotify.com/en/authorize?client_id=d7bc09b9fc624ecfb3345d126c96f61f&redirect_uri=exp:%2F%2F192.168.1.148:19000&response_type=token&scope=streaming%20user-read-email%20user-modify-playback-state%20user-read-private&show_dialog=true"
let access_token = "NULL";
let party_code = "NULL";
const Stack = createStackNavigator();

// Deep link handler
Linking.addEventListener("url", _handleUrl)

function _handleUrl(event) {
  // WebBrowser.dismissBrowser();
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
    scroller: {
      width: win2,
      height: win2,
    },
    image: {
      width: win2-20,
      height: ((win2-20)/ 1423) * 767,
      marginLeft: 10,
      marginTop: 30,
      resizeMode: "cover",
      borderRadius: 10,
    },
    image2: {
      width: win2-130,
      height: ((win2-130)/ 906) * 1024,
      marginLeft: 65,
      marginTop: 30,
      resizeMode: "cover",
      borderRadius: 10,
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
          <Text style={styles.text_header}>Now on mobile.</Text>
            <Image style={styles.image2} source={require("./assets/mobile_screenshot.png")} />
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
  init_done = false;
  chatMessagesGlobal = [];
  msgId = 0;
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
      if (party_inp.length < 5) {
        alert("Party code must be at least 4 characters");
      } else {
        if (socket !== undefined) {
          socket.close();
          socket = io.connect("https://fourone.ddns.net:3000");
        }
        
        console.log("Continueeeee");
        party_code = party_inp;
        navigation.push("Spotify Party");

        // Get user information from Spotify
        fetch("https://api.spotify.com/v1/me", {
          method: "GET",
          headers: {
            "Authorization": "Bearer " + access_token
          }})
          .then((response) => response.json())
          .then((json) => {
            // Profile image URL
            if (!(json["images"].length == 0)) {
              _profile_url = json["images"][0]["url"];
            } else {
              _profile_url = "https://fourone.ddns.net:3000/img/empty-profile.png";
            }
            // Premium status
            if (json["product"] !== "premium") {
              alert("You need Spotify Premium to use music sync features!");
              _premium = false;
            } else {
              _premium = true;
            }
            // User's name
            _name = json["display_name"];
            _id = json["id"];
            console.log(_name);
            console.log(_profile_url);
            console.log(_premium);
            // Send to server
            socket.emit("name", {premium: _premium, name: json["display_name"], id: json["id"], profile_url: _profile_url, chatroom: party_code})
          })
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

let _premium;
let _name = "NULL";
let _profile_url = "NULL";
let _id = "NULL";
let socket = io.connect("https://fourone.ddns.net:3000");

function SkipRoom(myData) {
  if (!(myData == party_code)) {
    return true;
  } else {
    return false;
  }
}

let init_done = false;
let chatMessagesGlobal = [];
let msgId = 0;

// Party Page
function PartyPage({ navigation }) {
  // Stylesheet
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#191414',
      alignItems: 'center',
    },
    header_container: {
      height: 80,
      backgroundColor: "#242424",
      position: "absolute",
      top: 0,
      right: 0,
      left: 0
    },
    prof_pic: {
      position: "absolute",
      left: 8,
      width: 40,
      height: 40,
      bottom: 8,
    },
    header_text_container: {
      position: "absolute",
      right: 8,
      bottom: 8,
    },
    header_text_party_code: {
      textAlign: "right",
      fontSize: 12,
      color: "#707070",
    },
    header_text_party_code_code: {
      textAlign: "right",
      fontSize: 12,
      color: "#B9B9B9",
    },
    header_text_name: {
      textAlign: "right",
      fontSize: 24,
      color: "#F5F5F5",
    },
    message_container: {
      position: "absolute",
      bottom: 0,
      right: 0,
      left: 0,
      height: 50,
      backgroundColor: '#191414',
      width: "100%"
    },
    message_input: {
      backgroundColor: "#323232",
      position: "absolute",
      bottom: 8,
      left: 8,
      right: 8,
      height: "100%",
      color: "#FFFFFF",
      paddingHorizontal: 5,
      fontSize: 20,
      borderRadius: 5,
    },
    scroller_container: {
      position: "absolute",
      top: 80,
      bottom: 66,
      left: 8,
      right: 8,
    },
    chat_left: {
      width: "70%",
      marginRight: "20%",
      flexDirection: "row",
      alignItems: "center",
      marginTop: 17,
    },
    chat_left_arrow: {
      width: 128/7,
      height: 150/7,
    },
    chat_left_body: {
      backgroundColor: "#F5F5F5",
      marginLeft: -1,
      width: "100%"
    },
    chat_left_name: {
      color: "#605353",
      marginTop: 6,
      marginLeft: 10,
      fontSize: 16,
    },
    chat_left_message: {
      color: "#191414",
      marginTop: 0,
      marginLeft: 10,
      fontSize: 16,
    },
    chat_left_message_emp: {
      color: "#191414",
      marginTop: 0,
      marginLeft: 10,
      fontSize: 16,
      fontStyle: "italic",
    },
    chat_left_time: {
      color: "#605353",
      textAlign: "right",
      marginRight: 10,
      marginBottom: 6,
    },
    chat_right: {
      width: "70%",
      marginLeft: "25%",
      flexDirection: "row",
      alignItems: "center",
      marginTop: 17,
    },
    chat_right_body: {
      backgroundColor: "#F5F5F5",
      marginRight: -1,
      width: "100%"
    },
    chat_right_name: {
      color: "#605353",
      marginTop: 6,
      marginLeft: 10,
      fontSize: 16,
    },
    chat_right_message: {
      color: "#191414",
      marginTop: 0,
      marginLeft: 10,
      fontSize: 16,
    },
    chat_right_message_emp: {
      color: "#191414",
      marginTop: 0,
      marginLeft: 10,
      fontSize: 16,
      fontStyle: "italic",
    },
    chat_right_time: {
      color: "#605353",
      textAlign: "right",
      marginRight: 10,
      marginBottom: 6,
    },
    scroller: {
      width: "100%",
    }
  });

  let [state, setState] = React.useState({
    chatMessage: "",
    chatMessages: chatMessagesGlobal,
  });

  let time = "NULL";
  // Chat maker
  function Chat(myName, myId, myMsg, myEmp, msgId) {
    let date = new Date();
    time = date.getHours() + ":" + date.getMinutes();
    if (myEmp) {
      if (myId == _id) {
        console.log("EMP, ME");
        return(
          <View key={msgId} style={styles.chat_right}>
          <View style={styles.chat_right_body}>
              <Text style={styles.chat_right_name}>{myName}</Text>
              <Text style={styles.chat_right_message_emp}>{myMsg}</Text>
              <Text style={styles.chat_right_time}>{time}</Text>
          </View>
          <Image style={styles.chat_left_arrow} source={require("./assets/chat-arrow-right.png")}/>
        </View>
        )
      } else {
        console.log("EMP, !ME");
        return(
          <View key={msgId} style={styles.chat_left}>
              <Image style={styles.chat_left_arrow} source={require("./assets/chat-arrow-left.png")}/>
              <View style={styles.chat_left_body}>
                <Text style={styles.chat_left_name}>{myName}</Text>
                <Text style={styles.chat_left_message_emp}>{myMsg}</Text>
                <Text style={styles.chat_left_time}>{time}</Text>
              </View>
            </View>
        )
      }
    } else {
      if (myId == _id) {
        console.log("!EMP, ME");
        return(
          <View key={msgId} style={styles.chat_right}>
              <View style={styles.chat_right_body}>
                  <Text style={styles.chat_right_name}>{myName}</Text>
                  <Text style={styles.chat_right_message}>{myMsg}</Text>
                  <Text style={styles.chat_right_time}>{time}</Text>
              </View>
              <Image style={styles.chat_left_arrow} source={require("./assets/chat-arrow-right.png")}/>
            </View>
        )
      } else {
        console.log("!EMP, ME");
        return(
        <View key={msgId} style={styles.chat_left}>
              <Image style={styles.chat_left_arrow} source={require("./assets/chat-arrow-left.png")}/>
              <View style={styles.chat_left_body}>
                <Text style={styles.chat_left_name}>{myName}</Text>
                <Text style={styles.chat_left_message}>{myMsg}</Text>
                <Text style={styles.chat_left_time}>{time}</Text>
              </View>
            </View>
        )
      }
    }
  }

  const [name, setName] = React.useState(_name);
  const [profile_url, setProfileUrl] = React.useState(_profile_url);
  setTimeout(function() {
    setName(_name);
    setProfileUrl(_profile_url)
  }, 400);

  // Listeners
  function gotMsg(data) {
    if (SkipRoom(data.chatroom)) {
      return;
    }
    console.log("Got message!");
    console.log(data.message);
    chatMessagesGlobal.push(data);
    setState({ chatMessages: chatMessagesGlobal});
  }
  // One timers
  if (!(init_done)) {
    // Socket listeners
    console.log("MAKING LISTENER")
    socket.on("message", (data) => {
      if (SkipRoom(data.chatroom)) {
        return;
      }
      data.msgId = msgId;
      msgId = msgId + 1;
      gotMsg(data);
      // setChats(chats.push(Chat("Name", "NULL", "myMsg", false)));
    })
    init_done = true
  }

  const [message_input, onChangeMessage] = React.useState("");
  const chatMessages = state.chatMessages.map(chatMessage => (
    Chat(chatMessage.name, chatMessage.id, chatMessage.message, false, chatMessage.msgId)
  ))

  // Reactors
  function sendMsg() { // Emit message
    onChangeMessage("");
    socket.emit("message", {message: message_input});
  }
  function sendTyping(text) { // Emit typing
    socket.emit("typing");
    onChangeMessage(text);
  }
  return (
    <View style={styles.container}>
      <View style={styles.header_container}>
        <Image style={styles.prof_pic} source={{uri: profile_url}} />
        <View style={styles.header_text_container}>
          <Text style={styles.header_text_name}>{name}</Text>
          <Text style={styles.header_text_party_code}>party code <Text style={styles.header_text_party_code_code}>{party_code}</Text></Text>
        </View>
      </View>
      
      <View style={styles.scroller_container}>
        <ScrollView
        style={styles.scroller}
        ref={ref => {this.scrollView = ref}}
        onContentSizeChange={() => this.scrollView.scrollToEnd({animated: true})}>
          {chatMessages}
        </ScrollView>
      </View>


      <View style={styles.message_container}>
        <TextInput
        style={styles.message_input}
        placeholder="Message"
        value={message_input}
        onChangeText={text => sendTyping(text)}
        onSubmitEditing={() => sendMsg()}/>
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
        <Stack.Screen name="Spotify Party" component={PartyPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
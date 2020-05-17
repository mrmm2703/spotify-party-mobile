import React, { useState } from "react";
import { StyleSheet, Text, View, Image, Button, Dimensions, ScrollView, Linking, TextInput } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as WebBrowser from 'expo-web-browser';
import io from "socket.io-client";

const endpoint = "https://accounts.spotify.com/en/authorize?client_id=d7bc09b9fc624ecfb3345d126c96f61f&redirect_uri=spotifyparty:%2F%2F&response_type=token&scope=streaming%20user-read-email%20user-modify-playback-state%20user-read-private&show_dialog=true"
let access_token = "NULL";
let party_code = "NULL";
const Stack = createStackNavigator();

let Spotify = require("spotify-web-api-js");

// Deep link handler
Linking.addEventListener("url", _handleUrl)

function _handleUrl(event) {
  // WebBrowser.dismissBrowser();
  let acc = event.url;
  access_token = acc.split("=")[1].split("&")[0];
  console.log("AUTH: Bearer " + access_token)
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

let SpotifyApi;

// Join Party Page
function JoinPartyPage({ navigation }) {
  doPoller = false;
  SpotifyApi = new Spotify();
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

        party_code = party_inp;

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
            console.log("USER: Name "+ _name);
            console.log("USER: Profile picture " + _profile_url);
            console.log("USER: Premium " + _premium);
            // Setup SpotifyApi
            SpotifyApi.setAccessToken(access_token);
            // Check for devices
            SpotifyApi.getMyDevices(function(err, data) {
              if (err) {
                alert("Could not connect to Spotify.");
                console.log(err);
              } else {
                if (data["devices"].length == 0) {
                  alert("Please open Spotify on a device to continue.");
                } else {
                  let active = false;
                  data["devices"].forEach(function(d) {
                    if (d["is_active"]) {
                      active = true;
                    }
                  })
                  if (active == false) {
                    alert("Please open Spotify on an active device to continue.")
                  } else {
                    // Send to server
                    socket.emit("name", {premium: _premium, name: json["display_name"], id: json["id"], profile_url: _profile_url, chatroom: party_code});
                    doPoller = true;
                    navigation.push("Spotify Party");
                  }
                }
              }
            })
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
let p_paused;
let p_position;
let p_track;
let p_track_title;
let p_track_uri;
let doPoller = true;
let skip = false;
let continueWithSeek;
let idCheck;

function offSkipper() {
  skip = false;
}

// Party Page
function PartyPage({ navigation }) {
  let scrollView;
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
    chatroom_container: {
      position: "absolute",
      bottom: 8,
      textAlign: "center",
      width: "100%"
    },
    chatroom_typing: {
      textAlign: "center",
      fontSize: 12,
      color: "#B9B9B9"
    },
    chatroom_number: {
      textAlign: "center",
      fontSize: 12,
      color: "#707070",
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
      backgroundColor: "#292424",
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
  
  // UI Chat Messages
  let [state, setState] = React.useState({
    chatMessage: "",
    chatMessages: chatMessagesGlobal,
  });
  let [typingText, setTypingText] = React.useState();
  let [chatroomNumber, setChatroomNumber] = React.useState();
  
  // Chat maker
  let time = "NULL";
  function Chat(myName, myId, myMsg, myEmp, msgId, time) {
    if (myEmp) {
      if (myId == _id) {
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
  // UI States
  const [name, setName] = React.useState(_name);
  const [profile_url, setProfileUrl] = React.useState(_profile_url);
  setTimeout(function() {
    setName(_name);
    setProfileUrl(_profile_url)
  }, 400);

  // Milliseconds to nice time
  function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
  }

  // Chat maker
  function addChat(data, emp) {
    if (SkipRoom(data.chatroom)) {
      return;
    }
    data.msgId = msgId;
    msgId = msgId + 1;
    data.emp = emp;
    let date = new Date();
    let hours = date.getHours().toString();
    let minutes = date.getMinutes().toString();
    if (hours.length == 1) {
      hours = "0" + hours;
    }
    if (minutes.length == 1) {
      minutes = "0" + minutes;
    }
    data.time = hours + ":" + minutes;
    chatMessagesGlobal.push(data);
    setState({ chatMessages: chatMessagesGlobal});
  }
  
  // Polling function to query Spotify API
  async function Poller() {
    if (doPoller) {
      SpotifyApi.getMyCurrentPlayingTrack(null, function(err, data) {
        if (err) {
          alert("Couldn't get playback state from Spotify");
          doPoller = false;
          navigation.popToTop();
        } else {
          let change = false;
          let dataa = {};
          dataa.id = _id;
          dataa.name = _name;
          dataa.chatroom = party_code;
          let cont = true;
          let contWithSeek = true;
          if(p_paused !== !(data["is_playing"])) {
            contWithSeek = false;
            console.log("POLLER: Paused state change");
            change = true;
            if (!(data["is_playing"])) {
              dataa.message = "Paused playback";
              addChat(dataa, true);
            } else {
              dataa.message = "Resumed playback";
              addChat(dataa, true);
            }
          }
          
          if (p_track !== data["item"]["id"]) {
            console.log("POLLER: Track state change")
            change = true;
            dataa.message = "Now playing " + data["item"]["name"];
            addChat(dataa, true);
            cont = false;
            contWithSeek = false;
          } else {
            if (contWithSeek == true) {
              if ((data["progress_ms"] < (p_position-2000)) || (data["progress_ms"] > (p_position+2000))) {
                console.log("POLLER: Progress state change");
                change = true;
                dataa.message = "Seeked to " + millisToMinutesAndSeconds(data["progress_ms"]);
                addChat(dataa, true);
              }
            }
          }
          
          p_paused = !(data["is_playing"]);
          p_position = data["progress_ms"];
          p_track = data["item"]["id"];
          p_track_title = data["item"]["name"];
          p_track_uri = data["item"]["uri"];
          if (change) {
            socket.emit("state", {
              paused: !(data["is_playing"]),
              position: data["progress_ms"],
              track: data["item"]["id"],
              track_title: data["item"]["name"],
              track_uri: data["item"]["uri"]
            });
          }
        }
      });
    }
    await setTimeout(Poller, 1000);
  }

  if (!(init_done)) {
    // Initial player object values
    SpotifyApi.getMyCurrentPlayingTrack(null, function(err, data) {
      if (err) {
        alert("Couldn't get playback state from Spotify");
        doPoller = false;
        navigation.popToTop();
      } else {
        console.log("POLLER: Running initial poll");
        p_paused = !(data["is_playing"]);
        p_position = data["progress_ms"];
        p_track = data["item"]["id"];
        p_track_title = data["item"]["name"];
        p_track_uri = data["item"]["uri"];
      }
    })
    // Socket listeners
    console.log("SOCKET: Creating socket listeners")
    socket.on("message", (data) => { // Listener: "message"
      addChat(data, false);
    })
    socket.on("joined", (data) => { // Listener: "joined"
      if (msgId == 0) {
        data.id = _id;
      }
      data.message = "Joined the party";
      addChat(data, true)
    })
    socket.on("change_name", (data) => { // Listener: "change_name"
      data.id = "DEFO NOT ME";
      data.name = data.new_name;
      data.message = "Changed name from \"" + data.old_name + "\" to \"" + data.new_name + "\"";
      addChat(data, true);
    })
    socket.on("user_disconnected", (data) => { // Listener: "user_disconnected"
      data.id = "DEFO NOT ME";
      data.message = "Left the party";
      addChat(data, true);
    })
    socket.on("typing", (data) => { // Listener: "typing"
      if (SkipRoom(data.chatroom)) {
        return
      }
      if (!(data.id == _id)) {
        setTypingText(data.name + " is typing")
        setTimeout(function() {
            setTypingText("");
        }, 500);
      }
    })
    socket.on("chatroom_number", (data) => { // Listener: "chatroom_number"
      if (data.number == 1) {
        setChatroomNumber("You're all alone")
      } else {
        setChatroomNumber(data.number + " in party")
      }
    })
    socket.on("state", (data) => { // Listener: "state"
      console.log("SOCKET: Got state change");
      if (SkipRoom(data.chatroom)) {
        return
      }
      if (skip == true) {
        return
      }
      if (data.id == _id) {
        idCheck = true;
      } else {
        idCheck = false;
      }
      continueWithSeek = true
      if (p_paused !== data.paused) {
        console.log("SOCKET: Pause state has changed");
        continueWithSeek = false;
        p_paused = data.paused;
        if (p_paused == true) {
          console.log("SOCKET: Paused state");
          data.message = "Paused playback";
          addChat(data, true);
          if (!idCheck) {
            SpotifyApi.pause(null, function(err, data) {
              if (err) {
                alert("Could not pause music");
                navigation.popToTop();
                return;
              }
            })
          }
        } else {
          console.log("SOCKET: Resumed state");
          data.message = "Resumed playback";
          addChat(data, true);
          if (!idCheck) {
            SpotifyApi.play(null, function(err, data) {
              if (err) {
                alert("Could not play music")
                navigation.popToTop();
                return;
              }
            })
          }
        }
      } else {
        continueWithSeek = true;
      }

      if (p_track !== data.track) {
        console.log("SOCKET: Track state change");
        p_track = data.track;
        continueWithSeek = false;
        data.message = "Now playing " + data.track_title;
        addChat(data, true);
        if (!idCheck) {
          SpotifyApi.play({uris: [data.track_uri]}, function(err, data) {
            if (err) {
              alert("Could not play track");
              navigation.popToTop()
              return;
            }
          })
        }
      } else {
        if (continueWithSeek) {
          if ((data.position < (p_position-2000)) || (data.position > (p_position+2000))) {
            console.log("SOCKET: Position state change");
            p_position = data.position;
            data.message = "Seeked to " + millisToMinutesAndSeconds(p_position);
            addChat(data, true);
            if (!idCheck) {
              SpotifyApi.play({uris: [data.track_uri], position_ms: p_position}, function(err, data) {
                if (err) {
                  alert("Could not play track from position");
                  navigation.popToTop()
                  return;
                }
              })
            }
          }
        }
      }
      skip = true;
      setTimeout(offSkipper, 500);
    })
    setTimeout(Poller, 1000);
    init_done = true;
  }

  const [message_input, onChangeMessage] = React.useState("");
  const chatMessages = state.chatMessages.map(chatMessage => (
    Chat(chatMessage.name, chatMessage.id, chatMessage.message, chatMessage.emp, chatMessage.msgId, chatMessage.time)
  ))

  // Reactors
  function sendMsg() { // Emit message
    onChangeMessage("");
    if (!(message_input.trim().length == 0)) {
      socket.emit("message", {message: message_input});
    }
  }
  function sendTyping(text) { // Emit typing
    socket.emit("typing");
    onChangeMessage(text);
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header_container}>
        <Image style={styles.prof_pic} source={{uri: profile_url}} />
        <View style={styles.chatroom_container}>
          <Text style={styles.chatroom_typing}>{typingText}</Text>
          <Text style={styles.chatroom_number}>{chatroomNumber}</Text>
        </View>
        <View style={styles.header_text_container}>
          <Text style={styles.header_text_name}>{name}</Text>
          <Text style={styles.header_text_party_code}>party code <Text style={styles.header_text_party_code_code}>{party_code}</Text></Text>
        </View>
      </View>
      
      <View style={styles.scroller_container}>
        <ScrollView
        style={styles.scroller}
        ref={ref => {scrollView = ref}}
        onContentSizeChange={() => scrollView.scrollToEnd({animated: true})}>
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
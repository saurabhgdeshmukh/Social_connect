

import "./Chat.css";
import ChatBox from "../assets/Chatbox";
import axios from 'axios';
import React, { useEffect, useState,useContext } from "react";


export const userContext = React.createContext();



function Chat () {
  const[user1,setUser1]=useState('')
  const roomID= localStorage.getItem("roomData");
  console.log(roomID);
  const fetchusers= async ()=>{
    try {
      const response = await axios.get(`http://localhost:8000/${roomID}`);
      console.log(response.data.users);
      setUser1(response.data);
       // Log the received data
    } catch (error) {
      console.error('Error:', error);
    }
  }
  useEffect(fetchusers,[])

  // fetchusers();
    // const user=JSON.parse(localStorage.getItem("user"));
    // console.log(user);

  return (
    <div className="App">
      {user1 && (
        <userContext.Provider value={user1}>
        <ChatBox></ChatBox>
        </userContext.Provider>)}
    </div>
  );
}

export default Chat;
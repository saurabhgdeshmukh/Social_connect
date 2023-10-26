import { useEffect, useRef, useState,useContext } from "react";
import {
  query,
  collection,
  orderBy,
  onSnapshot,
  limit,
  where,
} from "firebase/firestore";

import { db } from './Firebase'

import Message from "./Message";
import SendMessage from "./SendMessage";
import { userContext } from "../routes/Chat";




const ChatBox = () => {

  const roomID= localStorage.getItem("roomData");
    const [messages, setMessages] = useState([]);
    // const user= useContext(userContext);


    const scroll=useRef();
    
    useEffect(() => {
      const q = query(
        collection(db, "messages"),
        where("room","==",roomID),
        orderBy("createdAt"),
        limit(50)
      );
      const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
        let messages = [];
        QuerySnapshot.forEach((doc) => {
          messages.push({ ...doc.data(), id: doc.id });
        });
        setMessages(messages);
      });
      return () => unsubscribe;
    }, []);
  
    return (
      <main className="chat-box">
        <div className="messages-wrapper">
          {messages?.map((message) => (
            <Message key={message.id} message={message} />
          ))}
        </div>
        <span ref={scroll}></span>
        
        <SendMessage  scroll={scroll} />
        
        
      </main>
    );
  };
  export default ChatBox;
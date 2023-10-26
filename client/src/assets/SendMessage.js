import React, { useContext, useState } from "react";
import { db } from "./Firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import 'firebase/firestore';

import { userContext } from "../routes/Chat";
import './SendMessage.css';

const SendMessage = ({ scroll }) => {
  const [message, setMessage] = useState("");

  const user = useContext(userContext);
  

  const curUser = localStorage.getItem("currUser");
  

  const sendmessage = async (e) => {
    e.preventDefault();
    
    
    if (message.trim() !== "") {
      
      
          for (var j = 0; j < user.users.length; j++) {
          
            if (user.users[j].uid === curUser) {
              
              const uid = user.users[j].uid;

              const messageRef = collection(db, "messages");
              try {
                
               const added= await addDoc(messageRef, {
                  text: message,
                  name: user.users[j].name,
                  avatar: user.users[j].picture,
                  room:user.room,

                  createdAt: serverTimestamp(),
                  uid,
                });
               
                console.log(added.id);
              } catch (err) {
                console.log(err);
              }
              setMessage("");
            }
          

          scroll.current.scrollIntoView({ behavior: "smooth" });
        }
      }
    
  };

  return (
    <form className="send-message" onSubmit={sendmessage}>
      <input
        id="messageInput"
        name="messageInput"
        type="text"
        className="form-input__input"
        placeholder="type message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit">Send</button>
    </form>
  );
};
export default SendMessage;

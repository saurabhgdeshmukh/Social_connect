import React, { useEffect } from "react";

const Message = ({ message }) => {
  const curUser = localStorage.getItem("currUser");

  console.log(message.createdAt);
  



  return (
    <div>
      <div className={`chat-bubble ${message.uid === curUser ? "right" : ""}`}>
        <img
          className="chat-bubble__left"
          src={message.avatar}
          alt="user avatar"
        />
        <div className="chat-bubble__right">
          <p className="user-name">{message.name}</p>
          <p className="user-message">{message.text}</p>
        </div>
      </div>

      {/* <p className={`chat-bubble ${message.uid === curUser ? "" : "right"}`}>
        {message.createdAt}
      </p> */}
    </div>
  );
};
export default Message;

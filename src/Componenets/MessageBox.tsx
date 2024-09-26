import React, { useState } from "react";

const MessageBox = () => {
  const [time, setTime] = useState("");
  const [text, setText] = useState("");
  const [user, setuser] = useState("");
  return (
    <div className="main__messageBox">
      <div className="main__time-container">Here is the time{time}</div>
      <div className="main__text-container">{text}</div>
      <div className="main__user-container">--{user}</div>
    </div>
  );
};

export default MessageBox;

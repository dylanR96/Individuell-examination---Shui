import { useNavigate } from "react-router-dom";
import MessageBox from "../Componenets/MessageBox";
import { useContext, useEffect, useState } from "react";
import { MessageContext } from "../provider/MyProvider";

const StartPage = () => {
  const navigate = useNavigate();
  const context = useContext(MessageContext);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          "https://k1d8bye580.execute-api.eu-north-1.amazonaws.com/message"
        );
        const data = await response.json();
        console.log(data);

        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, []);

  const allMessages = async () => {
    try {
      const response = await fetch(
        "https://k1d8bye580.execute-api.eu-north-1.amazonaws.com/message",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data: Response = await response.json();

      if (response.ok) {
        console.log(data);
      } else {
        console.log("Response threw an error");
      }
    } catch (error) {
      console.error("Error finding user", error);
    }
  };

  return (
    <>
      <div>
        {messages.length > 0 ? (
          <ul>
            {messages.map((message, index) => (
              <li key={index}>
                <p>{message.id}</p>
                <p>{message.text}</p>
                <p>{message.createdAt}</p>
              </li>
            ))}
          </ul>
        ) : (
          <h1>Du har inga meddelanden att visa.</h1>
        )}
      </div>
      <MessageBox />
      <button onClick={() => navigate("app/createMessage")}>
        This is a button
      </button>
      <button onClick={() => allMessages()}>Get all messages</button>
    </>
  );
};

export default StartPage;

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./StartPage.css";

const StartPage = () => {
  const navigate = useNavigate();
  const [, setMessages] = useState<
    Array<{ id: string; text: string; createdAt: Date; username: string }>
  >([]);
  const [, setSortOrder] = useState("asc");
  const [editMessageId, setEditMessageId] = useState<string | null>(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [username, setUsername] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMessages, setFilteredMessages] = useState<
    Array<{ id: string; text: string; createdAt: Date; username: string }>
  >([]);
  const [errorMessage, setErrorMessage] = useState("");

  const extractMessages = (textObject: Record<string, any>) => {
    const messagesArray = [];

    for (const uniqueId in textObject) {
      const messageData = textObject[uniqueId];
      if (messageData) {
        const messageText = messageData.Message || "No message";
        const createdAt = messageData.CreatedAt || "Unknown date";

        messagesArray.push({
          id: uniqueId,
          text: messageText,
          createdAt: new Date(createdAt),
        });
      }
    }

    return messagesArray;
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        "https://k1d8bye580.execute-api.eu-north-1.amazonaws.com/message"
      );
      const data = await response.json();

      if (!data.message) {
        console.error("No message field in response");
        setErrorMessage("No messages found.");
        return;
      }

      const messageData = Array.isArray(data.message) ? data.message : [];

      const allMessages = messageData.flatMap((user: any) => {
        const messagesForUser = extractMessages(user.text);
        return messagesForUser.map((msg) => ({
          ...msg,
          username: user.username,
        }));
      });

      if (allMessages.length > 0) {
        setMessages(allMessages);
        setFilteredMessages(allMessages);
        setErrorMessage("");
      } else {
        setErrorMessage("There are no current messages.");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setErrorMessage("Error fetching messages. Please try again.");
    }
  };

  const fetchMessagesByUsername = async (username: string) => {
    try {
      const response = await fetch(
        `https://k1d8bye580.execute-api.eu-north-1.amazonaws.com/message/${username}`
      );
      const data = await response.json();

      if (response.status === 404) {
        setErrorMessage("User does not exist or has no current messages.");
        return;
      }

      if (!data.message) {
        console.error("No message field in response");
        return;
      }

      const userMessages = data.message || [];
      if (!Array.isArray(userMessages)) {
        console.error(
          "Expected userMessages to be an array, but got:",
          userMessages
        );
        setErrorMessage("Unexpected data format received.");
        setFilteredMessages([]);
        return;
      }

      const filteredMessages = userMessages.map((msg: any) => ({
        id: msg.id,
        text: msg.Message,
        createdAt: new Date(msg.CreatedAt || Date.now()),
        username,
      }));

      console.log("Filtered Messages by Username:", filteredMessages);
      setFilteredMessages(filteredMessages);
      setErrorMessage("");
    } catch (error) {
      console.error("Error fetching messages:", error);
      setErrorMessage("Error fetching messages. Please try again.");
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const sortMessages = (order: string) => {
    const sortedMessages = [...filteredMessages].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      return order === "asc" ? dateA - dateB : dateB - dateA;
    });
    setFilteredMessages(sortedMessages);
  };

  const handleSortOrderChange = (newOrder: string) => {
    setSortOrder(newOrder);
    sortMessages(newOrder);
  };

  const handleEditMessage = (id: string, text: string, user: string) => {
    setEditMessageId(id);
    setNewMessageText(text);
    setUsername(user);
  };

  const submitEditMessage = async () => {
    if (!editMessageId) return;

    const editedMessage = {
      username: username,
      messages: {
        [editMessageId]: [newMessageText],
      },
    };

    try {
      const response = await fetch(
        "https://k1d8bye580.execute-api.eu-north-1.amazonaws.com/message",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedMessage),
        }
      );

      if (response.ok) {
        await fetchMessages();
        setEditMessageId(null);
        setNewMessageText("");
      } else {
        const result = await response.json();
        console.error("Error editing message:", result.message);
      }
    } catch (error) {
      console.error("Error submitting edited message:", error);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      await fetchMessagesByUsername(searchTerm.trim());
    } else {
      setErrorMessage("Please enter a username to search.");
    }
  };

  return (
    <>
      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by username"
          className="searchbar"
        />
        <button onClick={handleSearch}>Search</button>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div className="date-sorting-btns">
          <button onClick={() => handleSortOrderChange("asc")}>
            Sort by Date (Ascending)
          </button>
          <button onClick={() => handleSortOrderChange("desc")}>
            Sort by Date (Descending)
          </button>
        </div>
        {filteredMessages.length > 0 ? (
          filteredMessages.map((message) => (
            <div key={message.id} className="messageBox">
              <p>
                <strong>Message ID:</strong> {message.id}
              </p>
              <p>
                <strong>Message:</strong>{" "}
                {editMessageId === message.id ? (
                  <input
                    type="text"
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    placeholder="Enter new message text"
                  />
                ) : (
                  message.text
                )}
              </p>
              <p>
                <strong>Created at:</strong>{" "}
                {message.createdAt.toLocaleString()}
              </p>
              <p>
                <strong>Username:</strong> {message.username}
              </p>
              {editMessageId === message.id ? (
                <>
                  <button onClick={submitEditMessage}>Submit Edit</button>
                  <button
                    onClick={() => {
                      setEditMessageId(null);
                      setNewMessageText("");
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() =>
                    handleEditMessage(
                      message.id,
                      message.text,
                      message.username
                    )
                  }
                >
                  Edit
                </button>
              )}
            </div>
          ))
        ) : (
          <h1>No messages to display.</h1>
        )}
      </div>
      <button onClick={() => navigate("app/createMessage")}>
        Create a new message
      </button>
      <button onClick={fetchMessages}>Get all messages</button>
    </>
  );
};

export default StartPage;

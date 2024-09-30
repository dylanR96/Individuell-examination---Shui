import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateMessage = () => {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const submitMessage = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const newMessage = {
      username: username,
      text: [message],
    };

    try {
      const response = await fetch(
        "https://k1d8bye580.execute-api.eu-north-1.amazonaws.com/message",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newMessage),
        }
      );

      if (response.ok) {
        navigate("/");
      } else {
        const result = await response.json();
        setError(result.message);
        console.error("Error creating message:", result.message);
      }
    } catch (error) {
      console.error("Error submitting message:", error);
      setError("An error occurred while submitting the message.");
    }
  };

  return (
    <div>
      <h1>Create a new message</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="messageBox">
        <form onSubmit={submitMessage}>
          <div style={{ marginBottom: "10px" }}>
            <label>Message:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message"
              required
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          <button type="submit">Submit Message</button>
        </form>
        <button onClick={() => navigate("/")}>Cancel</button>
      </div>
    </div>
  );
};

export default CreateMessage;

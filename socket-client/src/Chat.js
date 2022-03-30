import React, { useState, useEffect, useRef } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import ChatInput from "./ChatInput";
import ChatWindow from "./ChatWindow";

const Chat = () => {
  const [isStream, setIsStream] = useState(false);
  const [connection, setConnection] = useState(null);
  const [chat, setChat] = useState([]);
  const latestChat = useRef(null);

  latestChat.current = chat;

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl("https://localhost:7086/hubs/chat")
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
    console.info(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then((result) => {
          console.log("Connected!");

          connection.on("ReceiveMessage", (message) => {
            const updatedChat = [...latestChat.current];
            updatedChat.push(message);

            setChat(updatedChat);
          });
        })
        .catch((e) => console.log("Connection failed: ", e));
    }
  }, [connection]);

  const sendMessage = async (user, message) => {
    const chatMessage = {
      user: user,
      message: message,
    };

    if (connection._connectionStarted) {
      try {
        await connection.send("SendMessage", chatMessage);
      } catch (e) {
        console.log(e);
      }
    } else {
      alert("No connection to server yet.");
    }
  };

  const startStream = async () => {
    if (connection._connectionStarted) {
      try {
        connection.stream("Counter", 10, 500).subscribe({
          next: (item) => {
            var h3 = document.createElement("h3");
            h3.textContent = item;
            document.getElementById("messagesList").appendChild(h3);
          },
          complete: () => {
            var compMes = document.createElement("h3");
            compMes.textContent = "Stream Completed !";
            document.getElementById("messagesList").appendChild(compMes);
            console.info("Stream completed")},
          error: (err) => console.info(err),
        });
      } catch (e) {
        console.log(e);
      }
    } else {
      alert("No connection to server yet.");
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          justifyItems: "center",
          alignItems: "center",
          gap: "3px",
        }}
      >
        <input
          type="checkbox"
          checked={isStream}
          onChange={() => setIsStream(!isStream)}
        />
        <h3> {isStream ? "Uncheck" : "Check"} to Switch to {isStream ? "Chat" : "Stream"} </h3>
      </div>
      {isStream ? (
        <>
          <h2> Stream here</h2>
          <button onClick={startStream}> Start Stream</button>
          <ul id="messagesList"></ul>
        </>
      ) : (
        <>
          <ChatInput sendMessage={sendMessage} />
          <hr />
          <ChatWindow chat={chat} />
        </>
      )}
    </div>
  );
};

export default Chat;

"use client";

import { useState } from "react";
import RoomForm from "./components/RoomForm";
import GameBoard from "./components/GameBoard";
import Notification from "./components/Notification";

export default function Home() {
  const [inRoom, setInRoom] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [player, setPlayer] = useState("");
  const [notification, setNotification] = useState("");

  return (
    <div className="app-container">
      <h1>Grid Wars</h1>
      {!inRoom ? (
        <RoomForm
          onJoin={(room: string, player: string) => {
            setRoomId(room);
            setPlayer(player);
            setInRoom(true);
          }}
          setNotification={setNotification}
        />
      ) : (
        <GameBoard
          roomId={roomId}
          player={player}
          setNotification={setNotification}
        />
      )}
      <Notification
        message={notification}
        onClose={() => setNotification("")}
      />
    </div>
  );
}

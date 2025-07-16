"use client";

import React, { useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001"); // Adjust port if needed

function RoomForm({
  onJoin,
  setNotification,
}: {
  onJoin: (room: string, player: string) => void;
  setNotification: (notification: string) => void;
}) {
  const [room, setRoom] = useState("");

  const handleJoin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!room) return setNotification("Room ID required!");

    socket.emit(
      "joinRoom",
      { room },
      (response: { error: string } | { player: string }) => {
        if ("error" in response) {
          setNotification(response.error);
        } else {
          onJoin(room, response.player);
        }
      }
    );
  };

  return (
    <form className="room-form" onSubmit={handleJoin}>
      <input
        type="text"
        placeholder="Enter Room ID"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />
      <button className="secondary" type="submit">
        Join/Create Room
      </button>
    </form>
  );
}

export default RoomForm;

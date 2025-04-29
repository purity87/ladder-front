import React, { useState, useEffect } from "react";
import CreateRoomModal from "./CreateRoomModal";
import JoinRoomModal from "./JoinRoomModal";
import "../../styles/RoomList.scss";

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    // const eventSource = new EventSource('/rooms');

    // eventSource.onmessage = (event) => {
    // const data = JSON.parse(event.data);

    // 실제 API 요청
   fetch("http://localhost:9090/rooms", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        setRooms(data); // 상태 업데이트
        console.log(rooms);
      })
      .catch((error) => {
        console.error("Error fetching rooms:", error);
      });

    //};
    //
    // eventSource.onerror = (error) => {
    //     console.error('SSE 연결 오류', error);
    //     eventSource.close();
    // };

    return () => {
      // eventSource.close();
    };
  }, []);

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setShowJoinModal(true);
  };

  const handleCreateRoomClick = () => {
    setShowCreateModal(true);
  };

  return (
    <div className="room-list-container">
      <h1 className="title">방 목록</h1>
      <div className="room-list">
        {rooms?.length > 0 ? (
          rooms.map((room) => (
            <div
              key={room?.roomId}
              className={`room-item ${
                room.lanes === room.attendeeCount ? "disabled" : ""
              }`}
              onClick={() => {
                if (room.lanes !== room.attendeeCount) handleRoomClick(room);
              }}>
              {room?.roomName} (참가자: {room?.attendeeCount}명/{room?.lanes}명)
            </div>
          ))
        ) : (
          <p className="no-rooms">현재 생성된 방이 없습니다.</p>
        )}
      </div>
      <button className="create-room-button" onClick={handleCreateRoomClick}>
        방 생성하기
      </button>

      {showCreateModal && (
        <CreateRoomModal onClose={() => setShowCreateModal(false)} />
      )}

      {showJoinModal && selectedRoom && (
        <JoinRoomModal
          onClose={() => setShowJoinModal(false)}
          room={selectedRoom}
        />
      )}
    </div>
  );
};

export default RoomList;

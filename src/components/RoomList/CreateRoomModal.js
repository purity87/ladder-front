import React, { useEffect, useState } from "react";
import "../..//styles/CreateRoomModal.scss";
import { useNavigate } from "react-router-dom";
import { useSse } from "../../context/SseContext";
const CreateRoomModal = ({ onClose }) => {
  const { connect, disconnect, messages, error, isConnected } = useSse();
  const [roomName, setRoomName] = useState("");
  const [nickname, setNickname] = useState("");
  const [lanes, setLanes] = useState(4);
  const navigate = useNavigate();

  const [roomInfo, setRoomInfo] = useState({
    roomId: "",
    roomName: "",
    nickName: "",
    lanes: 4,
    winRailNo: null,
  });

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      alert("방 이름을 입력하세요.");
      return;
    }
    try {
      if (!nickname || lanes < 2 || lanes > 10) return;
      const res = await fetch("http://localhost:9090/create/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName, nickname, lanes }),
      });
      const { roomId, winRailNo } = await res.json();
      // 상태 업데이트
      if (roomId) {
        try {
          await connect(roomId); // SSE 연결 완료까지 기다림
          setRoomInfo({
            roomId, // roomId: roomId 형태로 작성
            roomName,
            nickname, // nickname: nickname 형태로 작성
            winRailNo, // winRailNo: winRailNo 형태로 작성
            lanes,
          });
        } catch (error) {
          console.error("SSE 연결 실패로 인한 방 입장 중단");
        }
      }
    } catch (error) {
      console.error("방 생성 실패", error);
    }
  };

  // 상태 변경 후에 navigate를 수행할 useEffect
  useEffect(() => {
    if (roomInfo.roomId) {
      onClose();
      navigate(`/game/${roomInfo.roomId}?nickname=${roomInfo.nickname}`, {
        state: { roomInfo },
      });
    }
  }, [roomInfo]); // roomId가 변경될 때만 실행

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2 className="modal-title">방 생성</h2>
        <label
          style={{
            display: "block",
            color: "#4b5563",
            marginBottom: "0.2rem",
          }}>
          방이름
        </label>
        <input
          type="text"
          placeholder="방 이름 입력"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="modal-input"
          onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #8b5cf6")}
          onBlur={(e) => (e.target.style.boxShadow = "0 0 0 0 transparent")}
        />
        <label
          style={{
            display: "block",
            color: "#4b5563",
            marginBottom: "0.2rem",
          }}>
          닉네임
        </label>
        <input
          type="text"
          placeholder="닉네임 입력"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="modal-input"
          onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #8b5cf6")}
          onBlur={(e) => (e.target.style.boxShadow = "0 0 0 0 transparent")}
        />
        <label
          style={{
            display: "block",
            color: "#4b5563",
            marginBottom: "0.2rem",
          }}>
          참여 인원수 (2~10)
        </label>
        <input
          type="number"
          placeholder="참가자 수 (2~10명)"
          value={lanes}
          min="2"
          max="10"
          onChange={(e) => setLanes(Number(e.target.value))}
          className="modal-input"
        />
        <div className="modal-buttons">
          <button className="cancel-button" onClick={onClose}>
            취소
          </button>
          <button
            className="create-button"
            onClick={handleCreateRoom}
            style={{
              backgroundColor: "#8b5cf6",
              color: "white",
              borderRadius: "0.375rem",
              border: "none",
              cursor: "pointer",
              transition: "background-color 0.3s",
              opacity:
                !roomName || !nickname || lanes < 2 || lanes > 10 ? 0.5 : 1,
            }}
            disabled={!roomName || !nickname || lanes < 2 || lanes > 10}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#7c3aed")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#8b5cf6")}>
            생성
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal;

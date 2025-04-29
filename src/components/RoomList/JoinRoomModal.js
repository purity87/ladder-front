import React, {useEffect, useState} from 'react';
import '../../styles/JoinRoomModal.scss';
import {useNavigate} from "react-router-dom";

const JoinRoomModal = ({ onClose, room }) => {
    const navigate = useNavigate();
    const [nickname, setNickname] = useState('');
    const [roomInfo, setRoomInfo] = useState({
        roomId: room.roomId | '',
        roomName: room.roomName | '',
        nickName: '',
        lanes: room.lanes || 4,
        winRailNo: room.winRailNo | null
    });

    useEffect(() => {
        setRoomInfo(prev => ({
            ...prev,
            nickName: nickname
        }));
    }, [nickname]);

    const handleJoin = (e) => {
        // 서버에 참가 요청 (추후 구현)
        try {
            const roomId = roomInfo.roomId
            fetch("http://localhost:9090/add/participants", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId, nickname }),
            }).then((response) => {
                console.log(response);
                if(response.status === 200){
                    onClose();
                    navigate(`/game/${room.roomId}?nickname=${nickname}`, {
                        state: { roomInfo }
                    });
                }
            });
        } catch (error) {
            console.error("방 참여 실패", error);
        }


        console.log(`참석: 닉네임(${nickname}), 방ID(${room.roomId})`);

    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{room.roomName} 방 참가</h2>
                <p>현재 참가자: {room.attendeeCount}명 / {room.lanes}명</p>

                <input
                    type="text"
                    value={nickname}
                    onChange={(e) =>  setNickname(e.target.value)}
                    placeholder="닉네임 입력"
                    className="nickname-input"
                />

                <div className="button-group">
                    <button className="close-button" onClick={onClose}>
                        닫기
                    </button>
                    <button className="join-button"
                            onClick={handleJoin}
                            style={{
                                opacity: !nickname,
                            }}
                            disabled={ !nickname }>
                        참석하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JoinRoomModal;

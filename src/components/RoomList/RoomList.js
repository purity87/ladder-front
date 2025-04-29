import React, { useState, useEffect } from 'react';
import CreateRoomModal from './CreateRoomModal';
import JoinRoomModal from './JoinRoomModal';
import '../../styles/RoomList.scss';

const RoomList = () => {
    const [rooms, setRooms] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);

    useEffect(() => {
        // const eventSource = new EventSource('/rooms');

        // eventSource.onmessage = (event) => {
            // const data = JSON.parse(event.data);
            const data = {
                rooms: [
                    {
                        roomId: 20250429091837,
                        roomName: 'test1',
                        attendeeCount: 2,
                        lanes: 4,
                        winRailNo: 0
                    },
                    {
                        roomId: 12345,
                        roomName: 'test2',
                        attendeeCount: 4,
                        lanes: 4,
                        winRailNo: 1
                    },
                    {
                        roomId: 12346,
                        roomName: 'test3',
                        attendeeCount: 1,
                        lanes: 4,
                        winRailNo: 3
                    },
                ]
            }
            setRooms(data.rooms);
        // };
        //
        // eventSource.onerror = (error) => {
        //     console.error('SSE 연결 오류', error);
        //     eventSource.close();
        // };

        return () => {
            // eventSource.close();
        };
    }, []);

    // const handleEnterRoom = (roomId) => {
    //     navigate(`/game/${roomId}`);
    // };

    const handleRoomClick = (room) => {
        console.log('>>room : ', room);
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
                        <div key={room?.roomId}
                             className={`room-item ${room.lanes === room.attendeeCount ? 'disabled' : ''}`}
                             onClick={() => {
                            if (room.lanes !== room.attendeeCount) handleRoomClick(room)
                            }}
                        >
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

            {showCreateModal && <CreateRoomModal onClose={() => setShowCreateModal(false)} />}

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
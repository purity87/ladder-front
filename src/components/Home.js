import {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.scss';

export default function Home() {
    const [nickname, setNickname] = useState('');
    const [lanes, setLanes] = useState(4);
    const navigate = useNavigate();

    const [roomInfo, setRoomInfo] = useState({
        winRailNo: null,
        nickName: '',
        roomId: '',
    });



    const handleCreateRoom = async () => {
        if (!nickname || lanes < 2 || lanes > 10) return;
        const res = await fetch('http://localhost:9090/create/room', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname, lanes }),
        })
        const { roomId, winRailNo } = await res.json();
        // 상태 업데이트
        setRoomInfo({
            roomId,     // roomId: roomId 형태로 작성
            nickname,   // nickname: nickname 형태로 작성
            winRailNo,  // winRailNo: winRailNo 형태로 작성
        });

    }

    // 상태 변경 후에 navigate를 수행할 useEffect
    useEffect(() => {
        if (roomInfo.roomId) {
            navigate(`/game/${roomInfo.roomId}?nickname=${roomInfo.nickname}`, {
                state: { roomInfo }
            });
        }
    }, [roomInfo]);  // roomId가 변경될 때만 실행

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
            <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '28rem', width: '100%' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>사다리타기 게임</h1>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', color: '#4b5563', marginBottom: '0.25rem' }}>닉네임</label>
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        style={{ width: '96%', padding: '0.5rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', outline: 'none', boxShadow: '0 0 0 2px transparent', transition: 'box-shadow 0.2s' }}
                        placeholder="닉네임 입력"
                        onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px #8b5cf6')}
                        onBlur={(e) => (e.target.style.boxShadow = '0 0 0 0 transparent')}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', color: '#4b5563', marginBottom: '0.25rem' }}>참여 인원수 (2~10)</label>
                    <input
                        type="number"
                        value={lanes}
                        onChange={(e) => setLanes(Number(e.target.value))}
                        min="2"
                        max="10"
                        style={{ width: '96%', padding: '0.5rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', outline: 'none', boxShadow: '0 0 0 2px transparent', transition: 'box-shadow 0.2s' }}
                        onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px #8b5cf6')}
                        onBlur={(e) => (e.target.style.boxShadow = '0 0 0 0 transparent')}
                    />
                </div>
                <button
                    onClick={handleCreateRoom}
                    style={{
                        width: '100%',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#8b5cf6',
                        color: 'white',
                        borderRadius: '0.375rem',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s',
                        opacity: !nickname || lanes < 2 || lanes > 10 ? 0.5 : 1,
                    }}
                    disabled={!nickname || lanes < 2 || lanes > 10}
                    onMouseOver={(e) => (e.target.style.backgroundColor = '#7c3aed')}
                    onMouseOut={(e) => (e.target.style.backgroundColor = '#8b5cf6')}
                >
                    방 생성
                </button>
            </div>
        </div>
    );
}
import { useLocation } from 'react-router-dom';
import LadderBoard from './LadderBoard';

export default function GameRoom() {
    const location = useLocation();
    // const params = new URLSearchParams(location.search);
    const roomId = location.pathname.split('/').pop();
    const nickname = location.pathname.split('/').pop();
    const { roomInfo } = location.state || {};  // 부모 컴포넌트에서 넘겨준 상태

    if (!roomId) return <div>Loading...</div>;

    return <LadderBoard roomId={roomId} roomInfo={roomInfo} initialNickname={nickname} />;
}
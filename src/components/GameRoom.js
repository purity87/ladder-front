import { useLocation } from 'react-router-dom';
import LadderBoard from './LadderBoard';

export default function GameRoom() {
    const location = useLocation();
    // const params = new URLSearchParams(location.search);
    const roomId = location.pathname.split('/').pop();
    // const playerId = params.get('playerId');
    // const nickname = params.get('nickname');
    const playerId = 'playerId';
    const nickname = 'nickname'

    if (!roomId) return <div>Loading...</div>;

    return <LadderBoard roomId={roomId} initialPlayerId={playerId} initialNickname={nickname} />;
}
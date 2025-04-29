import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SseProvider } from './context/SseContext';
// import Home from './components/Home';
import GameRoom from './components/LadderBoard/GameRoom';
import LadderBoard from "./components/LadderBoard/LadderBoard";
import './App.css';
import RoomList from "./components/RoomList/RoomList";
function App() {
    return (
        <SseProvider>
            <Router>
                <Routes>
                    {/*<Route path="/" element={<Home />} />*/}
                    <Route path="/" element={<RoomList />} />
                    <Route path="/ladder" element={<LadderBoard />} />
                    <Route path="/game/:roomId" element={<GameRoom />} />
                </Routes>
            </Router>
        </SseProvider>
    );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SseProvider } from './context/SseContext';
// import Home from './components/Home';
import GameRoom from './components/GameRoom';
import LadderBoard from "./components/LadderBoard";
import './App.css';
function App() {
    return (
        <SseProvider>
            <Router>
                <Routes>
                    {/*<Route path="/" element={<Home />} />*/}
                    <Route path="/" element={<LadderBoard />} />
                    <Route path="/game/:roomId" element={<GameRoom />} />
                </Routes>
            </Router>
        </SseProvider>
    );
}

export default App;
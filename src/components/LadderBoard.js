// components/LadderBoard.js
'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSse } from '../context/SseContext';


// 사다리 경로 계산 함수
const calculatePath = (startLane, bridges) => {
    let currentLane = startLane;
    const positions = [{ lane: currentLane, step: 0 }];

    bridges.forEach(({ lanePair, hasBridge }, step) => {
        if (hasBridge) {
            if (lanePair === currentLane) {
                currentLane += 1; // 오른쪽 레인으로 이동
            } else if (lanePair + 1 === currentLane) {
                currentLane -= 1; // 왼쪽 레인으로 이동
            }
        }
        if (currentLane >= 0 && currentLane < 4) {
            positions.push({ lane: currentLane, step: step + 1 });
        }
    });

    return positions;
};
// 애니메이션 경로 계산 함수 (수직/수평 분리, 연결선 위치 반영)
const calculateAnimationPath = (pathPositions, laneWidth, stepHeight) => {
    const animationPath = [];
    for (let i = 0; i < pathPositions.length - 1; i++) {
        const current = pathPositions[i];
        const next = pathPositions[i + 1];
        const currentX = current.lane * laneWidth + laneWidth / 2;
        const nextX = next.lane * laneWidth + laneWidth / 2;
        const bridgeY = (current.step + 0.5) * stepHeight; // 연결선의 y좌표
        const nextY = next.step * stepHeight + 20; // 다음 단계의 y좌표

        // 수직 하강 (연결선 위치까지)
        animationPath.push({ x: currentX, y: bridgeY });
        // 수평 이동 (연결선 위치에서)
        if (current.lane !== next.lane) {
            animationPath.push({ x: nextX, y: bridgeY });
        }
        // 수직 하강 (다음 단계까지)
        if (current.lane === next.lane || i === pathPositions.length - 2) {
            animationPath.push({ x: nextX, y: nextY });
        }
    }
    return animationPath;
};

// 랜덤 사다리 생성 함수 (각 레인 쌍에 최소 한 개 수평선 보장)
const generateRandomBridges = () => {
    const bridges = Array.from({ length: 5 }, () => ({
        lanePair: Math.floor(Math.random() * 3), // 0: 0-1, 1: 1-2, 2: 2-3
        hasBridge: false, // 초기값
    }));

    // 각 lanePair(0, 1, 2)에 최소 한 개 수평선 배치
    const usedSteps = new Set();
    [0, 1, 2].forEach((lanePair) => {
        let step;
        do {
            step = Math.floor(Math.random() * 5);
        } while (usedSteps.has(step)); // 중복 단계 방지
        usedSteps.add(step);
        bridges[step] = { lanePair, hasBridge: true };
    });

    // 나머지 단계는 랜덤으로 수평선 결정
    bridges.forEach((bridge, index) => {
        if (!usedSteps.has(index)) {
            bridge.lanePair = Math.floor(Math.random() * 3);
            bridge.hasBridge = Math.random() > 0.5;
        }
    });

    return bridges;
};

export default function LadderBoard() {
    const { messages, isConnected, connect, disconnect } = useSse();
    const [currentPosition, setCurrentPosition] = useState(0);
    const [selectedLane, setSelectedLane] = useState(0);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [bridges, setBridges] = useState([]);
    const [pathPositions, setPathPositions] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGenerated, setIsGenerated] = useState(false);

    // SSE 메시지 처리
    useEffect(() => {
        const latestMessage = messages[messages.length - 1];
        if (latestMessage?.player) {
            setCurrentPlayer(latestMessage.player);
        }
    }, [messages]);

    // 시작 레인 선택 시 플레이어 이동 및 경로 초기화
    useEffect(() => {
        if (!isPlaying) {
            setCurrentPosition(selectedLane);
            setPathPositions([]); // 경로 초기화
        }
    }, [selectedLane, isPlaying]);

    // 사다리 랜덤 생성 핸들러
    const handleGenerateLadder = () => {
        const newBridges = generateRandomBridges();
        setBridges(newBridges);
        setPathPositions([]);
        setCurrentPosition(selectedLane);
        setIsGenerated(true);
        setIsPlaying(false);
    };

    // 사다리타기 시작 핸들러
    const handleStartLadder = () => {
        if (!isGenerated) return;
        setCurrentPosition(selectedLane);
        const positions = calculatePath(selectedLane, bridges);
        setPathPositions(positions);
        setIsPlaying(true);
    };

    // 사다리 설정
    const lanes = 4; // 4개의 수직선
    const steps = 5; // 5단계
    const laneWidth = 150;
    const stepHeight = 90;
    const svgWidth = lanes * laneWidth;
    const svgHeight = steps * stepHeight;

    // 애니메이션 경로 (수직/수평 분리)
    const animationPath = pathPositions.length > 0
        ? calculateAnimationPath(pathPositions, laneWidth, stepHeight)
        : [];

    // 애니메이션 타이밍 계산
    const totalSteps = animationPath.length;
    const times = Array.from({ length: totalSteps }, (_, i) => i / (totalSteps - 1));

    return (
        <div className="p-4 bg-gray-50 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">사다리타기</h2>
            <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-4">
                    <label className="text-gray-600">시작 레인:</label>
                    <select
                        value={selectedLane}
                        onChange={(e) => setSelectedLane(Number(e.target.value))}
                        className="px-2 py-1 border rounded-lg text-gray-700"
                        disabled={isPlaying}
                    >
                        {[0, 1, 2, 3].map((lane) => (
                            <option key={lane} value={lane}>
                                레인 {lane + 1}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={handleGenerateLadder}
                    className="px-4 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-800 transition-colors duration-300 disabled:opacity-50"
                    disabled={isPlaying}
                >
                    사다리 랜덤 생성
                </button>
                <button
                    onClick={handleStartLadder}
                    className="px-4 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-700 transition-colors duration-300 disabled:opacity-50"
                    disabled={!isGenerated || isPlaying}
                >
                    {isPlaying ? '진행 중...' : '사다리타기 시작'}
                </button>
                <button
                    onClick={isConnected ? disconnect : connect}
                    className={`ml-auto px-4 py-1 ${
                        isConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-500 hover:bg-blue-700'
                    } text-white rounded-lg transition-colors duration-300 disabled:opacity-50`}
                    disabled={isPlaying}
                >
                    {isConnected ? 'SSE 해제' : 'SSE 연결'}
                </button>
            </div>
            <p
                className={`transition-all duration-500 ${
                    currentPlayer ? 'text-purple-500 font-medium' : 'text-gray-600'
                }`}
            >
                현재 플레이어: {currentPlayer || '없음'}
            </p>
            <svg
                width="100%"
                height={svgHeight}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="border border-gray-300 mt-4 rounded-md bg-white"
            >
                {/* 수직 사다리 선 */}
                {Array.from({ length: lanes }).map((_, i) => (
                    <line
                        key={`vline-${i}`}
                        x1={i * laneWidth + laneWidth / 2}
                        y1={0}
                        x2={i * laneWidth + laneWidth / 2}
                        y2={svgHeight}
                        stroke="#4B5563"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />
                ))}
                {/* 수평 연결선 */}
                {bridges.map(({ lanePair, hasBridge }, step) => {
                    if (hasBridge) {
                        return (
                            <line
                                key={`hline-${step}`}
                                x1={lanePair * laneWidth + laneWidth / 2}
                                y1={(step + 0.5) * stepHeight}
                                x2={(lanePair + 1) * laneWidth + laneWidth / 2}
                                y2={(step + 0.5) * stepHeight}
                                stroke="#4B5563"
                                strokeWidth="4"
                                strokeLinecap="round"
                            />
                        );
                    }
                    return null;
                })}
                {/* 플레이어 이동 경로 선 */}
                {pathPositions.length > 1 && (
                    <polyline
                        points={animationPath.map((pos) => `${pos.x},${pos.y}`).join(' ')}
                        stroke="#fc4c8d"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray="5,5"
                    />
                )}
                {/* 플레이어 아이콘 */}
                {isPlaying && animationPath.length > 0 ? (
                    <motion.g
                        animate={{
                            x: animationPath.map((pos) => pos.x - animationPath[0].x),
                            y: animationPath.map((pos) => pos.y - animationPath[0].y),
                        }}
                        transition={{
                            duration: totalSteps * 0.5,
                            times,
                            ease: 'easeInOut',
                            onComplete: () => setIsPlaying(false), // 애니메이션 종료 시 isPlaying false
                        }}
                    >
                        <circle
                            cx={animationPath[0].x}
                            cy={animationPath[0].y}
                            r="25"
                            fill="#fc4c8d"
                            stroke="#FFFFFF"
                            strokeWidth="2"
                        />
                        <text
                            x={animationPath[0].x}
                            y={animationPath[0].y + 5}
                            textAnchor="middle"
                            fontSize="12"
                            fill="white"
                            fontWeight="bold"
                        >
                            {currentPlayer || 'P'}
                        </text>
                    </motion.g>
                ) : (
                    <g>
                        <circle
                            cx={currentPosition * laneWidth + laneWidth / 2}
                            cy={20}
                            r="25"
                            fill="#fc4c8d"
                            stroke="#FFFFFF"
                            strokeWidth="2"
                        />
                        <text
                            x={currentPosition * laneWidth + laneWidth / 2}
                            y={25}
                            textAnchor="middle"
                            fontSize="12"
                            fill="white"
                            fontWeight="bold"
                        >
                            {currentPlayer || 'P'}
                        </text>
                    </g>
                )}
            </svg>
        </div>
    );
}
'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import '../../styles/LadderBoard.scss';

// 사다리 경로 계산 함수
const calculatePath = async (startLane, bridges, lanes) => {
    console.log('calculatePath > ',startLane, bridges, lanes)
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
        if (currentLane >= 0 && currentLane < lanes) {
            positions.push({ lane: currentLane, step: step + 1 });
        }
    });

    // 마지막 단계 추가
    if (positions.length <= bridges.length && currentLane >= 0 && currentLane < lanes) {
        positions.push({ lane: currentLane, step: bridges.length });
    }

    return positions;
};

// 애니메이션 경로 계산 함수
const calculateAnimationPath = (pathPositions, laneWidth, stepHeight) => {
    const animationPath = [];
    const startX = pathPositions[0].lane * laneWidth + laneWidth / 2;
    animationPath.push({ x: startX, y: 40 }); // 상단 여백 확보

    for (let i = 0; i < pathPositions.length - 1; i++) {
        const current = pathPositions[i];
        const next = pathPositions[i + 1];
        const currentX = current.lane * laneWidth + laneWidth / 2;
        const nextX = next.lane * laneWidth + laneWidth / 2;
        const bridgeY = (current.step + 0.5) * stepHeight;
        const nextY = next.step * stepHeight + 40;

        if (current.lane !== next.lane) {
            animationPath.push({ x: currentX, y: bridgeY });
            animationPath.push({ x: nextX, y: bridgeY });
        }
        animationPath.push({ x: nextX, y: nextY });
    }
    return animationPath;
};

// 랜덤 사다리 생성 함수
const generateRandomBridges = (lanes) => {
    const steps = Math.max(8, Math.ceil(lanes * 2));
    const bridges = Array.from({ length: steps }, () => ({
        lanePair: Math.floor(Math.random() * (lanes - 1)),
        hasBridge: false,
    }));

    // 각 레인 쌍에 최소 두 개의 수평선 보장
    const usedSteps = new Set();
    for (let lanePair = 0; lanePair < lanes - 1; lanePair++) {
        // 첫 번째 수평선
        let step1;
        do {
            step1 = Math.floor(Math.random() * steps);
        } while (usedSteps.has(step1));
        usedSteps.add(step1);
        bridges[step1] = { lanePair, hasBridge: true };

        // 두 번째 수평선
        let step2;
        do {
            step2 = Math.floor(Math.random() * steps);
        } while (usedSteps.has(step2));
        usedSteps.add(step2);
        bridges[step2] = { lanePair, hasBridge: true };
    }

    // 나머지 단계에 랜덤으로 수평선 추가
    bridges.forEach((bridge, index) => {
        if (!usedSteps.has(index)) {
            bridge.lanePair = Math.floor(Math.random() * (lanes - 1));
            bridge.hasBridge = Math.random() > 0.3; // 70% 확률
        }
    });

    return bridges;
};

export default function LadderBoard({ roomId, roomInfo }) {
    const [lanes, setLanes] = useState(4); // 기본값
    const [currentPosition, setCurrentPosition] = useState(0);
    const [selectedLane, setSelectedLane] = useState(0);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [bridges, setBridges] = useState([]);
    const [pathPositions, setPathPositions] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGenerated, setIsGenerated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);


    // 이전 컴포넌트에서 방 정보 가져오기
    useEffect(() => {
        console.log('>>roomInfo ', roomInfo)
        if (!roomId) {
            setError('Room ID is required');
            setIsLoading(false);
            return;
        }

        setCurrentPlayer(roomInfo.nickname)

        const fetchLanes = async () => {
            try {
                // TODO
                // const res = await fetch(`http://localhost:3001/api/rooms/${roomId}`);
                // if (!res.ok) throw new Error('Failed to fetch room data');
                // const data = await roomInfo.json();
                const data = await roomInfo;
                // const data = {
                //     "lanes": 4,
                //     "romeId": "12345"
                // }
                const newLanes = Math.min(Math.max(Number(data.lanes) || 4, 2), 10);
                setLanes(newLanes);
                setSelectedLane(null); // 레인 초기화
                setBridges([]); // 사다리 초기화
                setPathPositions([]);
                setIsGenerated(false);
                setIsPlaying(false);
                setIsLoading(false);
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };

        fetchLanes();
    }, [roomId]);

    // TODO 서버에서 참가자 정보 가져오기
    
    

    // 시작 레인 선택 시 플레이어 이동 및 경로 초기화
    useEffect(() => {
        if (!isPlaying) {
            setCurrentPosition(selectedLane);
            setPathPositions([]);
            setBridges([]);
        }
    }, [selectedLane, isPlaying]);


    // 사다리 랜덤 생성 핸들러
    const handleGenerateLadder = () => {
        const newBridges = generateRandomBridges(lanes);
        setBridges(newBridges);
        setPathPositions([]);
        setCurrentPosition(selectedLane);
        setIsGenerated(true);
        setIsPlaying(false);
    };

    // 사다리타기 시작 핸들러
    const handleStartLadder = async () => {
        console.log('selectedLane> ', selectedLane)
        if (selectedLane === null) return;

        // 사다리 랜덤 생성
        const newBridges = generateRandomBridges(lanes);
        setBridges(newBridges);
        setPathPositions([]);

        setCurrentPosition(selectedLane);

        const positions = await calculatePath(selectedLane, newBridges, lanes);
        setPathPositions(positions);
        setIsPlaying(true);
    };

    // 사다리 설정
    const laneWidth = 200;
    const stepHeight = 120;
    const steps = Math.max(5, Math.ceil(lanes * 1.5));
    const svgWidth = lanes * laneWidth;
    const svgHeight = steps * stepHeight + 40;

    // 애니메이션 경로
    const animationPath = pathPositions.length > 0
        ? calculateAnimationPath(pathPositions, laneWidth, stepHeight)
        : [];

    // 애니메이션 타이밍
    const totalSteps = animationPath.length || 1;
    const times = Array.from({ length: totalSteps }, (_, i) => i / (totalSteps - 1));

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="ladder-board">
            <h2 className="ladder-title">사다리타기 - 방 {roomInfo.roomName}</h2>
            <div className="controls">
                <div className="lane-selector">
                    <label className="lane-label">시작 레인:</label>
                    <select
                        value={selectedLane}
                        onChange={(e) => setSelectedLane(Number(e.target.value))}
                        className="lane-select"
                        disabled={isPlaying}
                    >
                        {Array.from({ length: lanes }, (_, i) => (
                            <option key={i} value={i}>
                                레인 {i + 1}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={handleGenerateLadder}
                    className="generate-button"
                    disabled={isPlaying}
                >
                    사다리 랜덤 생성
                </button>
                <button
                    onClick={handleStartLadder}
                    className="start-button"
                    disabled={ selectedLane === null || isPlaying}
                >
                    {isPlaying ? '진행 중...' : '사다리타기 시작'}
                </button>
            </div>
            <p
                className={`current-player ${currentPlayer ? 'active' : ''}`}
            >
                현재 플레이어: {currentPlayer || '없음'}
            </p>
            <svg
                width="100%"
                height={svgHeight}
                viewBox={`0 -40 ${svgWidth} ${svgHeight}`}
                className="ladder-svg"
            >
                {/* 레인 선택 버튼 */}
                {selectedLane === null && (
                    Array.from({ length: lanes }).map((_, i) => (
                        <foreignObject
                            key={`lane-btn-${i}`}
                            x={i * laneWidth + laneWidth / 2 - 40} // 버튼 너비(80)의 절반을 빼서 중앙 정렬
                            y={-25} // 요청된 y 좌표
                            width={80}
                            height={30}
                        >
                            <button
                                className={`lane-button ${selectedLane !== i ? 'active' : ''}`}
                                onClick={() => setSelectedLane(i)} // handleSelectedLane 대신 setSelectedLane 사용
                                disabled={isPlaying}
                            >
                                레인 {i + 1}
                            </button>
                        </foreignObject>
                    ))
                )}
                {/* 수직 사다리 선 */}
                {Array.from({ length: lanes }).map((_, i) => (
                    <line
                        key={`vline-${i}`}
                        x1={i * laneWidth + laneWidth / 2}
                        y1={0}
                        x2={i * laneWidth + laneWidth / 2}
                        y2={svgHeight - 40}
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
                {selectedLane !== null && (
                    isPlaying && animationPath.length > 0 ? (
                        <motion.g
                            animate={{
                                x: animationPath.map((pos) => pos.x - animationPath[0].x),
                                y: animationPath.map((pos) => pos.y - animationPath[0].y),
                            }}
                            transition={{
                                duration: totalSteps * 0.1,
                                times,
                                ease: 'easeInOut',
                                onComplete: () => {
                                    setIsPlaying(false)
                                    // 마지막 위치에 도달했을 때 alert 추가
                                    if (pathPositions.length > 0 && pathPositions[pathPositions.length - 1].step === bridges.length) {
                                        if(roomInfo.winRailNo === selectedLane){
                                            alert('당첨!');
                                        }
                                        setSelectedLane(null)
                                    }
                                },
                            }}
                        >
                            <circle
                                cx={animationPath[0].x}
                                cy={animationPath[0].y}
                                r="25"
                                fill="#fc4c8d"
                                stroke="#FFFFFF"
                                strokeWidth="2"
                                className="player-circle"
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
                                cy={3}
                                r="25"
                                fill="#fc4c8d"
                                stroke="#FFFFFF"
                                strokeWidth="2"
                                className="player-circle"
                            />
                            <text
                                x={currentPosition * laneWidth + laneWidth / 2}
                                y={3}
                                textAnchor="middle"
                                fontSize="12"
                                fill="white"
                                fontWeight="bold"
                            >
                                {currentPlayer || 'P'}
                            </text>
                        </g>
                    )
                )}
            </svg>
        </div>
    );
}
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

export default function LadderBoard({ roomId, roomInfo, nickname }) {
    const [lanes, setLanes] = useState(4); // 기본값
    const [currentPosition, setCurrentPosition] = useState(0);
    const [selectedLane, setSelectedLane] = useState(0);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [bridges, setBridges] = useState([]);
    const [pathPositions, setPathPositions] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
// 새로운 상태: 방 정보와 참여자
    const [roomData, setRoomData] = useState(null);
    const [participants, setParticipants] = useState([]);
console.log('!!!! 1!!!! roomId ', roomId)


    // 방 정보와 참여자 정보 가져오기
    useEffect(() => {
        if (!roomId) {
            setError('Room ID is required');
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // 실제 API 요청
                await fetch(`http://localhost:9090/search/rooms?roomId=${roomId}`, {
                    method: "GET",
                })
                    .then((response) => response.json())
                    .then((data) => {
                        console.log('>>>>data',data)
                        setRoomData(data); // 상태 업데이트
                        console.log('>>>>room data >',roomData)
                    })
                .catch((error) => {
                    console.error("Error fetching rooms:", error);
                });





            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        console.log('>>>>>222',roomData)
        if(roomData){
            console.log('>>>>>roomData.participants',roomData.participants, roomData?.participants )
            const newLanes = Math.min(Math.max(Number(roomInfo?.lanes) || 4, 2), 10);
            setLanes(newLanes);
            setCurrentPlayer(nickname || '');
            setBridges([]);
            setPathPositions([]);
            setIsPlaying(false);

            // 참여자 정보 처리
            const participantsData = roomData.participants !== undefined  ? roomData.participants.filter(p => p.nickname !== nickname) : null; // 나를 제외한 참가자
            if(roomData.participants !== undefined ){
                setSelectedLane( roomData.participants.find(p => p.nickname === nickname).selectedLane )
                setParticipants(participantsData.participants);
            }


            console.log('>participants > ', participants)
            setIsLoading(false);
        }

    }, [roomData])

    // 시작 레인 선택 시 플레이어 이동 및 경로 초기화
    useEffect(() => {
        if (!isPlaying) {
            setCurrentPosition(selectedLane);
            setPathPositions([]);
            setBridges([]);
        }
    }, [selectedLane, isPlaying]);

    //사다리 선택 핸들러
    const handleSelectedLane = async (lane) => {
        try {
            // TODO
            // await fetch(`http://localhost:9090/add/lane?roomId=${roomId}&nickname=${nickname}&selectedLane=${selectedLane}`)
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        } finally {
            setSelectedLane(lane);
        }
    }

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
            <h2 className="ladder-title">사다리타기 - 방 {roomData?.roomName}</h2>
            <div className="controls">
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
                                // onClick={() => setSelectedLane(i)}
                                onClick={() => handleSelectedLane(i)}
                                disabled={  roomData.participants !== undefined && roomData?.participants.some((p) => p.selectedLane === i) || isPlaying }
                            >
                                {
                                    roomData.participants !== undefined && roomData.participants.some((p) => p.selectedLane === i)
                                        ? roomData?.participants.find((p) => p.selectedLane === i).nickname
                                        : `레인 ${i + 1}`
                                }
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
                                {currentPlayer || nickname}
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
                                {currentPlayer || nickname}
                            </text>
                        </g>
                    )
                )}
                {/* 다른 참가자 아이콘 표시 */}
                { selectedLane !== null && roomData.participants?.length > 0 && roomData.participants
                    .filter((p) => p.selectedLane !== null && p.nickname !== nickname)
                    .map((p, idx) => {
                        const color = `hsl(${(p.selectedLane * 60) % 360}, 70%, 60%)`; // 간단한 색상 로직
                        return (
                            <g key={`participant-${idx}`}>
                                <circle
                                    cx={p.selectedLane * laneWidth + laneWidth / 2}
                                    cy={3}
                                    r="25"
                                    fill={color}
                                    stroke="#FFFFFF"
                                    strokeWidth="2"
                                    className="participant-circle"
                                />
                                <text
                                    x={p.selectedLane * laneWidth + laneWidth / 2}
                                    y={3}
                                    textAnchor="middle"
                                    fontSize="11"
                                    fill="white"
                                    fontWeight="bold"
                                >
                                    {p.nickname}
                                </text>
                            </g>
                        );
                    })}
            </svg>
        </div>
    );
}
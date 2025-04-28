// SSE 데이터를 관리할 Context
'use client';
import React, { createContext, useContext, useState, useRef } from 'react';

const SseContext = createContext();

export const SseProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const eventSourceRef = useRef(null);

    const connect = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }

        const eventSource = new EventSource('/api/sse');
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
            setIsConnected(true);
            setError(null);
        };

        eventSource.onmessage = (event) => {
            try {
                const newMessage = JSON.parse(event.data);
                setMessages((prev) => [...prev, newMessage]);
                setError(null);
            } catch (err) {
                console.error('메시지 파싱 오류:', err);
                setError('메시지 처리 중 오류 발생');
            }
        };

        eventSource.onerror = () => {
            console.error('SSE 연결 오류');
            setError('SSE 연결 실패');
            setIsConnected(false);
            eventSource.close();
            eventSourceRef.current = null;
        };
    };

    const disconnect = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
            setIsConnected(false);
            setError(null);
        }
    };

    // useEffect(() => {
    //     connect();
    //     return () => disconnect();x
    // }, []);

    return (
        <SseContext.Provider value={{ messages, error, isConnected, connect, disconnect }}>
            {children}
        </SseContext.Provider>
    );
};


// 커스텀 Hook
export const useSse = () => {
    const context = useContext(SseContext);
    if (!context) {
        throw new Error('useSse는 SseProvider 안에서 사용해야 합니다.');
    }
    return context;
};
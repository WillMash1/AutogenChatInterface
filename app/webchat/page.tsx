// components/WebSocketDemo.tsx
"use client"; // Mark as client component

import { useState, useEffect, useRef } from 'react';

type Message = {
  text: string;
  sender: 'You' | 'Server';
};

type ConnectionStatus = 'Connected' | 'Disconnected' | 'Error';

export default function WebChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('Disconnected');
  const socketRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    if(messages.length) {
        console.log('message: ', messages[0].text);
    }
},[messages])


  const connectWebSocket = (): void => {
    // Create WebSocket connection
    socketRef.current = new WebSocket('ws://localhost:8002/ws/chat');
    
    // Connection opened
    socketRef.current.onopen = () => {
      setConnectionStatus('Connected');
      console.log('WebSocket connection established');
    };

    // Listen for messages
    socketRef.current.onmessage = (event: MessageEvent) => {
      console.log("event: ", JSON.parse(event.data).content);
      const response = JSON.parse(event.data).content as string;
      setMessages((prevMessages) => [...prevMessages, { text: response, sender: 'Server' }]);
    };

    // Connection closed
    socketRef.current.onclose = () => {
      setConnectionStatus('Disconnected');
      console.log('WebSocket connection closed');
      
      // Optional: attempt reconnection after delay
      setTimeout(() => {
        if (socketRef.current?.readyState === WebSocket.CLOSED) {
          connectWebSocket();
        }
      }, 2000);
    };

    // Connection error
    socketRef.current.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('Error');
    };
  };

    useEffect(() => {
    // Connect to the WebSocket server when component mounts
    connectWebSocket();

    // Clean up the WebSocket connection when component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connectWebSocket]);

  const sendMessage = (e: React.FormEvent): void => {
    e.preventDefault();
    
    if (!inputMessage.trim() || socketRef.current?.readyState !== WebSocket.OPEN) {
      return;
    }
    
    // Send message to the server
    socketRef.current.send(JSON.stringify({content: inputMessage, source: "user"}));
    
    // Add message to the UI
    setMessages((prevMessages) => [...prevMessages, { text: inputMessage, sender: 'You' }]);
    

    // Clear input field
    setInputMessage('');
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">WebSocket Chat</h1>
      
      <div className="mb-4">
        <span className="mr-2">Status:</span>
        <span className={`font-bold ${
          connectionStatus === 'Connected' ? 'text-green-600' : 
          connectionStatus === 'Error' ? 'text-red-600' : 'text-yellow-600'
        }`}>
          {connectionStatus}
        </span>
        {connectionStatus !== 'Connected' && (
          <button 
            onClick={connectWebSocket}
            className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-sm"
            type="button"
          >
            Reconnect
          </button>
        )}
      </div>
      
      <div className="border rounded p-4 h-64 overflow-y-auto mb-4 bg-gray-50">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div key={index} className={`text-black mb-2 ${msg.sender === 'You' ? 'text-right' : ''}`}>
              <span className="font-bold">{msg.sender}: </span>
              <span>{msg.text}</span>
              
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">No messages yet</p>
        )}
      </div>
      
      <form onSubmit={sendMessage} className="flex">
        <input
          type="text"
          value={inputMessage}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
          className="flex-1 border rounded-l p-2"
          placeholder="Type a message..."
          disabled={connectionStatus !== 'Connected'}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-r"
          disabled={connectionStatus !== 'Connected'}
        >
          Send
        </button>
      </form>
    </div>
  );
}

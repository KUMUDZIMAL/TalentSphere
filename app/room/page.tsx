"use client";
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';

const Page = () => {
    const [roomId, setRoomId] = useState('');

    const handleClick = () => {
        if (roomId.trim()) {
            window.location.href = `/video-call/${roomId}`;
        } else {
            alert("Please enter a valid Room ID");
        }
    };

    return (
        <div>
            <input 
                placeholder="Enter Room ID" 
                name="roomid" 
                value={roomId} 
                onChange={(e) => setRoomId(e.target.value)} 
            />
            <Button onClick={handleClick}>Join</Button>
        </div>
    );
};

export default Page;

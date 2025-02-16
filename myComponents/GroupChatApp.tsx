"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Group {
  _id: string;
  name: string;
  participants: string[];
}

const GroupChatList: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedUsernames, setSelectedUsernames] = useState<string[]>([]);
  const [newParticipantUsername, setNewParticipantUsername] = useState('');
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch('/api/groups');
        if (!res.ok) {
          console.error('Failed to fetch groups');
          return;
        }
        const data = await res.json();
        setGroups(data.groups);
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };
    fetchGroups();
  }, []);

  const createGroup = async () => {
    if (!newGroupName || selectedUsernames.length === 0) return;
    
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName,
          participantUsernames: selectedUsernames, // Sending usernames instead of IDs
        })
      });

      if (res.ok) {
        const { group } = await res.json();
        setGroups([...groups, group]);
        setNewGroupName('');
        setSelectedUsernames([]);
        setCurrentGroupId(group._id);
      } else {
        console.error('Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const addParticipant = async () => {
    if (!currentGroupId || !newParticipantUsername) return;
  
    try {
      const res = await fetch(`/api/groups`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          newParticipantUsername,  
        
          currentGroupId // make sure to send this
        }),
        credentials: 'include', // Ensure cookies (JWT) are sent
      });
  
      if (res.ok) {
        const { group } = await res.json();
        setGroups(groups.map(g => g._id === group._id ? group : g));
        setNewParticipantUsername('');
      } else {
        console.error('Failed to add participant');
      }
    } catch (error) {
      console.error('Error adding participant:', error);
    }
  };
  
  
  return (
    <div className="group-chat-container p-4">
      <h2 className="text-xl font-bold mb-4">Group Chats</h2>

      <div className="create-group-section mb-6">
        <input
          type="text"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="Group name"
          className="border p-2 mr-2"
        />
        <input
          type="text"
          value={selectedUsernames.join(',')}
          onChange={(e) => setSelectedUsernames(e.target.value.split(',').map(s => s.trim()))}
          placeholder="Participant usernames (comma separated)"
          className="border p-2 mr-2"
        />
        <button onClick={createGroup} className="p-2 bg-blue-500 text-white">
          Create Group
        </button>
      </div>

      {currentGroupId && (
        <div className="add-participant-section mb-6 border p-4">
          <h3 className="font-semibold">Add a Participant to Group</h3>
          <input
            type="text"
            value={newParticipantUsername}
            onChange={(e) => setNewParticipantUsername(e.target.value)}
            placeholder="New Participant Username"
            className="border p-2 mr-2"
          />
          <button onClick={addParticipant} className="p-2 bg-green-500 text-white">
            Add Participant
          </button>
        </div>
      )}

      <div className="group-list">
        {groups.map(group => (
          <div key={group._id} className="group-item border p-4 mb-4">
            <h3 className="text-lg font-medium">{group.name}</h3>
            <p className="text-sm">Participants: {group.participants.join(', ')}</p>
            <Link href={`/group-chat/${group._id}`}>
              <button className="p-2 mt-2 bg-gray-200">Open Chat</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupChatList;

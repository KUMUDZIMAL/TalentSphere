'use client';
import React, { useState, useRef, useEffect } from 'react';

export default function MentorChatPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'mentor'; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { role: 'user', content: input }]);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/mentor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setMessages((msgs) => [...msgs, { role: 'mentor', content: data.reply }]);
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 flex flex-col">
      <div className="w-full max-w-2xl mx-auto flex flex-col flex-1 p-0 sm:p-4">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200 py-4 px-4 rounded-t-xl shadow-sm">
          <h1 className="text-3xl font-extrabold text-blue-700 flex items-center gap-2">
            <span role="img" aria-label="Mentor">🎤</span> Virtual Mentor Chat
          </h1>
          <p className="text-gray-500 text-sm mt-1">Get real-time career advice, portfolio feedback, and industry insights.</p>
        </header>
        <div className="flex-1 overflow-y-auto px-2 py-4 bg-white rounded-b-xl shadow-md border border-t-0 border-gray-200">
          {messages.length === 0 && <div className="text-gray-400 text-center mt-16">Start the conversation...</div>}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
              <div className={`relative max-w-[75%] px-4 py-3 rounded-2xl shadow-sm text-base whitespace-pre-line ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-900 rounded-bl-none'}`}>
                <span className="block text-xs text-gray-300 mb-1 font-semibold">
                  {msg.role === 'user' ? 'You' : 'Mentor'}
                </span>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && <div className="text-gray-400 text-center">Mentor is typing...</div>}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={sendMessage} className="sticky bottom-0 bg-white/90 backdrop-blur flex gap-2 p-3 border-t border-gray-200 rounded-b-xl shadow-md">
          <input
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask for advice, feedback, or insights..."
            autoFocus
          />
          <button
            className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-semibold shadow transition disabled:opacity-50 disabled:cursor-not-allowed`}
            type="submit"
          
          >
            Send
          </button>
        </form>
        {error && <div className="text-red-500 mt-2 text-center">{error}</div>}
      </div>
    </div>
  );
} 
'use client';
import { useState } from 'react';
import { Sparkles, X, Volume2, VolumeX, Send, RefreshCw, MessageSquare, Leaf } from 'lucide-react';
import { sendVoiceInteract } from '@/services/aiService';
import Image from 'next/image';

export default function AiRobotCompanion() {
  const [isOpen, setIsOpen] = useState(false);
  const [emotion, setEmotion] = useState('happy');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I\'m Leafy 🌱✨ your friendly companion for focus. Write to me what\'s on your mind and I\'ll respond in kind!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);

  const speakText = (text) => {
    if (!isSpeechEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.95;
    utterance.pitch = 1.1;

    utterance.onstart = () => setEmotion('speaking');
    utterance.onend = () => setEmotion('happy');
    utterance.onerror = () => setEmotion('happy');

    window.speechSynthesis.speak(utterance);
  };

  const processUserMessage = async (userText) => {
    if (!userText || !userText.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setLoading(true);
    setEmotion('thinking');

    try {
      const data = await sendVoiceInteract(userText, 'normal');
      console.log('Backend Response Data:', data);

      const botReply = data.robotReplyText || 'I\'m here with you and ready to help!';

      setMessages((prev) => [...prev, { sender: 'bot', text: botReply }]);
      setEmotion('speaking');

      speakText(botReply);
    } catch (error) {
      console.error('Detailed Catch Error:', error);
      const fallback = `I couldn't connect to the server. Please make sure the Backend is running on the correct port.`;
      setMessages((prev) => [...prev, { sender: 'bot', text: fallback }]);
      speakText(fallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 bg-emerald-50/90 backdrop-blur-md border-2 border-emerald-300 hover:border-emerald-500 p-2.5 pr-5 rounded-full shadow-lg shadow-emerald-900/10 transition-all duration-300 hover:scale-105"
        >
          <div className="relative w-20 h-12 overflow-hidden0  flex items-center justify-center shadow-inner">
            <Image 
              src="/lettuce1.png" 
              alt="Lettuce Companion" 
              width={100} 
              height={48} 
              className="object-contain p-0.5 transform group-hover:rotate-6 transition-transform" 
            />
          </div>

          <div className="text-right">
            <p className="text-xs font-bold text-emerald-800 flex items-center gap-1">
              Leafy 🌱 <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-300" />
            </p>
            <p className="text-[10px] text-emerald-600 font-medium">Click to chat</p>
          </div>
        </button>
      )}

      {isOpen && (
        <div className="bg-emerald-50/95 backdrop-blur-md border-2 border-emerald-200 w-80 sm:w-96 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* Header Section */}
          <div className="bg-linear-to-b from-emerald-100 via-emerald-50 to-emerald-100/60 p-4 border-b border-emerald-200/70 flex flex-col items-center justify-center relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 left-3 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-200/50 p-1.5 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
              className="absolute top-3 right-3 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-200/50 p-1.5 rounded-full transition-colors"
              title={isSpeechEnabled ? 'Disable voice output' : 'Enable voice output'}
            >
              {isSpeechEnabled ? (
                <Volume2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-rose-400" />
              )}
            </button>

            {/* Avatar Display */}
            <div className="relative w-28 h-28 my-1 flex items-center justify-center">
              <div className="absolute inset-0 bg-emerald-200/60 rounded-full blur-md animate-pulse" />
              <div className="relative w-30 h-24 p-2  flex items-center justify-center ">
                <Image
                  src="/lettuce1.png"
                  alt="Lettuce Character"
                  width={150}
                  height={80}
                  className={`object-contain transition-transform duration-300 ${
                    emotion === 'speaking' 
                      ? 'animate-bounce' 
                      : emotion === 'thinking' 
                      ? 'animate-pulse scale-95' 
                      : 'hover:scale-105'
                  }`}
                />
              </div>
            </div>

            {/* Status Label */}
            <span className="text-[11px] font-bold text-emerald-800 mt-1 flex items-center gap-1.5 bg-emerald-200/60 px-3 py-1 rounded-full border border-emerald-300/50">
              {emotion === 'speaking'
                ? 'Leafy is talking to you now... 🔊'
                : emotion === 'thinking'
                ? 'Leafy is thinking... 💭'
                : 'Your friendly companion Leafy 🌱'}
            </span>
          </div>

          {/* Chat Messages Body */}
          <div className="p-4 h-64 overflow-y-auto space-y-3 bg-emerald-50/40 text-sm">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none font-medium'
                      : 'bg-white text-emerald-950 border border-emerald-200/80 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-emerald-200 p-2.5 rounded-2xl text-emerald-700 text-xs flex items-center gap-2 animate-pulse shadow-sm">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>Leafy Prebaring the answer... 🥬</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              processUserMessage(input);
            }}
            className="p-3 bg-white border-t border-emerald-200 flex items-center gap-2"
          >
            <div className="p-2 bg-emerald-100/80 rounded-xl text-emerald-700">
              <Leaf className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Write what's on your mind..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-emerald-50/60 border border-emerald-200 rounded-xl px-3 py-2 text-xs text-emerald-950 placeholder-emerald-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white p-2.5 rounded-xl transition-all disabled:opacity-40 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
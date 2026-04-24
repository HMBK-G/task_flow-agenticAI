import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2,
  Sparkles,
  ChevronRight,
  Mic,
  MicOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

export default function ChatPanel({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your TaskFlow AI assistant. How can I help you manage your club today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };

    try {
      // Create the new messages array including the user's latest input
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput('');
      setIsLoading(true);

      const res = await axios.post(`${API_BASE}/ai/process`, { messages: newMessages });
      const assistantMessage = { role: 'assistant', content: res.data.result };
      setMessages(prev => [...prev, assistantMessage]);
      window.dispatchEvent(new Event('refresh_data'));
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to the AI brain. Make sure the backend is running and API keys are set." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn(
      "fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-slate-100",
      isOpen ? "translate-x-0" : "translate-x-full"
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <Bot className="size-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg">AI Assistant</h2>
              <div className="flex items-center gap-1.5 text-xs text-indigo-100">
                <span className="size-2 bg-emerald-400 rounded-full animate-pulse"></span>
                Online & Ready
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
            <X className="size-5" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={cn(
                "flex gap-3 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}>
                <div className={cn(
                  "size-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                  msg.role === 'assistant' ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-600"
                )}>
                  {msg.role === 'assistant' ? <Bot className="size-5" /> : <User className="size-5" />}
                </div>
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed",
                  msg.role === 'assistant' 
                    ? "bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100" 
                    : "bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-100"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="size-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <Bot className="size-5" />
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 flex items-center gap-2 text-slate-400">
                  <Loader2 className="size-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <form onSubmit={handleSend} className="relative flex gap-2">
            <div className="relative flex-1">
              <Input 
                placeholder={isListening ? "Listening..." : "Ask me anything..."} 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className={cn(
                  "pr-10 h-12 rounded-xl border-slate-200 focus-visible:ring-indigo-600 bg-white transition-all duration-200",
                  isListening ? "border-indigo-400 ring-2 ring-indigo-100" : ""
                )}
                disabled={isLoading}
              />
              <button 
                type="button"
                onClick={toggleListening}
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 transition-colors",
                  isListening ? "text-indigo-600 animate-pulse" : "text-slate-400 hover:text-indigo-600"
                )}
              >
                {isListening ? <Mic className="size-5" /> : <Mic className="size-5" />}
              </button>
            </div>
            <Button 
              type="submit" 
              size="icon" 
              className="bg-indigo-600 hover:bg-indigo-700 size-12 rounded-xl shadow-lg shadow-indigo-100 shrink-0"
              disabled={isLoading || !input.trim()}
            >
              <Send className="size-5" />
            </Button>
          </form>
          <p className="text-[10px] text-center text-slate-400 mt-4 flex items-center justify-center gap-1">
            <Sparkles className="size-3" /> Powered by TaskFlow Intelligence
          </p>
        </div>
      </div>
    </div>
  );
}

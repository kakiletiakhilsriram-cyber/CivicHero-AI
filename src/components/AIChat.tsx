import { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  Cpu, 
  User, 
  Trash2, 
  ShieldCheck, 
  HelpCircle, 
  ThumbsUp, 
  ThumbsDown, 
  ClipboardCopy, 
  Check, 
  AlertTriangle,
  Flame,
  Info
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import { ChatMessage } from "../types";

interface AIChatProps {
  currentUser: any;
}

export default function AIChat({ currentUser }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init_bot",
      sender: "bot",
      text: `Hello **${currentUser?.name || "Citizen"}**! I am **CivicHero AI**, your neighborhood civic action assistant.

I am geolocated and synchronized with our **Live City telemetry database**. Here are some helpful ways we can collaborate:

* **Pothole Inquiries**: Check current progress updates, assigned officers, and timelines for reported issues (like the *Market St Pothole*).
* **Incident Scanning**: Search for active water leaks, garbage clusters, or road blockages in your district.
* **Municipal Procedures**: Learn which specific departments handle which city issues (Roads Board, Water Works, etc.) and how you can earn verification points.

Select one of the suggested prompts below or describe your concern in detail!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, "up" | "down">>({});
  
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Smooth, non-blocking scroll container scroll method
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      const handle = requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
      return () => cancelAnimationFrame(handle);
    }
  }, [messages, loading]);

  const simulateStreaming = (fullText: string) => {
    const words = fullText.split(" ");
    let currentText = "";
    let wordIndex = 0;
    
    const botMsgId = "msg_" + Date.now() + "_bot";
    const newBotMsg: ChatMessage = {
      id: botMsgId,
      sender: "bot",
      text: "",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newBotMsg]);
    
    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        currentText += (wordIndex === 0 ? "" : " ") + words[wordIndex];
        setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: currentText } : m));
        wordIndex++;
      } else {
        clearInterval(interval);
      }
    }, 25); // Faster streaming pace (approx 40 words/sec) for pleasant interaction
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: "msg_" + Date.now() + "_user",
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-10) // Carry short conversation context
        })
      });

      const data = await response.json();
      setLoading(false);
      
      if (data && data.text) {
        simulateStreaming(data.text);
      } else {
        simulateStreaming("I apologize, I received an incomplete response from my central cognitive unit. Let's try rephrasing your question!");
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      simulateStreaming("I am having difficulty reaching my civic databases due to temporary network strain. Let me assist you using local emergency protocols instead!");
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "init_bot",
        sender: "bot",
        text: `Hello again, **${currentUser?.name || "Citizen"}**! I've cleared our chat history and refreshed our telemetry buffers. What neighborhood issue would you like to explore?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setFeedback({});
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (msgId: string, type: "up" | "down") => {
    setFeedback(prev => ({
      ...prev,
      [msgId]: prev[msgId] === type ? "" as any : type
    }));
  };

  const SUGGESTIONS = [
    { text: "Why is the Market St pothole delayed?", label: "Market St Pothole" },
    { text: "Are there any dangerous road leaks near me?", label: "Nearby Hazards" },
    { text: "How do I earn the Top Verifier badge?", label: "Badge Guide" },
    { text: "Which department fixes tree blockages?", label: "Department Router" }
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-4 flex flex-col h-[calc(100vh-90px)] min-h-[550px] gap-4" id="ai-chat-page">
      
      {/* Header Panel */}
      <div className="flex flex-row justify-between items-center bg-white border border-[#E0E0E0] px-4 py-3.5 rounded-xl shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E8F0FE] text-[#1967D2] border border-[#D2E3FC]">
            <Cpu className="h-5.5 w-5.5 text-[#4285F4] animate-pulse" />
          </div>
          <div>
            <h1 className="font-sans text-xs sm:text-sm font-bold text-[#202124] flex items-center gap-2">
              CivicHero AI Assistant
              <span className="inline-flex items-center gap-1 bg-[#E6F4EA] text-[#137333] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                <ShieldCheck className="h-3 w-3 text-[#188038]" /> Live Telemetry
              </span>
            </h1>
            <p className="text-[#5F6368] text-[10px] sm:text-[11px] font-medium">Independent, grounded, structured neighborhood diagnostics</p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#5F6368] hover:text-[#C5221F] bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
          title="Restart Session"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Reset chat</span>
        </button>
      </div>

      {/* Main Messages stream */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto bg-slate-50 border border-[#E0E0E0] rounded-xl p-4 sm:p-5 shadow-inner flex flex-col gap-6 min-h-0"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            const isCopied = copiedId === msg.id;
            const messageFeedback = feedback[msg.id];

            return (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar Column */}
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border shadow-xs ${
                  isUser 
                    ? "bg-[#E8F0FE] text-[#1967D2] border-[#D2E3FC]" 
                    : "bg-[#202124] text-white border-gray-800 relative"
                }`}>
                  {isUser ? (
                    <User className="h-4.5 w-4.5" />
                  ) : (
                    <>
                      <Cpu className="h-4 w-4 text-[#4285F4]" />
                      <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-[#188038] ring-1 ring-white" />
                    </>
                  )}
                </div>

                {/* Bubble & Metadata Column */}
                <div className="flex flex-col gap-1 w-full">
                  
                  {/* Sender Name & Timestamp */}
                  <div className={`flex items-center gap-2 px-1 text-[10px] text-[#5F6368] font-semibold ${isUser ? "justify-end" : "justify-start"}`}>
                    <span>{isUser ? "You" : "CivicHero AI"}</span>
                    <span className="text-[9px] font-normal opacity-70 font-mono">• {msg.timestamp}</span>
                  </div>

                  {/* Speech Bubble */}
                  <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed border relative group ${
                    isUser 
                      ? "bg-[#1973E8] border-[#1557B0] text-white rounded-tr-none" 
                      : "bg-white border-[#E0E0E0] text-[#202124] rounded-tl-none shadow-xs"
                  }`}>
                    
                    {/* Markdown Content */}
                    <div className="prose prose-sm max-w-none break-words">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-[12.5px]">{children}</p>,
                          strong: ({ children }) => <strong className={`font-bold ${isUser ? "text-white" : "text-[#202124]"}`}>{children}</strong>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1 text-[12.5px]">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1 text-[12.5px]">{children}</ol>,
                          li: ({ children }) => <li className="text-[12.5px] mb-0.5">{children}</li>,
                          code: ({ children }) => (
                            <code className={`px-1 py-0.5 rounded font-mono text-[11px] ${
                              isUser ? "bg-[#1557B0] text-white border border-[#124d9c]" : "bg-gray-100 text-[#C5221F] border border-gray-200"
                            }`}>
                              {children}
                            </code>
                          )
                        }}
                      >
                        {msg.text || "Thinking..."}
                      </ReactMarkdown>
                    </div>

                    {/* Integrated Action Buttons inside specific responses */}
                    {!isUser && msg.text.includes("Market St") && (
                      <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-wrap gap-2">
                        <button 
                          onClick={() => handleSendMessage("Show Market St pothole timeline")}
                          className="flex items-center gap-1 text-[10px] font-bold text-[#1973E8] hover:bg-blue-50 border border-blue-200 hover:border-blue-300 px-2.5 py-1 rounded-md transition-colors"
                        >
                          <Info className="h-3 w-3" />
                          <span>View Timeline</span>
                        </button>
                        <button 
                          onClick={() => handleSendMessage("Who is repairing Market St?")}
                          className="flex items-center gap-1 text-[10px] font-bold text-[#1973E8] hover:bg-blue-50 border border-blue-200 hover:border-blue-300 px-2.5 py-1 rounded-md transition-colors"
                        >
                          <User className="h-3 w-3" />
                          <span>Check Assignment</span>
                        </button>
                      </div>
                    )}

                    {!isUser && msg.text.includes("Haight St") && (
                      <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-wrap gap-2">
                        <button 
                          onClick={() => handleSendMessage("Is the Haight St water leak hazardous?")}
                          className="flex items-center gap-1 text-[10px] font-bold text-[#D93025] hover:bg-red-50 border border-red-200 hover:border-red-300 px-2.5 py-1 rounded-md transition-colors"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          <span>Assess Hazards</span>
                        </button>
                      </div>
                    )}

                    {!isUser && msg.text.includes("badge") && (
                      <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-wrap gap-2">
                        <button 
                          onClick={() => handleSendMessage("How can I earn points as a Citizen?")}
                          className="flex items-center gap-1 text-[10px] font-bold text-amber-700 hover:bg-amber-50 border border-amber-200 hover:border-amber-300 px-2.5 py-1 rounded-md transition-colors"
                        >
                          <Flame className="h-3 w-3" />
                          <span>Earn Citizen Points</span>
                        </button>
                      </div>
                    )}

                    {/* Quick copy & feedback actions overlay */}
                    <div className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 p-1 rounded-md bg-white border border-gray-200 shadow-sm ${isUser ? "hidden" : ""}`}>
                      <button 
                        onClick={() => handleCopyText(msg.text, msg.id)}
                        className="text-gray-400 hover:text-gray-600 p-0.5 transition-colors"
                        title="Copy message to clipboard"
                      >
                        {isCopied ? <Check className="h-3 w-3 text-green-600" /> : <ClipboardCopy className="h-3 w-3" />}
                      </button>
                      <button 
                        onClick={() => handleFeedback(msg.id, "up")}
                        className={`p-0.5 transition-colors ${messageFeedback === "up" ? "text-green-600" : "text-gray-400 hover:text-gray-600"}`}
                        title="Thumbs Up"
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </button>
                      <button 
                        onClick={() => handleFeedback(msg.id, "down")}
                        className={`p-0.5 transition-colors ${messageFeedback === "down" ? "text-red-600" : "text-gray-400 hover:text-gray-600"}`}
                        title="Thumbs Down"
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </button>
                    </div>

                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {loading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 max-w-[85%] mr-auto"
          >
            <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 bg-[#202124] text-white border border-gray-800">
              <Cpu className="h-4 w-4 text-[#4285F4]" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="px-1 text-[10px] text-[#5F6368] font-semibold">CivicHero AI</div>
              <div className="rounded-2xl px-4 py-3 bg-white border border-gray-200 shadow-xs rounded-tl-none flex items-center gap-3">
                <div className="flex gap-1.5 items-center">
                  <motion.span 
                    animate={{ scale: [1, 1.4, 1] }} 
                    transition={{ repeat: Infinity, duration: 1, delay: 0 }} 
                    className="h-2 w-2 bg-[#4285F4] rounded-full inline-block" 
                  />
                  <motion.span 
                    animate={{ scale: [1, 1.4, 1] }} 
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} 
                    className="h-2 w-2 bg-[#34A853] rounded-full inline-block" 
                  />
                  <motion.span 
                    animate={{ scale: [1, 1.4, 1] }} 
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} 
                    className="h-2 w-2 bg-[#FBBC05] rounded-full inline-block" 
                  />
                </div>
                <span className="text-[11px] text-[#5F6368] font-medium font-sans">AI scanning databases...</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Suggested Quick Inquiries */}
      <div className="shrink-0 space-y-2 bg-white border border-[#E0E0E0] p-3 rounded-xl shadow-sm">
        <p className="text-[9px] font-mono font-bold tracking-wider uppercase text-[#5F6368] px-1 flex items-center gap-1.5">
          <HelpCircle className="h-3.5 w-3.5 text-[#4285F4]" />
          Suggested quick queries:
        </p>
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {SUGGESTIONS.map((s, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.015, backgroundColor: "#E8F0FE", borderColor: "#4285F4" }}
              whileTap={{ scale: 0.985 }}
              onClick={() => handleSendMessage(s.text)}
              disabled={loading}
              className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-gray-50 border border-gray-200 text-[#5F6368] hover:text-[#1973E8] whitespace-nowrap transition-colors cursor-pointer shrink-0 disabled:opacity-50 disabled:pointer-events-none"
            >
              {s.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Input Form area */}
      <div className="flex gap-2 shrink-0 bg-white p-2 rounded-xl border border-[#E0E0E0] shadow-sm">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim() && !loading) {
              handleSendMessage(input);
            }
          }}
          placeholder="Ask a question about local reports, badges, or city departments..."
          className="flex-1 bg-transparent px-3 text-xs text-[#202124] focus:outline-none placeholder-gray-400"
          disabled={loading}
        />
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleSendMessage(input)}
          disabled={!input.trim() || loading}
          className="bg-[#4285F4] hover:bg-[#1973E8] disabled:bg-gray-100 disabled:text-gray-400 text-white h-9 px-4 flex items-center justify-center gap-1.5 rounded-lg transition-colors shrink-0 shadow-xs cursor-pointer text-xs font-bold"
        >
          <span>Send</span>
          <Send className="h-3.5 w-3.5" />
        </motion.button>
      </div>

    </div>
  );
}

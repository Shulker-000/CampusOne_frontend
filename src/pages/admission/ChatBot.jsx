import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {ComputerIcon} from "lucide-react"

const ChatBot = ({ institutions = [] }) => {

    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState("");
    const [selectedCode, setSelectedCode] = useState("");

    const bottomRef = useRef(null);

    // session id
    useEffect(() => {
        let id = localStorage.getItem("chat_session");
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem("chat_session", id);
        }
        setSessionId(id);
    }, []);

    // auto scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    // reset when switching college
    useEffect(() => {
        if (selectedCode) setMessages([]);
    }, [selectedCode]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        if (!selectedCode) {
            toast.error("Select a college first");
            return;
        }

        const userMessage = input;

        setMessages(prev => [...prev, { role: "user", text: userMessage }]);
        setInput("");
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("clgcode", selectedCode);
            formData.append("question", userMessage);
            formData.append("session_id", sessionId);

            const res = await fetch(`${import.meta.env.VITE_AI_URL}/chat`, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.detail);

            setMessages(prev => [...prev, { role: "bot", text: data.answer }]);

        } catch (err) {
            toast.error(err.message || "Chat failed");
        }

        setLoading(false);
    };

    return (
        <>
            {/* FLOAT BUTTON */}
            <div className="fixed bottom-5 right-5 z-50">
                <button
                    onClick={() => setOpen(!open)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl transition transform hover:scale-110"
                >
<ComputerIcon/>
                </button>
            </div>

            {/* CHAT WINDOW */}
            {open && (
                <div className="
          fixed z-50 bottom-20 right-5 
          w-[95vw] sm:w-96 
          h-[75vh] sm:h-[500px]
          bg-white rounded-2xl shadow-2xl border border-slate-200 
          flex flex-col overflow-hidden
        ">

                    {/* HEADER */}
                    <div className="bg-blue-600 text-white px-4 py-3 font-semibold flex justify-between items-center">
                        <span>Admission Assistant</span>
                        <button onClick={() => setOpen(false)}>✕</button>
                    </div>

                    {/* MESSAGES */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-white">

                        {!selectedCode && (
                            <div className="text-sm text-slate-500">
                                Select a college to begin chatting
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${msg.role === "user"
                                    ? "ml-auto bg-blue-600 text-white"
                                    : "bg-slate-100 text-slate-900"
                                    }`}
                            >
                                {msg.text}
                            </div>
                        ))}

                        {loading && (
                            <div className="text-sm text-slate-500">Thinking...</div>
                        )}

                        <div ref={bottomRef} />
                    </div>

                    {/* INPUT AREA */}
                    <div className="border-t border-slate-200 p-2 bg-white flex gap-2 flex-wrap">

                        {/* COLLEGE SELECT */}
                        <select
                            value={selectedCode}
                            onChange={(e) => setSelectedCode(e.target.value)}
                            className="w-full sm:w-auto px-2 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white"
                        >
                            <option value="">Select College</option>
                            {institutions.map((i) => (
                                <option key={i.code} value={i.code}>
                                    {i.name} ({i.code})
                                </option>
                            ))}
                        </select>

                        {/* INPUT */}
<input
    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white outline-none"
    placeholder="Ask about admissions..."
    value={input}
    onChange={(e) => setInput(e.target.value)}
    onKeyDown={(e) => {
        if (e.key === "Enter") {
            e.preventDefault(); // prevents form submit / newline
            if (!input.trim()) return; // avoid empty sends
            sendMessage();
        }
    }}
/>

                        {/* SEND */}
                        <button
                            onClick={sendMessage}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                            Send
                        </button>

                    </div>

                </div>
            )}
        </>
    );
};

export default ChatBot;
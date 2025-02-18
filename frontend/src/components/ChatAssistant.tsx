import React, { useState, useRef, useEffect } from "react";
import { Button, Form } from "react-bootstrap";
import axios from "axios";

interface ChatMessage {
  sender: "user" | "assistant";
  text: string;
}

const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newUserMsg: ChatMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newUserMsg]);

    const accessToken = localStorage.getItem("accessToken") || "";

    try {
      const response = await axios.post(
        "http://localhost:8000/personal_assistant/",
        { question: input },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = response.data as { response: string };
      const assistantMsg: ChatMessage = {
        sender: "assistant",
        text: data.response,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "assistant", text: "Sorry, an error occurred." },
      ]);
    }
    setInput("");
  };

  return (
    <div className="chat-widget">
      {isOpen ? (
        <div className="chat-window">
          <div className="chat-header">
            <span>Personal Assistant</span>
            <Button variant="light" size="sm" onClick={toggleChat}>
              X
            </Button>
          </div>
          <div
            className="chat-messages"
            style={{ flexGrow: 1, overflowY: "auto", padding: "10px" }}
          >
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <Form
            onSubmit={handleSend}
            className="chat-input-area"
            style={{ padding: "10px", display: "flex", gap: "5px" }}
          >
            <Form.Control
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button type="submit" variant="primary">
              Send
            </Button>
          </Form>
        </div>
      ) : (
        <Button
          className="chat-toggle-btn"
          variant="primary"
          onClick={toggleChat}
        >
          &#128172;
        </Button>
      )}
    </div>
  );
};

export default ChatAssistant;

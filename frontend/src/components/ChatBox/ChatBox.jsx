import React, { useState, useRef, useEffect } from 'react'
import { Button, Card } from 'react-bootstrap'
import { chatService } from '../../common/services'
import './ChatBox.css'

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hello! I am your AI assistant. How can I help you today?',
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Gọi API chat
      const response = await chatService.sendMessage(userMessage.text)
      
      const aiMessage = {
        id: Date.now() + 1,
        text: response.data?.response || 'Sorry, I cannot respond right now. Please try again later.',
        sender: 'ai',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, an error occurred. Please try again later.',
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <>
      {/* Floating Button */}
      <Button
        className={`chat-toggle-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        variant="primary"
        size="lg"
      >
        <i className={`bi ${isOpen ? 'bi-x-lg' : 'bi-chat-dots-fill'}`}></i>
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="chat-window">
          <Card.Header className="chat-header">
            <div className="d-flex align-items-center">
              <div className="chat-avatar me-2">
                <i className="bi bi-robot"></i>
              </div>
              <div>
                <h6 className="mb-0">AI Assistant</h6>
                <small className="text-muted">Online</small>
              </div>
            </div>
            <Button
              variant="link"
              className="p-0 text-muted"
              onClick={() => setIsOpen(false)}
            >
              <i className="bi bi-x-lg"></i>
            </Button>
          </Card.Header>

          <Card.Body className="chat-body">
            <div className="messages-container">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
                >
                  <div className="message-content">
                    {message.sender === 'ai' && (
                      <div className="message-avatar">
                        <i className="bi bi-robot"></i>
                      </div>
                    )}
                    <div className="message-bubble">
                      <p className="mb-0">{message.text}</p>
                      <small className="message-time">
                        {formatTime(message.timestamp)}
                      </small>
                    </div>
                    {message.sender === 'user' && (
                      <div className="message-avatar user-avatar">
                        <i className="bi bi-person-fill"></i>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message ai-message">
                  <div className="message-content">
                    <div className="message-avatar">
                      <i className="bi bi-robot"></i>
                    </div>
                    <div className="message-bubble">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </Card.Body>

          <Card.Footer className="chat-footer">
            <div className="input-group">
              <input
                ref={inputRef}
                type="text"
                className="form-control"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <Button
                variant="primary"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
              >
                <i className="bi bi-send-fill"></i>
              </Button>
            </div>
          </Card.Footer>
        </Card>
      )}
    </>
  )
}

export default ChatBox

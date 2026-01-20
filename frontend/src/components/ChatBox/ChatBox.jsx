import React, { useState, useRef, useEffect } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { chatService } from '../../common/services'
import './ChatBox.css'

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hello! I am your AI assistant. How can I help you today?\n\nHere are some questions you can ask me:\n• What books do you recommend?\n• How do I find books by category?\n• What are the featured books?\n• Can you help me navigate the website?',
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

    const userText = inputMessage.trim()
    const userMessage = {
      id: Date.now(),
      text: userText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await chatService.sendMessage(userText)
      
      const aiMessage = {
        id: Date.now() + 1,
        text: response.data?.response || 'Sorry, I cannot respond right now. Please try again later.',
        sender: 'ai',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const serverError =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message

      const errorMessage = {
        id: Date.now() + 1,
        text: serverError || 'Sorry, an error occurred. Please try again later.',
        sender: 'ai',
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
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
      <Button
        className={`chat-toggle-btn contact-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        variant="primary"
        size="lg"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <i className={`chat-toggle-icon bi ${isOpen ? 'bi-x-lg' : 'bi-chat-dots-fill'}`}></i>
      </Button>

      <Modal
        show={isOpen}
        onHide={() => setIsOpen(false)}
        centered
        backdrop="static"
        dialogClassName="chat-modal-dialog"
        contentClassName="chat-modal-content"
      >
        <Modal.Header className="chat-header" closeButton closeVariant="white">
          <div className="d-flex align-items-center">
            <div className="chat-avatar me-2">
              <i className="chat-header-icon bi bi-robot"></i>
            </div>
            <div>
              <h6 className="mb-0">AI Assistant</h6>
              <small>Online</small>
            </div>
          </div>
        </Modal.Header>

        <Modal.Body className="chat-body">
            <div className="messages-container">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
                >
                  <div className="message-content">
                    {message.sender !== 'user' && (
                      <div className="message-avatar">
                        <i className="message-avatar-icon bi bi-robot"></i>
                      </div>
                    )}
                    <div className={`message-bubble ${message.isError ? 'error-message' : ''}`}>
                      <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>{message.text}</p>
                      <small className="message-time">
                        {formatTime(message.timestamp)}
                      </small>
                    </div>
                    {message.sender === 'user' && (
                      <div className="message-avatar user-avatar">
                        <i className="message-avatar-icon bi bi-person-fill"></i>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message ai-message">
                  <div className="message-content">
                    <div className="message-avatar">
                      <i className="message-avatar-icon bi bi-robot"></i>
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
        </Modal.Body>

        <Modal.Footer className="chat-footer">
            <div className="input-group">
              <input
                ref={inputRef}
                type="text"
                className="form-control"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
              <Button
                variant="primary"
                className="chat-send-btn"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                aria-label="Send message"
              >
                <i className="chat-send-icon bi bi-send-fill"></i>
              </Button>
            </div>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default ChatBox

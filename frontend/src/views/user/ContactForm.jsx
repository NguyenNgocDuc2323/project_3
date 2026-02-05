import React, { useState } from 'react';
import './ContactForm.css';
import { submitContact } from '../../common/services';

const showToast = (detail, severity = 'info', summary = null) => {
  if (typeof window.showToast !== 'function') return;
  window.showToast({
    severity,
    summary: summary ?? (severity === 'success' ? 'Success' : severity === 'error' ? 'Error' : 'Notice'),
    detail,
    life: severity === 'error' ? 4000 : 3000,
  });
};

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('Please enter your name.', 'error');
      return;
    }

    if (!formData.email.trim()) {
      showToast('Please enter your email.', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    if (!formData.subject.trim()) {
      showToast('Please enter a subject.', 'error');
      return;
    }

    if (!formData.message.trim()) {
      showToast('Please enter your message.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitContact(formData);

      if (response.success) {
        showToast(response.message || 'Message sent successfully. We will reply soon!', 'success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
      } else {
        showToast(response.message || 'Failed to send message. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      const msg = error.response?.data?.message || 'An error occurred while sending your message. Please try again.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-form-container">
      <div className="contact-form-wrapper">
        <h2 className="contact-form-title">Get In Touch</h2>
        <p className="contact-form-subtitle">
          Have a question or suggestion? We'd love to hear from you.
        </p>

        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your Name"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(123) 456-7890"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject *</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="What is your inquiry about?"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="message">Message *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Please tell us more about your inquiry..."
              rows="6"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;

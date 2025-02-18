// src/pages/ContactUsPage.tsx
import React, { useState, useContext } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';

const ContactUsPage: React.FC = () => {
  const { theme } = useContext(ThemeContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post<{ msg: string }>('http://localhost:8000/contact', {
        name,
        email,
        message,
      });
      setFeedback(response.data.msg);
      setError(null);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send message.');
      setFeedback(null);
    }
  };

  // Page styling
  const pageStyle: React.CSSProperties = {
    backgroundColor: theme.background,
    color: theme.text,
    minHeight: '100vh',
    paddingTop: '1rem',
  };

  // Card styling
  const cardStyle: React.CSSProperties = {
    backgroundColor: theme.background,
    color: theme.text,
    border: `1px solid ${theme.cardBorder}`,
  };

  // Input fields remain white with black text
  const inputStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    color: '#000000',
    border: '1px solid #ccc',
  };

  return (
    <div style={pageStyle}>
      <Container className="mt-5 py-5">
        <h2 className="mb-4">Contact Us</h2>
        {feedback && <Alert variant="success">{feedback}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Row>
          {/* Left Column: Contact Form */}
          <Col xs={12} md={6} className="mb-4">
            <Card style={cardStyle}>
              <Card.Body>
                <Card.Title className="mb-3">Send us a Message</Card.Title>
                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="contactName" className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={inputStyle}
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="contactEmail" className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Your Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={inputStyle}
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="contactMessage" className="mb-3">
                    <Form.Label>Message</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      placeholder="Your Message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      style={inputStyle}
                      required
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="w-100">
                    Send Message
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column: Office Info */}
          <Col xs={12} md={6}>
            <Card style={cardStyle}>
              <Card.Body>
                <Card.Title className="mb-3">Our Office</Card.Title>
                <p>
                  123 FinanceManager St.<br />
                  Tel Aviv, Israel<br />
                  Phone: +972-3-1234567<br />
                  Email: contact@financemanager.com
                </p>
                <hr style={{ borderColor: theme.cardBorder }} />
                <Card.Title className="mb-3">Business Hours</Card.Title>
                <p>
                  Monday - Friday: 9 AM - 5 PM<br />
                  Saturday - Sunday: Closed
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ContactUsPage;

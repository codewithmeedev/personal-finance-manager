import React, { useContext } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import MainNavbar from "../components/MainNavbar";
import { ThemeContext } from "../context/ThemeContext";

const AboutPage: React.FC = () => {
  const { theme } = useContext(ThemeContext);

  // Styles using theme values and a modern font
  const containerStyle: React.CSSProperties = {
    backgroundColor: theme.background,
    color: theme.text,
    minHeight: "100vh",
    fontFamily: "'Open Sans', sans-serif", // Ensure index.html includes the Google Fonts link for Open Sans
    paddingTop: "80px", // extra space if navbar is fixed
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: theme.background,
    color: theme.text,
    border: `1px solid ${theme.cardBorder}`,
    boxShadow:
      theme.background === "#121212"
        ? "0 0 10px rgba(255, 255, 255, 0.1)"
        : "0 0 10px rgba(0, 0, 0, 0.1)",
    marginBottom: "20px",
    padding: "20px",
  };

  return (
    <>
      <MainNavbar />
      <Container fluid style={containerStyle}>
        <Row className="justify-content-center">
          <Col xs={12} md={8}>
            <Card style={cardStyle}>
              <Card.Body>
                <Card.Title as="h2" className="mb-4">
                  About FinanceManager
                </Card.Title>
                <Card.Text>
                  Welcome to FinanceManager - your personal financial companion
                  designed to help you take control of your money.
                  FinanceManager is a modern, responsive web application that
                  lets you effortlessly track your income and expenses,
                  visualize your financial trends, and gain insights that
                  empower your budgeting decisions.
                </Card.Text>
                <Card.Title as="h3" className="mt-5 mb-3">
                  About the Developer
                </Card.Title>
                <Card.Text>
                  My name is Roee Levi, and I am a third-year Computer Science
                  student at HIT. This project was developed as part of my EASS
                  course, where I had the opportunity to apply the latest web
                  technologies to build a robust and user-friendly financial
                  management system. I love learning about new technologies and
                  always look for new challenges to grow my skills and improve
                  my work.
                </Card.Text>
                <Card.Text>
                  Connect with me on{" "}
                  <a
                    href="https://www.linkedin.com/in/roee-levi104"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </a>
                  .
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default AboutPage;

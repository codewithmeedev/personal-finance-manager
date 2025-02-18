import React from "react";
import { Container, Button } from "react-bootstrap";

const HeroSection: React.FC = () => {
  return (
    <section className="hero-section">
      <Container>
        <div className="hero-content">
          <h1>Welcome to FinanceManager</h1>
          <p>
            Manage your income, track expenses, and gain personalized insights.
          </p>
          <Button variant="success" size="lg" href="/dashboard">
            Explore Dashboard
          </Button>
        </div>
      </Container>
    </section>
  );
};

export default HeroSection;

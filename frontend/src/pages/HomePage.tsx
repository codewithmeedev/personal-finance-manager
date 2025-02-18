import React from "react";
import MainNavbar from "../components/MainNavbar";
import HeroSection from "../components/HeroSection";
import { Container } from "react-bootstrap";

const HomePage: React.FC = () => {
  return (
    <>
      <MainNavbar />
      <HeroSection />
      <div className="content-padding">
        <Container className="py-5">
          <h2>Welcome to FinanceManager</h2>
          <p>
            FinanceManager helps you track your income and expenses, set
            budgets, and receive personalized financial insights. Explore
            interactive dashboards and detailed reports to empower your
            financial future.
          </p>
          {/* You can add images or screenshots here for demonstration */}
        </Container>
      </div>
      
    </>
  );
};

export default HomePage;

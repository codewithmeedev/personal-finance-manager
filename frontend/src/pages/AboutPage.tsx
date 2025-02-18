import React from "react";
import { Container } from "react-bootstrap";
import MainNavbar from "../components/MainNavbar";

const AboutPage: React.FC = () => {
  return (
    <>
      <MainNavbar />
      <Container fluid className="mt-5 py-5 content-padding">
        <h2>About Us</h2>
        <p>
          FinanceManager is a cutting-edge platform designed to help you manage
          your finances with ease. Track your income, monitor your expenses, and
          get personalized insights from your very own personal assistant.
        </p>
      </Container>
    </>
  );
};

export default AboutPage;

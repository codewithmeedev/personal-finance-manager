// src/components/Footer.tsx
import React, { useContext } from "react";
import { Container } from "react-bootstrap";
import { ThemeContext } from "../context/ThemeContext";

const Footer: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  return (
    <footer
      style={{
        backgroundColor: theme.navBackground,
        borderTop: "1px solid #ccc",
        padding: "20px 0",
        textAlign: "center",
        color: theme.text, // set the text color based on the theme
      }}
    >
      <Container>
        <p>© {new Date().getFullYear()} FinanceManager. All rights reserved.</p>
      </Container>
    </footer>
  );
};

export default Footer;

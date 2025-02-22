// tests/Integration.test.tsx
// This integration test file uses Testing Library and Vitest to simulate user interactions
// and verify that the full application (with its providers and routing) behaves as expected.

// Import the jest-dom extensions to add custom jest matchers for the DOM.
import "@testing-library/jest-dom";

// Standard React and testing-library/Vitest imports.
import React from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// --- Mock react-chartjs-2 ---
// Instead of rendering real charts (which might trigger canvas API errors),
// we simply replace each chart component with a stubbed <canvas> that has a test ID.
vi.mock("react-chartjs-2", () => {
  return {
    Bar: () => <canvas data-testid="chart" />,
    Line: () => <canvas data-testid="chart" />,
    Doughnut: () => <canvas data-testid="chart" />,
  };
});

// --- Mock recordService ---
// We override the recordService module so that no real network calls are made.
// All methods simply return dummy data.
vi.mock("../src/services/recordService", () => {
  return {
    default: {
      getRecords: async () => ({ records: [], total: 0 }),
      getAll: async () => [],
      createRecord: async () => ({}),
      update: async () => ({}),
      deleteRecord: async () => ({ message: "deleted" }),
    },
  };
});

// --- Import Providers and the main App ---
// The App component includes its own Router, so we don’t need to add extra Router here.
import { AuthProvider } from "../src/context/AuthContext";
import { ThemeProvider } from "../src/context/ThemeContext";
import App from "../src/App";

// --- Helper: Render the full App ---
// This helper renders the App component wrapped in the required context providers (Auth and Theme).
function renderApp() {
  return render(
    <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  );
}

describe("Full Frontend Integration Tests", () => {
  // Clean up the document after each test to prevent state leakage.
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("navigates from Home to About and back", async () => {
    // Render the full app.
    renderApp();
    const user = userEvent.setup();

    // Wait until the Home page hero heading appears.
    await waitFor(() =>
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: /Welcome to FinanceManager/i,
        })
      ).toBeInTheDocument()
    );

    // Get the About link by finding all links with text "About" and filtering for the one with href="/about".
    const aboutLink = screen
      .getAllByRole("link", { name: /About/i })
      .find(
        (link) => (link as HTMLAnchorElement).getAttribute("href") === "/about"
      );
    expect(aboutLink).toBeDefined();
    await user.click(aboutLink!);

    // Wait for the About page heading (h2) to appear.
    await waitFor(() =>
      expect(
        screen.getByRole("heading", {
          level: 2,
          name: /About FinanceManager/i,
        })
      ).toBeInTheDocument()
    );

    // Now, find the Home link (href="/") and click it.
    const homeLink = screen
      .getAllByRole("link", { name: /Home/i })
      .find((link) => (link as HTMLAnchorElement).getAttribute("href") === "/");
    expect(homeLink).toBeDefined();
    await user.click(homeLink!);

    // Verify that the Home page hero heading appears again.
    await waitFor(() =>
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: /Welcome to FinanceManager/i,
        })
      ).toBeInTheDocument()
    );
  });

  it("navigates to Contact Us and submits the form", async () => {
    renderApp();
    const user = userEvent.setup();

    // Find the "Contact Us" link by filtering for href="/contact".
    const contactLink = screen
      .getAllByRole("link", { name: /Contact Us/i })
      .find(
        (link) =>
          (link as HTMLAnchorElement).getAttribute("href") === "/contact"
      );
    expect(contactLink).toBeDefined();
    await user.click(contactLink!);

    // Wait until the Contact Us page heading appears.
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { level: 2, name: /Contact Us/i })
      ).toBeInTheDocument()
    );

    // Select the form fields using their placeholder texts.
    const nameInput = screen.getByPlaceholderText("Your Name");
    const emailInput = screen.getByPlaceholderText("Your Email");
    const messageInput = screen.getByPlaceholderText("Your Message");
    // Get the "Send Message" button by its accessible role and name.
    const sendButton = screen.getByRole("button", { name: /Send Message/i });

    // Fill in the form fields.
    await user.type(nameInput, "Test User");
    await user.type(emailInput, "test@example.com");
    await user.type(messageInput, "This is a test message.");
    await user.click(sendButton);

    // Verify that after submission the Contact Us heading is still visible.
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { level: 2, name: /Contact Us/i })
      ).toBeInTheDocument()
    );
  });

  it("navigates to Dashboard and verifies charts and records", async () => {
    renderApp();
    const user = userEvent.setup();

    // Find the Dashboard link using its href attribute.
    const dashboardLink = screen
      .getAllByRole("link", { name: /Dashboard/i })
      .find(
        (link) =>
          (link as HTMLAnchorElement).getAttribute("href") === "/dashboard"
      );
    expect(dashboardLink).toBeDefined();
    await user.click(dashboardLink!);

    // Wait for the records section heading ("Your Records") to appear (assumed to be an h4).
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { level: 4, name: /Your Records/i })
      ).toBeInTheDocument()
    );

    // Verify that at least one chart is rendered (each chart is mocked to render a canvas with data-testid="chart").
    const charts = screen.getAllByTestId("chart");
    expect(charts.length).toBeGreaterThan(0);
  });
});

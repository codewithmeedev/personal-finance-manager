// tests/unit.test.tsx
// This unit test file verifies that individual components and pages render correctly in isolation.
// It uses Testing Library with Vitest and renders components with necessary Providers and routing context.

import React from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { BrowserRouter } from "react-router-dom";

// --- Polyfill for URL.createObjectURL ---
// Some components (e.g., CSV download) might call URL.createObjectURL; we define a dummy version if not present.
if (typeof URL.createObjectURL !== "function") {
  URL.createObjectURL = (() => ({})) as any;
}

// --- Mock react-chartjs-2 ---
// Instead of rendering full chart components, we render simple canvases with specific test IDs.
vi.mock("react-chartjs-2", () => ({
  Bar: () => <canvas data-testid="bar-chart" />,
  Line: () => <canvas data-testid="line-chart" />,
  Doughnut: () => <canvas data-testid="doughnut-chart" />,
}));

// --- Mock recordService ---
// We mock the recordService module so that no network requests are made.
// In this unit test file, we are only testing the rendering of components.
vi.mock("../src/services/recordService", () => ({
  getRecords: async () => ({ records: [], total: 0 }),
  getAll: async () => [],
  createRecord: async () => ({}),
  update: async () => ({}),
  deleteRecord: async () => ({ message: "deleted" }),
}));

// --- Import Providers ---
// These Providers wrap the components to supply authentication and theme information.
import { AuthProvider } from "../src/context/AuthContext";
import { ThemeProvider } from "../src/context/ThemeContext";

// --- Import Components & Pages ---
// We import various components and pages to test their isolated rendering.
import App from "../src/App";
import ChatAssistant from "../src/components/ChatAssistant";
import DownloadCSVButton from "../src/components/DownloadCSVButton";
import Footer from "../src/components/Footer";
import MainNavbar from "../src/components/MainNavbar";
import RecordTable from "../src/components/RecordTable";
import SignInModal from "../src/components/SignInModal";

import AboutPage from "../src/pages/AboutPage";
import ContactUsPage from "../src/pages/ContactUsPage";
import DashboardPage from "../src/pages/DashboardPage";
import HomePage from "../src/pages/HomePage";
import ResetPasswordPage from "../src/pages/ResetPasswordPage";
import SignUpPage from "../src/pages/SignUpPage";
import UserInfoPage from "../src/pages/UserInfoPage";

// --- Import custom Record type ---
// We alias our app's Record type to avoid conflicting with TS built-in Record.
import { Record as AppRecord } from "../src/types/record";

// --- Render Helpers ---

// This helper renders a component that needs a routing context (via BrowserRouter)
// along with Auth and Theme Providers.
function renderWithProviders(component: React.ReactElement): HTMLElement {
  const container = document.createElement("div");
  act(() => {
    createRoot(container).render(
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>{component}</ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    );
  });
  return container;
}

// This helper renders a component that already includes its own Router (like App).
function renderWithoutRouterProviders(
  component: React.ReactElement
): HTMLElement {
  const container = document.createElement("div");
  act(() => {
    createRoot(container).render(
      <AuthProvider>
        <ThemeProvider>{component}</ThemeProvider>
      </AuthProvider>
    );
  });
  return container;
}

describe("Full Frontend Unit Tests", () => {
  afterEach(() => {
    // Clean up the DOM after each test to prevent interference.
    document.body.innerHTML = "";
  });

  it("renders App component with Navbar and Footer (without extra Router)", () => {
    // Since App already contains its own Router, we render without an extra BrowserRouter.
    const container = renderWithoutRouterProviders(<App />);
    const navbar = container.querySelector("nav");
    expect(navbar).toBeDefined();
    const footer = container.querySelector("footer");
    expect(footer).toBeDefined();
  });

  it("renders HomePage correctly", () => {
    const container = renderWithProviders(<HomePage />);
    // Check that the HomePage contains the main hero heading.
    expect(container.textContent).toContain("Welcome to FinanceManager");
    const heroSection = container.querySelector(".hero-section");
    expect(heroSection).toBeDefined();
  });

  it("renders AboutPage correctly", () => {
    const container = renderWithProviders(<AboutPage />);
    expect(container.textContent).toContain("About FinanceManager");
  });

  it("renders ContactUsPage with a form", () => {
    const container = renderWithProviders(<ContactUsPage />);
    const formElement = container.querySelector("form");
    expect(formElement).toBeDefined();
    expect(container.textContent).toContain("Contact Us");
  });

  it("renders SignUpPage with a signup form", () => {
    const container = renderWithProviders(<SignUpPage />);
    const formElement = container.querySelector("form");
    expect(formElement).toBeDefined();
    expect(container.textContent).toContain("Sign Up");
  });

  it("renders ResetPasswordPage with missing token message", () => {
    const container = renderWithProviders(<ResetPasswordPage />);
    // When no token is provided, the page should inform the user that no token was found.
    expect(container.textContent).toContain("Reset token not found");
  });

  it("renders UserInfoPage correctly", () => {
    const container = renderWithProviders(<UserInfoPage />);
    expect(container.textContent).toContain("User Information");
  });

  it("renders ChatAssistant and toggles chat window", () => {
    const container = renderWithProviders(<ChatAssistant />);
    // Check for the chat toggle button.
    const toggleButton = container.querySelector(".chat-toggle-btn");
    expect(toggleButton).toBeDefined();
    // Simulate a click event to open the chat window.
    act(() => {
      toggleButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    const chatWindow = container.querySelector(".chat-window");
    expect(chatWindow).toBeDefined();
  });

  it("renders DownloadCSVButton and simulates click", () => {
    // Provide some dummy record data.
    const dummyRecords: AppRecord[] = [
      {
        id: "1",
        user_id: "u1",
        amount: 100,
        category: "food",
        description: "Lunch",
        date: "2023-08-20",
        type: "expense",
      },
      {
        id: "2",
        user_id: "u1",
        amount: 200,
        category: "salary",
        description: "Salary",
        date: "2023-08-19",
        type: "income",
      },
    ];
    const container = renderWithProviders(
      <DownloadCSVButton records={dummyRecords} />
    );
    const button = container.querySelector("button");
    expect(button).toBeDefined();
    // Simulate a click on the download button.
    act(() => {
      button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  });

  it("renders Footer with correct content", () => {
    const container = renderWithProviders(<Footer />);
    expect(container.textContent).toContain("FinanceManager");
  });

  it("renders MainNavbar with navigation links", () => {
    const container = renderWithProviders(<MainNavbar />);
    // Verify that the MainNavbar renders the brand and main navigation links.
    expect(container.textContent).toContain("FinanceManager");
    expect(container.textContent).toContain("Home");
    expect(container.textContent).toContain("About");
    expect(container.textContent).toContain("Dashboard");
    expect(container.textContent).toContain("Contact Us");
  });

  it("renders RecordTable with provided records", () => {
    const dummyRecords: AppRecord[] = [
      {
        id: "1",
        user_id: "u1",
        amount: 100,
        category: "food",
        description: "Lunch",
        date: "2023-08-20",
        type: "expense",
      },
      {
        id: "2",
        user_id: "u1",
        amount: 200,
        category: "salary",
        description: "Salary",
        date: "2023-08-19",
        type: "income",
      },
    ];
    const container = renderWithProviders(
      <RecordTable
        records={dummyRecords}
        onEdit={() => {}}
        onDelete={() => {}}
        onSortChange={() => {}}
        currentSortField="date"
        currentSortOrder={1}
      />
    );
    // Verify that the table displays as many rows as there are records.
    const rows = container.querySelectorAll("tbody tr");
    expect(rows.length).toBe(dummyRecords.length);
  });

  it("renders SignInModal and displays 'Sign In' text", () => {
    // Because Modal uses portals, we query document.body.
    renderWithProviders(<SignInModal show={true} handleClose={() => {}} />);
    const modalTitle = document.body.querySelector(".modal-title");
    expect(modalTitle).toBeDefined();
    expect(modalTitle?.textContent).toContain("Sign In");
  });

  it("renders DashboardPage with charts and record table", () => {
    const container = renderWithProviders(<DashboardPage />);
    // Verify that the DashboardPage contains a section with the records heading.
    expect(container.textContent).toContain("Your Records");
    // Verify that at least one chart is rendered (each chart is stubbed to render a canvas).
    const canvases = container.querySelectorAll("canvas");
    expect(canvases.length).toBeGreaterThan(0);
  });
});

// src/pages/DashboardPage.tsx

import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Alert,
} from "react-bootstrap";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import MainNavbar from "../components/MainNavbar";
import RecordTable from "../components/RecordTable";
import ChatAssistant from "../components/ChatAssistant";
import recordService from "../services/recordService";
import { Record, RecordCreate, RecordUpdate } from "../types/record";
import { ThemeContext } from "../context/ThemeContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/* Helper function to format a date in local "yyyy-MM-dd" format */
const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
};

/* --- Additional Helpers for Category Doughnut Charts --- */

/** Aggregates expenses and incomes by category into two Maps. */
function computeCategoryTotals(records: Record[]) {
  const expenseMap = new Map<string, number>();
  const incomeMap = new Map<string, number>();

  for (const rec of records) {
    if (rec.type === "expense") {
      expenseMap.set(
        rec.category,
        (expenseMap.get(rec.category) || 0) + rec.amount
      );
    } else if (rec.type === "income") {
      incomeMap.set(
        rec.category,
        (incomeMap.get(rec.category) || 0) + rec.amount
      );
    }
  }
  return { expenseMap, incomeMap };
}

/** Converts a Map of category->amount into a doughnut data object for Chart.js. */
function mapToDoughnutData(categoryMap: Map<string, number>) {
  const labels = Array.from(categoryMap.keys());
  const values = Array.from(categoryMap.values());

  // Basic color palette. Extend or cycle as needed if you have many categories.
  const backgroundColors = [
    "#4caf50", // green
    "#f44336", // red
    "#ff9800", // orange
    "#2196f3", // blue
    "#9c27b0", // purple
    "#ffeb3b", // yellow
    "#795548", // brown
    "#00bcd4", // cyan
    // add more if needed
  ];

  return {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: backgroundColors.slice(0, labels.length),
      },
    ],
  };
}

/* ---------------- Existing Aggregation Functions ---------------- */

const computeBalanceOverTime = (
  records: Record[],
  daysBack: number = 30
): { labels: string[]; data: number[] } => {
  const now = new Date();
  const dayMap = new Map<string, number>();
  records.forEach((record) => {
    const date = new Date(record.date);
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);
    if (diffDays >= 0 && diffDays <= daysBack) {
      const key = formatLocalDate(date);
      const delta = record.type === "income" ? record.amount : -record.amount;
      dayMap.set(key, (dayMap.get(key) || 0) + delta);
    }
  });
  const labels = Array.from(dayMap.keys()).sort();
  let runningTotal = 0;
  const data = labels.map((label) => {
    runningTotal += dayMap.get(label) || 0;
    return runningTotal;
  });
  return { labels, data };
};

const computeLast7DaysExpenses = (
  records: Record[]
): { labels: string[]; data: number[] } => {
  const now = new Date();
  const dailyExpenseMap = new Map<string, number>();
  records.forEach((record) => {
    if (record.type === "expense") {
      const recordDate = new Date(record.date);
      const diff = (now.getTime() - recordDate.getTime()) / (1000 * 3600 * 24);
      if (diff >= 0 && diff < 7) {
        const key = formatLocalDate(recordDate);
        dailyExpenseMap.set(
          key,
          (dailyExpenseMap.get(key) || 0) + record.amount
        );
      }
    }
  });
  const resultDays: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    resultDays.push(formatLocalDate(day));
  }
  const data = resultDays.map((day) => dailyExpenseMap.get(day) || 0);
  return { labels: resultDays, data };
};

const computeTotalsForMonth = (
  records: Record[],
  month: number,
  year: number
): { income: number; expense: number } => {
  let income = 0,
    expense = 0;
  records.forEach((record) => {
    const date = new Date(record.date);
    if (date.getMonth() === month && date.getFullYear() === year) {
      if (record.type === "income") income += record.amount;
      else expense += record.amount;
    }
  });
  return { income, expense };
};

/* ---------------- Main DashboardPage Component ---------------- */

const DashboardPage: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editRecord, setEditRecord] = useState<Record | null>(null);
  const [newRecordData, setNewRecordData] = useState<RecordCreate>({
    amount: 0,
    category: "",
    description: "",
    type: "expense",
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const data = await recordService.getAll();
      setRecords(data);
    } catch (error) {
      console.error("Error fetching records:", error);
      setErrorMsg("Failed to fetch records.");
    } finally {
      setLoading(false);
    }
  };

  // Additional Summaries
  const now = new Date();
  const thisMonthTotals = computeTotalsForMonth(
    records,
    now.getMonth(),
    now.getFullYear()
  );
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
  const lastMonthTotals = computeTotalsForMonth(
    records,
    lastMonthDate.getMonth(),
    lastMonthDate.getFullYear()
  );

  // Existing line & bar data
  const { labels: lineLabels, data: lineValues } = computeBalanceOverTime(
    records,
    30
  );
  const { labels: barLabels, data: barValues } =
    computeLast7DaysExpenses(records);

  // Chart Options
  const commonScales = {
    x: {
      ticks: { color: theme.text, font: { size: 12 } },
      grid: { color: theme.navBackground },
    },
    y: {
      ticks: { color: theme.text, font: { size: 12 } },
      grid: { color: theme.navBackground },
    },
  };

  const lineData = {
    labels: lineLabels,
    datasets: [
      {
        label: "Balance ($)",
        data: lineValues,
        borderColor: theme.primary,
        backgroundColor: "rgba(54, 162, 235, 0.1)",
        tension: 0.1,
        fill: true,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: { color: theme.text, font: { size: 12 } },
      },
      title: {
        display: true,
        text: "Balance Over Time (Last 30 Days)",
        color: theme.text,
        font: { size: 18 },
      },
    },
    scales: commonScales,
  };

  const barData = {
    labels: barLabels,
    datasets: [
      {
        label: "Expenses ($)",
        data: barValues,
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: { color: theme.text, font: { size: 12 } },
      },
      title: {
        display: true,
        text: "Last 7 Days (Expenses)",
        color: theme.text,
        font: { size: 18 },
      },
    },
    scales: commonScales,
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: { color: theme.text, font: { size: 12 } },
      },
      title: { display: false },
    },
  };

  const thisMonthDoughnutData = {
    labels: ["Income", "Expenses"],
    datasets: [
      {
        data: [thisMonthTotals.income, thisMonthTotals.expense],
        backgroundColor: [theme.primary, "rgba(255, 99, 132, 0.6)"],
      },
    ],
  };

  const lastMonthDoughnutData = {
    labels: ["Income", "Expenses"],
    datasets: [
      {
        data: [lastMonthTotals.income, lastMonthTotals.expense],
        backgroundColor: [theme.primary, "rgba(255, 99, 132, 0.6)"],
      },
    ],
  };

  // --- Additional: Category-based Doughnuts
  const { expenseMap, incomeMap } = computeCategoryTotals(records);
  const expenseCategoryData = mapToDoughnutData(expenseMap);
  const incomeCategoryData = mapToDoughnutData(incomeMap);

  const categoryDoughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: { color: theme.text, font: { size: 12 } },
      },
      title: { display: false },
    },
  };

  /* Handlers for Record CRUD */
  const handleAddRecord = async (newRec: RecordCreate) => {
    try {
      await recordService.createRecord(newRec);
      setShowAddModal(false);
      fetchRecords();
    } catch (error) {
      console.error("Error adding record:", error);
      setErrorMsg("Failed to add record.");
    }
  };

  const handleEdit = (rec: Record) => {
    setEditRecord(rec);
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editRecord) return;
    try {
      await recordService.update(editRecord.id, {
        amount: editRecord.amount,
        category: editRecord.category,
        description: editRecord.description,
        type: editRecord.type,
      } as RecordUpdate);
      setShowEditModal(false);
      fetchRecords();
    } catch (error) {
      console.error("Error updating record:", error);
      setErrorMsg("Failed to update record.");
    }
  };

  const handleDelete = async (rec: Record) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await recordService.deleteRecord(rec.id);
        fetchRecords();
      } catch (error) {
        console.error("Error deleting record:", error);
        setErrorMsg("Failed to delete record.");
      }
    }
  };

  /* Global page styling using theme values */
  const pageStyle = {
    backgroundColor: theme.background,
    color: theme.text,
    minHeight: "100vh",
  };

  const cardStyle = {
    backgroundColor: theme.background,
    color: theme.text,
    border: `1px solid ${theme.cardBorder}`,
  };

  return (
    <>
      <MainNavbar />
      <div style={pageStyle}>
        <Container fluid className="mt-5 content-padding">
          {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
          {/* Existing Row for line/bar charts */}
          <Row>
            <Col xs={12} md={6}>
              <Card className="mb-3" style={cardStyle}>
                <Card.Body>
                  <Line
                    key={JSON.stringify(lineData)}
                    data={lineData}
                    options={lineOptions}
                  />
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card className="mb-3" style={cardStyle}>
                <Card.Body>
                  <Bar
                    key={JSON.stringify(barData)}
                    data={barData}
                    options={barOptions}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Row for This Month / Last Month Doughnuts */}
          <Row>
            <Col xs={6} md={3}>
              <Card className="mb-3" style={cardStyle}>
                <Card.Body>
                  <Card.Title>This Month</Card.Title>
                  <Doughnut
                    key={JSON.stringify(thisMonthDoughnutData)}
                    data={thisMonthDoughnutData}
                    options={doughnutOptions}
                  />
                  {/* <div
                    className="mt-2 compact-text"
                    style={{ fontSize: "0.8rem" }}
                  >
                    <p style={{ margin: 0 }}>
                      Income: ${thisMonthTotals.income.toFixed(2)}
                    </p>
                    <p style={{ margin: 0 }}>
                      Expenses: ${thisMonthTotals.expense.toFixed(2)}
                    </p>
                  </div> */}
                </Card.Body>
              </Card>
            </Col>
            <Col xs={6} md={3}>
              <Card className="mb-3" style={cardStyle}>
                <Card.Body>
                  <Card.Title>Last Month</Card.Title>
                  <Doughnut
                    key={JSON.stringify(lastMonthDoughnutData)}
                    data={lastMonthDoughnutData}
                    options={doughnutOptions}
                  />
                  {/* <div
                    className="mt-2 compact-text"
                    style={{ fontSize: "0.8rem" }}
                  >
                    <p style={{ margin: 0 }}>
                      Income: ${lastMonthTotals.income.toFixed(2)}
                    </p>
                    <p style={{ margin: 0 }}>
                      Expenses: ${lastMonthTotals.expense.toFixed(2)}
                    </p>
                  </div> */}
                </Card.Body>
              </Card>
            </Col>
            <Col xs={6} md={3}>
              <Card className="mb-3" style={cardStyle}>
                <Card.Body>
                  <Card.Title>Expenses by Category</Card.Title>
                  <Doughnut
                    data={expenseCategoryData}
                    options={categoryDoughnutOptions}
                  />
                </Card.Body>
              </Card>
            </Col>
            <Col xs={6} md={3}>
              <Card className="mb-3" style={cardStyle}>
                <Card.Body>
                  <Card.Title>Incomes by Category</Card.Title>
                  <Doughnut
                    data={incomeCategoryData}
                    options={categoryDoughnutOptions}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Row for new category-based doughnuts
          <Row>
            <Col xs={12} md={6}>
              <Card className="mb-3" style={cardStyle}>
                <Card.Body>
                  <Card.Title>Additional Summary</Card.Title>
                  <p>Placeholder for additional metrics or budget progress.</p>
                </Card.Body>
              </Card>
            </Col>
          </Row> */}

          {/* Records Table + Add Record Button */}
          <Row className="mt-5 align-items-center">
            <Col xs={12} md={6} className="text-start">
              <h4 className="mb-0">Your Records</h4>
            </Col>
            <Col xs={12} md={6} className="text-end">
              <Button variant="success" onClick={() => setShowAddModal(true)}>
                Add Record
              </Button>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col xs={12}>
              {loading ? (
                <p>Loading records...</p>
              ) : (
                <RecordTable
                  records={records}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </Col>
          </Row>
        </Container>
      </div>

      {/* Edit Record Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
        style={{ color: theme.text }}
      >
        <Modal.Header
          closeButton
          style={{ backgroundColor: theme.navBackground }}
        >
          <Modal.Title>Edit Record</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: theme.background }}>
          {editRecord && (
            <Form>
              <Form.Group controlId="editAmount" className="mb-3">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="number"
                  value={editRecord.amount}
                  onChange={(e) =>
                    setEditRecord({
                      ...editRecord,
                      amount: parseFloat(e.target.value),
                    })
                  }
                />
              </Form.Group>
              <Form.Group controlId="editCategory" className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Control
                  type="text"
                  value={editRecord.category}
                  onChange={(e) =>
                    setEditRecord({ ...editRecord, category: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group controlId="editDescription" className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  type="text"
                  value={editRecord.description || ""}
                  onChange={(e) =>
                    setEditRecord({
                      ...editRecord,
                      description: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group controlId="editType" className="mb-3">
                <Form.Label>Type</Form.Label>
                <Form.Select
                  value={editRecord.type}
                  onChange={(e) =>
                    setEditRecord({
                      ...editRecord,
                      type: e.target.value as "income" | "expense",
                    })
                  }
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: theme.navBackground }}>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Record Modal */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        centered
        style={{ color: theme.text }}
      >
        <Modal.Header
          closeButton
          style={{ backgroundColor: theme.navBackground }}
        >
          <Modal.Title>Add Record</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: theme.background }}>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddRecord(newRecordData);
            }}
          >
            <Form.Group controlId="addAmount" className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                value={newRecordData.amount}
                onChange={(e) =>
                  setNewRecordData({
                    ...newRecordData,
                    amount: parseFloat(e.target.value),
                  })
                }
                required
              />
            </Form.Group>
            <Form.Group controlId="addCategory" className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                value={newRecordData.category}
                onChange={(e) =>
                  setNewRecordData({
                    ...newRecordData,
                    category: e.target.value,
                  })
                }
                required
              />
            </Form.Group>
            <Form.Group controlId="addDescription" className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                value={newRecordData.description}
                onChange={(e) =>
                  setNewRecordData({
                    ...newRecordData,
                    description: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group controlId="addType" className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                value={newRecordData.type}
                onChange={(e) =>
                  setNewRecordData({
                    ...newRecordData,
                    type: e.target.value as "income" | "expense",
                  })
                }
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </Form.Select>
            </Form.Group>
            <Button variant="success" type="submit" className="w-100">
              Add Record
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: theme.navBackground }}>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      <ChatAssistant />
    </>
  );
};

export default DashboardPage;

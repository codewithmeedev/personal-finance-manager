// src/components/RecordTable.tsx
import React, { useContext } from "react";
import { Table, Button } from "react-bootstrap";
import { Record } from "../types/record";
import { ThemeContext } from "../context/ThemeContext";

interface RecordTableProps {
  records: Record[];
  onEdit: (record: Record) => void;
  onDelete: (record: Record) => void;
  onSortChange: (field: string) => void;
  currentSortField: string;
  currentSortOrder: number;
}

const RecordTable: React.FC<RecordTableProps> = ({
  records,
  onEdit,
  onDelete,
  onSortChange,
  currentSortField,
  currentSortOrder,
}) => {
  const { theme } = useContext(ThemeContext);

  // Determine variant based on theme (adjust as needed)
  const tableVariant = theme.background === "#121212" ? "dark" : undefined;

  const renderSortIndicator = (field: string) => {
    if (currentSortField === field) {
      return currentSortOrder === 1 ? " ▲" : " ▼";
    }
    return "";
  };

  return (
    <Table striped bordered hover responsive variant={tableVariant}>
      <thead>
        <tr>
          <th style={{ cursor: "pointer" }} onClick={() => onSortChange("date")}>
            Date{renderSortIndicator("date")}
          </th>
          <th style={{ cursor: "pointer" }} onClick={() => onSortChange("type")}>
            Type{renderSortIndicator("type")}
          </th>
          <th style={{ cursor: "pointer" }} onClick={() => onSortChange("amount")}>
            Amount{renderSortIndicator("amount")}
          </th>
          <th style={{ cursor: "pointer" }} onClick={() => onSortChange("category")}>
            Category{renderSortIndicator("category")}
          </th>
          <th style={{ cursor: "pointer" }} onClick={() => onSortChange("description")}>
            Description{renderSortIndicator("description")}
          </th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {records.map((rec) => (
          <tr key={rec.id}>
            <td>{new Date(rec.date).toLocaleDateString()}</td>
            <td>{rec.type}</td>
            <td>{rec.amount}</td>
            <td>{rec.category}</td>
            <td>{rec.description || "-"}</td>
            <td>
              <Button variant="warning" size="sm" onClick={() => onEdit(rec)} className="me-2">
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => onDelete(rec)}>
                Delete
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default RecordTable;

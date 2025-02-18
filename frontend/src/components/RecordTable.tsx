// src/components/RecordTable.tsx
import React, { useContext } from 'react';
import { Table, Button } from 'react-bootstrap';
import { Record } from '../types/record';
import { ThemeContext } from '../context/ThemeContext';

interface RecordTableProps {
  records: Record[];
  onEdit: (record: Record) => void;
  onDelete: (record: Record) => void;
}

const RecordTable: React.FC<RecordTableProps> = ({ records, onEdit, onDelete }) => {
  const { theme } = useContext(ThemeContext);

  // Determine dark mode based on the theme background
  const isDark = theme.background === '#121212';

  return (
    <Table striped bordered hover responsive variant={isDark ? "dark" : undefined}>
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Amount</th>
          <th>Category</th>
          <th>Description</th>
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
            <td>{rec.description || '-'}</td>
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

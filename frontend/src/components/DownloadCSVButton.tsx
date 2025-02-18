// // src/components/DownloadCSVButton.tsx
// import React from 'react';
// import { Button } from 'react-bootstrap';
// import { Record } from '../types/record';

// interface DownloadCSVButtonProps {
//   records: Record[];
// }

// const generateCSV = (records: Record[]): string => {
//   const header = ['Date', 'Type', 'Amount', 'Category', 'Description'];
//   const rows = records.map((record) => {
//     const dateStr = new Date(record.date).toLocaleDateString();
//     const description = record.description ? `"${record.description.replace(/"/g, '""')}"` : '';
//     return [dateStr, record.type, record.amount.toString(), record.category, description].join(',');
//   });
//   return [header.join(','), ...rows].join('\n');
// };

// const DownloadCSVButton: React.FC<DownloadCSVButtonProps> = ({ records }) => {
//   const handleDownload = () => {
//     if (records.length === 0) return;
//     const csvContent = generateCSV(records);
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.setAttribute('download', 'records.csv');
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <Button variant="secondary" onClick={handleDownload}>
//       Download CSV
//     </Button>
//   );
// };

// export default DownloadCSVButton;

// src/components/ui/ExportButton.jsx

import React from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Download } from 'lucide-react';
import Button from './Button'; 

const ExportButton = ({ data, columns, fileName = 'data_export', ...props }) => {
  const exportToExcel = () => {
    // ... (same exportToExcel logic as before)
    const exportData = data.map(row => {
      const exportRow = {};
      columns.forEach(col => {
        const value = col.render ? col.render(row[col.key], row) : row[col.key];
        exportRow[col.header || col.key] = value;
      });
      return exportRow;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, `${fileName}.xlsx`);
  };

  return (
    <Button onClick={exportToExcel} {...props}>
      {props.children || 'Export'}
    </Button>
  );
};

export default ExportButton;
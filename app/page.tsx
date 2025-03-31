'use client';

import React, { useState } from 'react';
import jsPDF from 'jspdf';

type Expense = { name: string; amount: number };
type ResultRow = { description: string; amount: number };

const MANAGEMENT_FEE = 3000;
const SUBCONTRACTOR_PERCENT = 0.356;

const exportToPDF = async (
  invoiceNumber: string,
  dateRange: string,
  results: ResultRow[]
) => {
  const doc = new jsPDF("p", "mm", "a4");
  let y = 20;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Uttam Student Village Subcontractor Report", 10, y);
  y += 10;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  if (invoiceNumber) {
    doc.text(`Invoice Number: ${invoiceNumber}`, 10, y);
    y += 7;
  }
  if (dateRange) {
    doc.text(`Payment Range: ${dateRange}`, 10, y);
    y += 7;
  }

  y += 5;
  doc.setLineWidth(0.1);
  doc.line(10, y, 200, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.text("Description", 10, y);
  doc.text("Amount (R)", 160, y, { align: "right" });
  y += 7;

  doc.setFont("helvetica", "normal");
  results.forEach((row) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(row.description, 10, y);
    doc.text(`R${row.amount.toFixed(2)}`, 160, y, { align: "right" });
    y += 7;
  });

  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Note: The R3000 management fee has been subtracted from the profit share.", 10, y);

  doc.save("uttam-subcontractor-report.pdf");
};

export default function SubcontractorCalculator() {
  const [income, setIncome] = useState<string>("");
  const [transport, setTransport] = useState<string>("");
  const [cleaner, setCleaner] = useState<string>("");
  const [cleaningSupplies, setCleaningSupplies] = useState<string>("");

  const [customExpenses, setCustomExpenses] = useState<Expense[]>([]);
  const [newExpenseName, setNewExpenseName] = useState<string>("");
  const [newExpenseAmount, setNewExpenseAmount] = useState<string>("");

  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [results, setResults] = useState<ResultRow[] | null>(null);

  const cleanNumber = (val: string | number) =>
    String(val).replace(/^0+(?!$)/, "").trim();

  const addCustomExpense = () => {
    const name = newExpenseName.trim();
    const amount = parseFloat(cleanNumber(newExpenseAmount));
    if (!name || isNaN(amount) || amount <= 0) return;
    setCustomExpenses([...customExpenses, { name, amount }]);
    setNewExpenseName("");
    setNewExpenseAmount("");
  };

  const calculate = () => {
    const parsedIncome = parseFloat(cleanNumber(income));
    const parsedTransport = parseFloat(cleanNumber(transport));
    const parsedCleaner = parseFloat(cleanNumber(cleaner));
    const parsedSupplies = parseFloat(cleanNumber(cleaningSupplies));
    const fixedExpenses = parsedTransport + parsedCleaner + parsedSupplies;
    const customTotal = customExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalExpenses = fixedExpenses + customTotal;
    const netIncome = parsedIncome - totalExpenses;

    const subcontractorExpenseShare = totalExpenses * SUBCONTRACTOR_PERCENT;
    const subcontractorProfitShare = netIncome * SUBCONTRACTOR_PERCENT;
    const finalAmountOwed = subcontractorExpenseShare + subcontractorProfitShare - MANAGEMENT_FEE;

    const resultRows: ResultRow[] = [
      { description: "Income", amount: parsedIncome },
      { description: "Transport Cost", amount: parsedTransport },
      { description: "Cleaner Cost", amount: parsedCleaner },
      { description: "Cleaning Supplies", amount: parsedSupplies },
      ...customExpenses.map(exp => ({
        description: `${exp.name} (Custom)`,
        amount: exp.amount
      })),
      { description: "Total Expenses", amount: totalExpenses },
      { description: "Net Income After Expenses", amount: netIncome },
      { description: "Subcontractor's Expense Share", amount: subcontractorExpenseShare },
      { description: "Subcontractor's Profit Share", amount: subcontractorProfitShare },
      { description: "Management Fee", amount: -MANAGEMENT_FEE },
      { description: "Amount Owed to Subcontractor", amount: finalAmountOwed }
    ];

    setResults(resultRows);
  };

  const reset = () => {
    setIncome("");
    setTransport("");
    setCleaner("");
    setCleaningSupplies("");
    setCustomExpenses([]);
    setInvoiceNumber("");
    setStartDate("");
    setEndDate("");
    setResults(null);
    setNewExpenseName("");
    setNewExpenseAmount("");
  };

  const dateRange = startDate && endDate ? `${startDate} to ${endDate}` : "";

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", padding: "2rem" }}>
      <h1 style={{ textAlign: "center" }}>Uttam Student Village Subcontractor Calculator</h1>

      <label>
        Invoice Number
        <input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
      </label>

      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <label>
          Start Date
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          End Date
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
      </div>

      <h3>Enter Costs</h3>
      {([
        ["Income", income, setIncome],
        ["Transport Cost", transport, setTransport],
        ["Cleaner Cost", cleaner, setCleaner],
        ["Cleaning Supplies", cleaningSupplies, setCleaningSupplies]
      ] as [string, string, React.Dispatch<React.SetStateAction<string>>][])
        .map(([label, value, setter], i) => (
          <label key={i} style={{ display: "flex", flexDirection: "column", marginBottom: "1rem" }}>
            {label}
            <input
              type="number"
              value={value}
              onChange={(e) => setter(cleanNumber(e.target.value))}
              style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "5px", marginTop: "0.3rem" }}
            />
          </label>
        ))}

      <h3>Additional Expenses</h3>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input type="text" placeholder="e.g. Security" value={newExpenseName}
          onChange={(e) => setNewExpenseName(e.target.value)} />
        <input type="number" placeholder="e.g. 500" value={newExpenseAmount}
          onChange={(e) => setNewExpenseAmount(cleanNumber(e.target.value))} />
        <button onClick={addCustomExpense}>Add</button>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <button onClick={calculate}>Calculate</button>
        <button onClick={reset}>Reset</button>
      </div>

      {results && (
        <div>
          <h2>Calculation Results</h2>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount (R)</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row, i) => (
                <tr key={i}>
                  <td>{row.description}</td>
                  <td>R{row.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#555" }}>
            The R3000 management fee has already been subtracted from the subcontractor’s profit share.
          </p>
          <button onClick={() => exportToPDF(invoiceNumber, dateRange, results)} style={{ marginTop: "1rem" }}>
            Download PDF
          </button>
        </div>
      )}
    </div>
  );
}

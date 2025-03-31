'use client';

import { useState } from "react";
import jsPDF from "jspdf";

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
  doc.text("Subcontractor profit is calculated after expenses, minus the R3000 management fee.", 10, y);

  doc.save("uttam-subcontractor-report.pdf");
};

export default function SubcontractorCalculator() {
  const [income, setIncome] = useState<number | string>("");
  const [transport, setTransport] = useState<number | string>("");
  const [cleaner, setCleaner] = useState<number | string>("");
  const [cleaningSupplies, setCleaningSupplies] = useState<number | string>("");

  const [customExpenses, setCustomExpenses] = useState<Expense[]>([]);
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState<number | string>("");

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
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
    const finalAmount = subcontractorExpenseShare + subcontractorProfitShare - MANAGEMENT_FEE;

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
      { description: "Management Fee", amount: MANAGEMENT_FEE },
      { description: "Amount Owed to Subcontractor", amount: finalAmount },
      { description: "Subcontractor's Profit Share", amount: subcontractorProfitShare }
    ];

    setResults(resultRows);
  };

  const reset = () => {
    setIncome("");
    setTransport("");
    setCleaner("");
    setCleaningSupplies("");
    setCustomExpenses([]);
    setNewExpenseName("");
    setNewExpenseAmount("");
    setInvoiceNumber("");
    setStartDate("");
    setEndDate("");
    setResults(null);
  };

  const dateRange = startDate && endDate ? `${startDate} to ${endDate}` : "";

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", padding: "2rem" }}>
      <h1 style={{ textAlign: "center" }}>Uttam Student Village Subcontractor Calculator</h1>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <label style={{ flex: 1 }}>
          Start Date
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label style={{ flex: 1 }}>
          End Date
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
      </div>

      <label>
        Invoice Number
        <input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
      </label>

      <h2>Enter Costs</h2>
      {[["Income", income, setIncome],
        ["Transport Cost", transport, setTransport],
        ["Cleaner Cost", cleaner, setCleaner],
        ["Cleaning Supplies", cleaningSupplies, setCleaningSupplies]] as [string, string | number, React.Dispatch<any>][]].map(([label, value, setter], i) => (
        <label key={i}>
          {label}
          <input
            type="number"
            value={value as string}
            onChange={(e) => setter(cleanNumber(e.target.value))}
          />
        </label>
      ))}

      <h3>Additional Expenses</h3>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input type="text" placeholder="e.g. Security" value={newExpenseName}
          onChange={(e) => setNewExpenseName(e.target.value)} />
        <input type="number" placeholder="e.g. 500" value={newExpenseAmount}
          onChange={(e) => setNewExpenseAmount(cleanNumber(e.target.value))} />
        <button onClick={addCustomExpense}>Add</button>
      </div>

      <div style={{ margin: "1rem 0" }}>
        <button onClick={calculate} style={{ marginRight: "1rem" }}>Calculate</button>
        <button onClick={reset}>Reset</button>
      </div>

      {results && (
        <>
          <h2>Calculation Results</h2>
          <table>
            <thead>
              <tr><th>Description</th><th>Amount (R)</th></tr>
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
          <p>
            <strong>Subcontractor's Profit Share:</strong> This is their cut after expenses, before the R3000 fee.<br />
            <strong>Amount Owed:</strong> Expense share + profit share - R3000 management fee.
          </p>
          <button onClick={() => exportToPDF(invoiceNumber, dateRange, results)}>
            Download PDF
          </button>
        </>
      )}
    </div>
  );
}

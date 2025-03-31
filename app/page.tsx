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
  doc.text("Note: R3000 management fee is subtracted from profit share.", 10, y);

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
    const finalAmountOwed = subcontractorExpenseShare + (subcontractorProfitShare - MANAGEMENT_FEE);

    const resultRows: ResultRow[] = [
      { description: "Income", amount: parsedIncome },
      { description: "Transport Cost", amount: parsedTransport },
      { description: "Cleaner Cost", amount: parsedCleaner },
      { description: "Cleaning Supplies", amount: parsedSupplies },
      ...customExpenses.map((exp) => ({
        description: `${exp.name} (Custom)`,
        amount: exp.amount,
      })),
      { description: "Total Expenses", amount: totalExpenses },
      { description: "Net Income After Expenses", amount: netIncome },
      { description: "Subcontractor's Expense Share", amount: subcontractorExpenseShare },
      { description: "Subcontractor's Profit Share", amount: subcontractorProfitShare },
      { description: "Management Fee", amount: -MANAGEMENT_FEE },
      { description: "Amount Owed to Subcontractor", amount: finalAmountOwed },
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
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#f4f6f8", paddingBottom: "4rem" }}>
      <div style={{ maxWidth: "900px", margin: "2rem auto", padding: "1rem", backgroundColor: "#fff", borderRadius: "10px" }}>

        <h1 style={{ textAlign: "center", fontSize: "1.3rem", marginBottom: "1.5rem" }}>
          Uttam Student Village Subcontractor Calculator
        </h1>

        <label style={{ fontWeight: "bold" }}>
          Invoice Number
          <input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)}
            style={{ width: "100%", marginTop: "0.3rem", marginBottom: "1rem" }}
          />
        </label>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <label style={{ flex: 1, fontWeight: "bold" }}>
            Start Date
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>
          <label style={{ flex: 1, fontWeight: "bold" }}>
            End Date
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>
        </div>

        {/* Inputs */}
        {([
          ["Income", income, setIncome],
          ["Transport Cost", transport, setTransport],
          ["Cleaner Cost", cleaner, setCleaner],
          ["Cleaning Supplies", cleaningSupplies, setCleaningSupplies],
        ] as [string, string | number, React.Dispatch<React.SetStateAction<string | number>>][]).map(([label, value, setter], i) => (
          <label key={i} style={{ display: "flex", flexDirection: "column", fontWeight: "bold", marginBottom: "1rem" }}>
            {label}
            <input type="number" value={value as string} onChange={(e) => setter(cleanNumber(e.target.value))}
              style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "5px", marginTop: "0.3rem" }}
            />
          </label>
        ))}

        {/* Additional */}
        <h3 style={{ fontWeight: "bold", marginTop: "2rem" }}>Additional Expenses</h3>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", marginBottom: "1rem" }}>
          <input type="text" placeholder="e.g. Security" value={newExpenseName}
            onChange={(e) => setNewExpenseName(e.target.value)} style={{ flex: 2 }}
          />
          <input type="number" placeholder="e.g. 500" value={newExpenseAmount}
            onChange={(e) => setNewExpenseAmount(cleanNumber(e.target.value))} style={{ flex: 1 }}
          />
          <button onClick={addCustomExpense}>Add</button>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
          <button onClick={calculate}>Calculate</button>
          <button onClick={reset}>Reset</button>
        </div>

        {/* Results */}
        {results && (
          <>
            <div id="results-table" style={{ marginTop: "2rem" }}>
              <h2>Calculation Results</h2>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#0e4d92", color: "white" }}>
                    <th style={{ textAlign: "left", padding: "10px" }}>Description</th>
                    <th style={{ textAlign: "left", padding: "10px" }}>Amount (R)</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, index) => (
                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff" }}>
                      <td style={{ padding: "10px" }}>{row.description}</td>
                      <td style={{ padding: "10px" }}>R{row.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ fontSize: "0.9rem", color: "#555", marginTop: "1rem" }}>
                The R3000 management fee has already been subtracted from the subcontractor’s profit share.
              </p>
            </div>

            <button onClick={() => exportToPDF(invoiceNumber, dateRange, results)} style={{
              marginTop: "2rem", backgroundColor: "#198754", color: "#fff", padding: "10px 20px", borderRadius: "5px", border: "none"
            }}>
              Download PDF
            </button>
          </>
        )}
      </div>
    </div>
  );
}

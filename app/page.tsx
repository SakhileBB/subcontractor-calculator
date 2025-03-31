'use client';

import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type Expense = { name: string; amount: number };
type ResultRow = { description: string; amount: number };

const exportToPDF = async () => {
  const input = document.getElementById("results-table");
  if (!input) return;
  const canvas = await html2canvas(input);
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const width = pdf.internal.pageSize.getWidth();
  const height = (canvas.height * width) / canvas.width;
  pdf.addImage(imgData, "PNG", 0, 10, width, height);
  pdf.save("uttam-subcontractor-report.pdf");
};

export default function SubcontractorCalculator() {
  const [income, setIncome] = useState(0);
  const [transport, setTransport] = useState(0);
  const [cleaner, setCleaner] = useState(0);
  const [cleaningSupplies, setCleaningSupplies] = useState(0);
  const [customExpenses, setCustomExpenses] = useState<Expense[]>([]);
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState(0);
  const [results, setResults] = useState<ResultRow[] | null>(null);

  const subcontractorPercentage = 35.55555555555556 / 100;

  const addCustomExpense = () => {
    if (!newExpenseName || newExpenseAmount <= 0) return;
    setCustomExpenses([...customExpenses, { name: newExpenseName, amount: newExpenseAmount }]);
    setNewExpenseName("");
    setNewExpenseAmount(0);
  };

  const calculate = () => {
    const fixedExpenses = transport + cleaner + cleaningSupplies;
    const customTotal = customExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalExpenses = fixedExpenses + customTotal;

    const subcontractorExpenseShare = totalExpenses * subcontractorPercentage;
    const netIncome = income - totalExpenses;
    const subcontractorProfitShare = netIncome * subcontractorPercentage;
    const finalAmount = subcontractorExpenseShare + subcontractorProfitShare;

    const resultRows: ResultRow[] = [
      { description: "Income", amount: income },
      { description: "Transport Cost", amount: transport },
      { description: "Cleaner Cost", amount: cleaner },
      { description: "Cleaning Supplies", amount: cleaningSupplies },
      ...customExpenses.map(exp => ({ description: `${exp.name} (Custom)`, amount: exp.amount })),
      { description: "Total Expenses", amount: totalExpenses },
      { description: "Subcontractor's Expense Share", amount: subcontractorExpenseShare },
      { description: "Net Income After Expenses", amount: netIncome },
      { description: "Subcontractor's Profit Share", amount: subcontractorProfitShare },
      { description: "Final Amount Owed to Subcontractor", amount: finalAmount }
    ];

    setResults(resultRows);
  };

  const reset = () => {
    setIncome(0);
    setTransport(0);
    setCleaner(0);
    setCleaningSupplies(0);
    setCustomExpenses([]);
    setResults(null);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", fontFamily: "Arial" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <img src="/analwa-logo.png" alt="Analwa Group Logo" style={{ maxWidth: "150px", marginBottom: "1rem" }} />
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
          Uttam Student Village Sub contractor calculation
        </h1>
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          Income
          <input type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          Transport Cost
          <input type="number" value={transport} onChange={(e) => setTransport(Number(e.target.value))} />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          Cleaner Cost
          <input type="number" value={cleaner} onChange={(e) => setCleaner(Number(e.target.value))} />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          Cleaning Supplies
          <input type="number" value={cleaningSupplies} onChange={(e) => setCleaningSupplies(Number(e.target.value))} />
        </label>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
          <label style={{ flex: 2 }}>
            New Expense Name
            <input
              type="text"
              placeholder="e.g. Security"
              value={newExpenseName}
              onChange={(e) => setNewExpenseName(e.target.value)}
              style={{ width: "100%" }}
            />
          </label>
          <label style={{ flex: 1 }}>
            Amount
            <input
              type="number"
              placeholder="e.g. 500"
              value={newExpenseAmount}
              onChange={(e) => setNewExpenseAmount(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </label>
          <button onClick={addCustomExpense}>Add</button>
        </div>

        {customExpenses.length > 0 && (
          <div>
            <p><strong>Added Expenses:</strong></p>
            <ul>
              {customExpenses.map((exp, i) => (
                <li key={i}>{exp.name}: R{exp.amount.toFixed(2)}</li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ display: "flex", gap: "1rem" }}>
          <button onClick={calculate}>Calculate</button>
          <button onClick={reset}>Reset</button>
        </div>
      </div>

      {results && (
        <>
          <div id="results-table" style={{ marginTop: "2rem" }}>
            <table border={1} cellPadding={10} cellSpacing={0} style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount (R)</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row, index) => (
                  <tr key={index}>
                    <td>{row.description}</td>
                    <td>{row.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ fontSize: "0.9rem", marginTop: "1rem", color: "#555" }}>
              <p><strong>Subcontractor's Profit Share:</strong> This is their cut of the income <em>after</em> business expenses.</p>
              <p><strong>Final Amount Owed:</strong> This includes both their share of profit and their share of expenses.</p>
            </div>
          </div>

          <button onClick={exportToPDF} style={{ marginTop: "1rem" }}>Download PDF</button>
        </>
      )}
    </div>
  );
}

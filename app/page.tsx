'use client';

import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type Expense = { name: string; amount: number };
type ResultRow = { description: string; amount: number };

const MANAGEMENT_FEE = 3000;

const exportToPDF = async (
  invoiceNumber: string,
  dateRange: string,
  results: ResultRow[]
) => {
  const input = document.getElementById("results-table");
  if (!input || !results) return;

  const canvas = await html2canvas(input);
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const width = pdf.internal.pageSize.getWidth();
  const height = (canvas.height * width) / canvas.width;

  pdf.setFontSize(14);
  pdf.text("Uttam Student Village Sub contractor calculation", 10, 10);
  if (invoiceNumber) pdf.text(`Invoice #: ${invoiceNumber}`, 10, 18);
  if (dateRange) pdf.text(`Payment Range: ${dateRange}`, 10, 26);

  pdf.addImage(imgData, "PNG", 0, 35, width, height);

  pdf.setFontSize(12);
  pdf.text("Calculation Breakdown:", 10, height + 45);

  const breakdownStart = height + 52;
  results.forEach((row, i) => {
    pdf.text(`${row.description}: R${row.amount.toFixed(2)}`, 10, breakdownStart + i * 7);
  });

  pdf.save("uttam-subcontractor-report.pdf");
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

  const subcontractorPercentage = 35.55555555555556 / 100;

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

    const subcontractorExpenseShare = totalExpenses * subcontractorPercentage;
    const netIncome = parsedIncome - totalExpenses;

    const subcontractorProfitShare = netIncome * subcontractorPercentage;
    const finalAmount = subcontractorExpenseShare + (subcontractorProfitShare - MANAGEMENT_FEE);

    const resultRows: ResultRow[] = [
      { description: "Income", amount: parsedIncome },
      { description: "Transport Cost", amount: parsedTransport },
      { description: "Cleaner Cost", amount: parsedCleaner },
      { description: "Cleaning Supplies", amount: parsedSupplies },
      ...customExpenses.map(exp => ({ description: `${exp.name} (Custom)`, amount: exp.amount })),
      { description: "Total Expenses", amount: totalExpenses },
      { description: "Subcontractor's Expense Share", amount: subcontractorExpenseShare },
      { description: "Management Fee", amount: -MANAGEMENT_FEE },
      { description: "Amount Owed to Subcontractor", amount: finalAmount },
      { description: "Subcontractor's Profit Share (before fee)", amount: subcontractorProfitShare }
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
    setNewExpenseAmount("");
    setNewExpenseName("");
  };

  const dateRange = startDate && endDate ? `${startDate} to ${endDate}` : "";

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", fontFamily: "Arial" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <img src="/analwa-logo.png" alt="Analwa Group Logo" style={{ maxWidth: "150px", marginBottom: "1rem" }} />
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
          Uttam Student Village Sub contractor calculation
        </h1>
      </div>

      <label style={{ display: "block", marginBottom: "0.5rem" }}>
        Invoice Number
        <input
          type="text"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          placeholder="e.g. INV-2024-001"
          style={{ width: "100%", marginBottom: "1rem" }}
        />
      </label>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <label style={{ flex: 1 }}>
          Start Date
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: "100%" }} />
        </label>
        <label style={{ flex: 1 }}>
          End Date
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ width: "100%" }} />
        </label>
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        {[
          { label: "Income", value: income, setter: setIncome },
          { label: "Transport Cost", value: transport, setter: setTransport },
          { label: "Cleaner Cost", value: cleaner, setter: setCleaner },
          { label: "Cleaning Supplies", value: cleaningSupplies, setter: setCleaningSupplies }
        ].map((field, idx) => (
          <label key={idx} style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            {field.label}
            <input
              type="number"
              value={field.value}
              onChange={(e) => field.setter(cleanNumber(e.target.value))}
            />
          </label>
        ))}

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
              onChange={(e) => setNewExpenseAmount(cleanNumber(e.target.value))}
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
              <p><strong>Subcontractor's Profit Share:</strong> This is their cut of the income <em>after</em> business expenses and before management fee.</p>
              <p><strong>Amount Owed:</strong> Profit share minus R3000 fee, plus expense share.</p>
            </div>
          </div>

          <button
            onClick={() => exportToPDF(invoiceNumber, dateRange, results)}
            style={{ marginTop: "1rem" }}
          >
            Download PDF
          </button>
        </>
      )}
    </div>
  );
}

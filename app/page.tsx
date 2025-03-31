'use client';

import { useState } from "react";

export default function SubcontractorCalculator() {
  const [income, setIncome] = useState(0);
  const [transport, setTransport] = useState(0);
  const [cleaner, setCleaner] = useState(0);
  const [cleaningSupplies, setCleaningSupplies] = useState(0);
  const [results, setResults] = useState(null);

  const subcontractorPercentage = 35.55555555555556 / 100;

  const calculate = () => {
    const totalExpenses = transport + cleaner + cleaningSupplies;
    const subcontractorExpenseShare = totalExpenses * subcontractorPercentage;
    const netIncome = income - totalExpenses;
    const subcontractorProfitShare = netIncome * subcontractorPercentage;
    const finalAmount = subcontractorExpenseShare + subcontractorProfitShare;

    setResults([
      { description: "Income", amount: income },
      { description: "Transport Cost", amount: transport },
      { description: "Cleaner Cost", amount: cleaner },
      { description: "Cleaning Supplies", amount: cleaningSupplies },
      { description: "Total Expenses", amount: totalExpenses },
      { description: "Subcontractor's Expense Share", amount: subcontractorExpenseShare },
      { description: "Net Income After Expenses", amount: netIncome },
      { description: "Subcontractor's Profit Share", amount: subcontractorProfitShare },
      { description: "Final Amount Owed to Subcontractor", amount: finalAmount }
    ]);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto", fontFamily: "Arial" }}>
      <h1>🧮 Subcontractor Calculator</h1>
      <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
        <input type="number" placeholder="Income" onChange={(e) => setIncome(Number(e.target.value))} />
        <input type="number" placeholder="Transport Cost" onChange={(e) => setTransport(Number(e.target.value))} />
        <input type="number" placeholder="Cleaner Cost" onChange={(e) => setCleaner(Number(e.target.value))} />
        <input type="number" placeholder="Cleaning Supplies" onChange={(e) => setCleaningSupplies(Number(e.target.value))} />
        <button onClick={calculate}>Calculate</button>
      </div>

      {results && (
        <div style={{ marginTop: "2rem" }}>
          <table border={1} cellPadding={10} cellSpacing={0}>
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
      )}
    </div>
  );
}

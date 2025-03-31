
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
  doc.text("Note: Subcontractor's Profit Share is before deducting the R3000 management fee.", 10, y);

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

    const totalCustomExpenses = customExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalExpenses = parsedTransport + parsedCleaner + parsedSupplies + totalCustomExpenses;

    const subcontractorExpenseShare = totalExpenses * subcontractorPercentage;
    const netIncome = parsedIncome - totalExpenses;
    const subcontractorProfitShareRaw = netIncome * subcontractorPercentage;
    const subcontractorProfitShare = subcontractorProfitShareRaw;
    const finalAmount = subcontractorExpenseShare + subcontractorProfitShareRaw - MANAGEMENT_FEE;

    const resultRows: ResultRow[] = [
      { description: "Income", amount: parsedIncome },
      { description: "Transport Cost", amount: parsedTransport },
      { description: "Cleaner Cost", amount: parsedCleaner },
      { description: "Cleaning Supplies", amount: parsedSupplies },
      ...customExpenses.map(exp => ({ description: `${exp.name} (Custom)`, amount: exp.amount })),
      { description: "Total Expenses", amount: totalExpenses },
      { description: "Subcontractor's Expense Share", amount: subcontractorExpenseShare },
      { description: "Subcontractor's Profit Share", amount: subcontractorProfitShare },
      { description: "Management Fee", amount: -MANAGEMENT_FEE },
      { description: "Amount Owed to Subcontractor", amount: finalAmount }
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
  
  return <div>/* UI structure here like before */</div>;
}

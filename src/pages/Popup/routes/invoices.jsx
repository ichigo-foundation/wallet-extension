import React from 'react';
import { Link } from "react-router-dom";


export default function Invoices() {
  return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Invoices</h2>
      <Link to="/"> home </Link>
    </main>
  );
}
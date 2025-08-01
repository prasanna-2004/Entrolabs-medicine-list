import React, { useState } from "react";
import axios from "axios";
import { Table, Form, Button } from "react-bootstrap";

const MedicineTable = ({ onAddClick }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [medicines, setMedicines] = useState([]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      const response = await axios.get(
        `https://codes.maa.care/pharmapold/search.php?q=${searchTerm}&max_results=8&filter=`
      );

      const data = response.data;

      // ✅ Extract from data.sku (not data directly)
      const resultArray = Array.isArray(data.sku) ? data.sku : [];

      setMedicines(resultArray);
    } catch (err) {
      console.error("API Error:", err);
      setMedicines([]); // fallback to empty array
    }
  };

  return (
    <div className="p-3">
      <Form className="d-flex gap-2 mb-3">
        <Form.Control
          type="text"
          placeholder="Search medicine..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button onClick={handleSearch}>Search</Button>
        <Button variant="success" onClick={onAddClick}>
          + Add New
        </Button>
      </Form>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Manufacturer</th>
            <th>Label</th>
            <th>Price</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {medicines.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center">No data</td>
            </tr>
          ) : (
            medicines.map((med, idx) => (
              <tr key={idx}>
                <td>{med.name || "N/A"}</td>
                <td>{med.manufacturer || "N/A"}</td>
                <td>{med.label || "N/A"}</td>
                <td>{med.price || "N/A"}</td>
                <td>{med.quantity || "N/A"}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default MedicineTable;

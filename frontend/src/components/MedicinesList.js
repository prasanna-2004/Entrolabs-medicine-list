import React, { useState, useEffect } from "react";
import axios from "axios";

const MedicinesTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper: merge two arrays of medicine objects without duplicates
  const mergeMedicines = (arr1, arr2) => {
    const keyFn = (m) => (m.id ? m.id : `${m.name}-${m.manufacturer}`); // Key to identify unique item
    const map = new Map();

    arr1.forEach((m) => map.set(keyFn(m), m));
    arr2.forEach((m) => {
      const key = keyFn(m);
      if (!map.has(key)) {
        map.set(key, m);
      }
    });

    return Array.from(map.values());
  };

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 3) {
      setMedicines([]);
      return;
    }

    const fetchMedicines = async () => {
      setLoading(true);
      try {
        // Fetch from your own backend API
        const backendRes = await axios.get(`http://localhost:5000/medicine/list`);
        let backendMedicines = backendRes.data || [];

        // Optionally you can filter backend medicines by search term on client-side (replace with your search API logic if available)
        backendMedicines = backendMedicines.filter((m) =>
          m.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Fetch from external API
        const externalRes = await axios.get(
          `https://codes.maa.care/pharmapold/search.php?q=${encodeURIComponent(searchTerm)}&max_results=8&filter=`
        );
        const externalMedicines = externalRes.data.sku || [];

        // Merge without duplicates
        const merged = mergeMedicines(backendMedicines, externalMedicines);

        setMedicines(merged);
      } catch (error) {
        console.error("Error fetching medicines:", error);
        setMedicines([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, [searchTerm]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search medicines..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading && <div>Loading...</div>}

      {!loading && medicines.length === 0 && searchTerm.length >= 3 && <div>No medicines found.</div>}

      {medicines.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Manufacturer</th>
              <th>Price</th>
              <th>Label</th>
              <th>Quantity</th>
              {/* Add more columns as needed */}
            </tr>
          </thead>
          <tbody>
            {medicines.map((med, index) => (
              <tr key={med.id || index}>
                <td>{med.name}</td>
                <td>{med.manufacturer}</td>
                <td>{med.price}</td>
                <td>{med.label}</td>
                <td>{med.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

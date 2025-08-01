// src/components/MedicalDashboard.js
import React, { useState, useEffect, useCallback } from "react";
import MedicineTable from "./MedicineTable"; // Assuming this component exists
import AddMedicineModal from "./AddMedicineModal"; // Assuming this component exists
import axios from "axios";
import { useNavigate } from 'react-router-dom';

function MedicalDashboard() {
  const [showModal, setShowModal] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Helper to merge two arrays without duplicates (by id or name+manufacturer)
  const mergeMedicines = (arr1, arr2) => {
    const keyFn = (m) => (m.id ? m.id : `${m.name.toLowerCase()}-${m.manufacturer.toLowerCase()}`);
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

  // Memoized fetchMedicines to avoid unnecessary re-creations
  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    try {
      if (!searchTerm || searchTerm.length < 3) {
        // If search term is empty or short, just fetch all backend medicines
        const response = await axios.get("http://localhost:5000/medicine/list");
        setMedicines(response.data || []);
      } else {
        // Fetch backend medicines
        const backendRes = await axios.get("http://localhost:5000/medicine/list");
        let backendMedicines = backendRes.data || [];

        // Apply your filter here (case-insensitive substring match on name)
        backendMedicines = backendMedicines.filter((m) =>
          m.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Fetch external API medicines
        const externalRes = await axios.get(
          `https://codes.maa.care/pharmapold/search.php?q=${encodeURIComponent(
            searchTerm
          )}&max_results=8&filter=`
        );
        const externalMedicines = externalRes.data.sku || [];

        // Merge backend and external medicines without duplicates
        const merged = mergeMedicines(backendMedicines, externalMedicines);
        setMedicines(merged);
      }
    } catch (error) {
      console.error("Error fetching medicines:", error);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  // Debounce search input to avoid excessive calls
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      fetchMedicines();
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, fetchMedicines]);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    navigate('/login');
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Medicine Inventory</h2>
        <button className="btn btn-danger" onClick={handleLogout}>
          Log Out
        </button>
      </div>
      
      {/* Search input */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search medicines (min 3 letters)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Loading indicator */}
      {loading && <p>Loading medicines...</p>}

      {/* Medicines table */}
      <MedicineTable medicines={medicines} onAddClick={() => setShowModal(true)} />

      {/* Add medicine modal */}
      <AddMedicineModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        fetchMedicines={fetchMedicines} // refresh list after adding medicine
      />
    </div>
  );
}

export default MedicalDashboard;
import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import axios from "axios";

const AddMedicineModal = ({ show, handleClose, fetchMedicines }) => {
  // Form state
  const [form, setForm] = useState({
    name: "",
    manufacturer: "",
    skuType: "allopathy",
    skuLabel: "",
    composition: "",
    quantity: "",
    price: "",
  });

  // Suggestions from autocomplete API
  const [suggestions, setSuggestions] = useState([]);

  // Alert control states
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState("success");

  // Handle input changes and autocomplete suggestions
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "name" && value.length >= 3) {
      axios
        .get(`https://dev.entrolabs.com/snomed/pharmapold/new/search.php?q=${value}`)
        .then((res) => {
          if (Array.isArray(res.data.sku)) {
            setSuggestions(res.data.sku);
          } else {
            setSuggestions([]);
          }
        })
        .catch((err) => {
          console.error("Suggestion API error", err);
          setSuggestions([]);
        });
    } else if (name === "name" && value.length < 3) {
      setSuggestions([]);
    }
  };

  // When suggestion clicked: autofill form fields
  const handleSuggestionClick = (item) => {
    const [name] = item.name.split("|");
    setForm({
      name: name.trim(),
      manufacturer: item.manufacturer || "",
      skuType: item.type || "allopathy",
      skuLabel: item.label || "",
      composition: "",
      quantity: item.quantity || "",
      price: item.mrp || item.price || "",
    });
    setSuggestions([]);
  };

  // Submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      const response = await axios.post("http://localhost:5000/medicine/add", formData);
      console.log("Medicine added successfully:", response.data);

      setAlertVariant("success");
      setAlertMessage("Medicine added successfully!");
      setShowAlert(true);

      if (typeof fetchMedicines === "function") {
        fetchMedicines();
      }

      // Do NOT auto-close modal here; wait for user click on OK
    } catch (error) {
      console.error("Error adding medicine:", error);

      setAlertVariant("danger");
      setAlertMessage("Failed to add medicine.");
      setShowAlert(true);
    }
  };

  // When user clicks OK on alert, close alert & modal
  const handleAlertOk = () => {
    setShowAlert(false);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Medicine</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {showAlert ? (
          <Alert
            variant={alertVariant}
            className="d-flex justify-content-between align-items-center"
          >
            <div>{alertMessage}</div>
            <Button
              variant={alertVariant === "success" ? "success" : "danger"}
              onClick={handleAlertOk}
            >
              OK
            </Button>
          </Alert>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-2">
              <Form.Label>Name*</Form.Label>
              <div style={{ position: "relative" }}>
                <Form.Control
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="off"
                />
                {suggestions.length > 0 && (
                  <div
                    className="border bg-light p-2"
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      zIndex: 999,
                      maxHeight: "150px",
                      overflowY: "auto",
                      width: "100%",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    {suggestions.map((s, i) => (
                      <div
                        key={i}
                        onClick={() => handleSuggestionClick(s)}
                        style={{ cursor: "pointer", padding: "5px 0" }}
                      >
                        <strong>{s.name}</strong>
                        <br />
                        <small>
                          {s.manufacturer} | {s.label} | MRP: {s.mrp}
                        </small>
                        <hr />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Manufacturer*</Form.Label>
              <Form.Control
                type="text"
                name="manufacturer"
                value={form.manufacturer}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>SKU Type*</Form.Label>
              <Form.Select name="skuType" value={form.skuType} onChange={handleChange}>
                <option value="allopathy">Allopathy</option>
                <option value="otc">OTC</option>
                <option value="fmcg">FMCG</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>SKU Label*</Form.Label>
              <Form.Control
                type="text"
                name="skuLabel"
                value={form.skuLabel}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Composition</Form.Label>
              <Form.Control
                type="text"
                name="composition"
                value={form.composition}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Quantity*</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Price (MRP)*</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
              />
            </Form.Group>

            <Button className="w-100 mt-2" type="submit">
              Submit
            </Button>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AddMedicineModal;

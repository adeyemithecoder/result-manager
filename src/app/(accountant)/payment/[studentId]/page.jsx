"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import styles from "../Payment.module.css";

const EXCLUDED_ITEMS = ["Previous term outstanding", "Discount"];

const EditStudente = ({ params }) => {
  const { studentId } = params;

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [formData, setFormData] = useState({
    items: {},
    remark: "",
  });

  useEffect(() => {
    const fetchStudentPayment = async () => {
      try {
        const { data } = await axios.get(`/api/payment/${studentId}`);
        setPaymentData(data);

        const grouped = {};
        data.items.forEach((item) => {
          grouped[item.type] = {
            id: item.id, // Add this
            amount: item.amount,
            ...(EXCLUDED_ITEMS.includes(item.type)
              ? {}
              : {
                  date: item.date ? item.date.split("T")[0] : "",
                  method: item.method || "",
                }),
          };
        });

        setFormData({
          items: grouped,
          remark: data.remark || "",
        });

        setLoading(false);
      } catch (error) {
        console.error("Error loading payment data:", error);
        setLoading(false);
      }
    };

    fetchStudentPayment();
  }, [studentId]);
  const handleItemChange = (type, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: {
        ...prev.items,
        [type]: {
          ...prev.items[type],
          [field]: field === "amount" ? parseFloat(value) : value,
        },
      },
    }));
  };

  const handleSubmit = async () => {
    const items = formData.items;
    const hasItems = items && Object.keys(items).length > 0;
    const hasRealPayments = Object.entries(items).some(
      ([type, item]) =>
        !EXCLUDED_ITEMS.includes(type) && item.amount !== undefined
    );
    const isRemarkOnly = formData.remark && !hasRealPayments;

    if (!isRemarkOnly && hasRealPayments) {
      const missingFields = Object.entries(items).some(
        ([type, item]) =>
          !EXCLUDED_ITEMS.includes(type) &&
          (item.method === "" || item.date === "")
      );
      if (missingFields) {
        alert("Please fill out date and payment method for actual payments.");
        return;
      }
    }

    const payload = {
      studentId: paymentData.student.id,
      schoolId: paymentData.student.schoolId,
      termType: studentId.split("-")[1],
      items: Object.entries(items).map(([type, item]) => ({
        id: item.id, // Add this
        type,
        amount: item.amount,
        ...(EXCLUDED_ITEMS.includes(type)
          ? {}
          : {
              date: item.date || undefined,
              method: item.method || undefined,
            }),
      })),

      remark: formData.remark || undefined,
    };

    try {
      setUpdating(true);
      const { data } = await axios.put("/api/payment", payload);

      if (data.status === 400) {
        alert(data.message);
        return;
      }

      alert("Payment updated successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to update payment.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>
        Edit Payment: {paymentData.student.name} {paymentData.student.surname}
      </h2>

      <div className={styles.form}>
        {Object.entries(formData.items).map(([type, item]) => (
          <div key={type} className={styles.itemGroup}>
            <label className={styles.label}>{type}</label>
            <input
              type="number"
              className={styles.input}
              value={item.amount}
              onChange={(e) => handleItemChange(type, "amount", e.target.value)}
            />

            {!EXCLUDED_ITEMS.includes(type) && (
              <>
                <label className={styles.label}>Date</label>
                <input
                  type="date"
                  className={styles.input}
                  value={item.date || ""}
                  onChange={(e) =>
                    handleItemChange(type, "date", e.target.value)
                  }
                />

                <label className={styles.label}>Payment Method</label>
                <select
                  className={styles.select}
                  value={item.method || ""}
                  onChange={(e) =>
                    handleItemChange(type, "method", e.target.value)
                  }
                >
                  <option value="">Select method</option>
                  <option value="CASH">Cash</option>
                  <option value="TRANSFER">Transfer</option>
                  <option value="POS">POS</option>
                  <option value="NOT_PAID">Not Paid</option>
                </select>
              </>
            )}
          </div>
        ))}

        <div className={styles.itemGroup}>
          <label className={styles.label}>Remark</label>
          <textarea
            className={styles.textarea}
            value={formData.remark}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, remark: e.target.value }))
            }
            placeholder="Optional remark"
          />
        </div>

        <button
          disabled={updating}
          className={styles.button}
          onClick={handleSubmit}
        >
          {updating ? "Updating..." : "Update Payment"}
        </button>
      </div>
    </div>
  );
};

export default EditStudente;

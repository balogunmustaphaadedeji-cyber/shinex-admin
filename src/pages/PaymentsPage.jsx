import React from "react";
import AdminTable from "../components/AdminTable";

export default function PaymentsPage() {
  return (
    <AdminTable
      resource="payments"
      columns={["paystack_reference", "amount", "status", "user", "created_at"]}
      title="Payments"
      searchable
    />
  );
}

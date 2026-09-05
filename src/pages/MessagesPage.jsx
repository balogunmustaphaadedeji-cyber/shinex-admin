import React from "react";
import AdminTable from "../components/AdminTable";

export default function MessagesPage() {
  return (
    <AdminTable
      resource="contact"
      columns={["name", "email", "subject", "status", "created_at"]}
      title="Contact messages"
      searchable
      deletable
    />
  );
}

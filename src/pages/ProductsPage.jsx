import React from "react";
import AdminTable from "../components/AdminTable";

export default function ProductsPage() {
  return (
    <AdminTable
      resource="products"
      columns={["name", "price", "user", "category", "is_sold", "created_at"]}
      title="Products"
      searchable
      deletable
    />
  );
}

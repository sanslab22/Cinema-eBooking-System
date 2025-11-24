"use client";
import withAuth from "../hoc/withAuth";

function Orders() {
  return (
    <div>
      <h1>My Orders</h1>
      <p>This page is protected.</p>
    </div>
  );
}

export default withAuth(Orders, [2]);

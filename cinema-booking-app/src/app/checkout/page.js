'use client';

import withAuth from "../hoc/withAuth";
import React from 'react';

const CheckoutPage = () => {
  // The checkout page content is now rendered for all users.
  return <div>This is the checkout page.</div>;
};

export default withAuth(CheckoutPage, [2]);
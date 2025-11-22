'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

const CheckoutPage = () => {
  const { isAuthenticated, loading } = useAuth(); // Assuming `loading` state is provided
  const router = useRouter();

  useEffect(() => {
    // Wait for the loading to finish, then check for authentication.
    if (!loading && !isAuthenticated) {
      router.push('/login'); // Assuming your login page is at '/login'
    }
  }, [isAuthenticated, loading, router]);

  // While checking for authentication or if the user is not authenticated, show a loading screen.
  if (loading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  // Render the checkout page content only for authenticated users.
  return <div>This is the checkout page.</div>;
};

export default CheckoutPage;
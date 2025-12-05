"use client";
import withAuth from "../hoc/withAuth";
import { useEffect, useState } from "react";
import { Grid, Paper, Chip, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import "./page.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
          console.error("No User ID found in LocalStorage");
          setLoading(false);
          return;
      }

      try {
        const res = await fetch(`http://localhost:3002/api/orders/user/${userId}`);
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error("API Error:", res.status, errorText);
            return;
        }

        const data = await res.json();

        if (data.success) {
          setOrders(data.data);
        }
      } catch (err) {
        console.error("Network or Parsing Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div style={{padding:'40px', textAlign:'center'}}>Loading...</div>;

  return (
    <div className="orders-page-wrapper" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>My Order History</h1>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#666' }}>
          <h3>You haven't booked any tickets yet.</h3>
          <p>User ID: {typeof window !== 'undefined' ? localStorage.getItem("userId") : ''}</p>
          <Button variant="contained" onClick={() => router.push('/')} style={{marginTop: '20px'}}>Browse Movies</Button>
        </div>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order.id}>
              <Paper elevation={3} style={{ padding: '25px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                
                {/* Movie Details */}
                <div style={{ flex: '1 1 300px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>{order.movieTitle}</h2>
                    <div style={{ color: '#555', marginBottom: '5px' }}>
                      <strong>Booking ID:</strong> {order.id}
                    </div>
                    <div style={{ color: '#555', marginBottom: '5px' }}>
                        <strong>Date:</strong> {order.showDate ? new Date(order.showDate).toLocaleDateString() : 'N/A'} at {order.showTime ? new Date(order.showTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                    </div>
                    <div style={{ color: '#555' }}>
                        <strong>Seats:</strong> <span style={{ color: '#1976d2', fontWeight: 'bold' }}>{order.seats.join(", ")}</span>
                    </div>
                </div>

                {/* Payment & Status */}
                <div style={{ flex: '1 1 200px', borderLeft: '1px solid #eee', paddingLeft: '20px' }}>
                    <div style={{ fontSize: '0.9rem', color: '#777' }}>Payment Method</div>
                    <div style={{ fontWeight: '500' }}>
                        {order.cardLast4 ? `Card ending in ${order.cardLast4}` : "Credit Card"}
                    </div>
                    <div style={{ marginTop: '10px' }}>
                        <Chip label={order.status} color="success" size="small" variant="outlined" />
                    </div>
                </div>


              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
}

export default withAuth(Orders, [2]);
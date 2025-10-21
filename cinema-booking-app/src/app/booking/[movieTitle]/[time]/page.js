import Booking from '@/app/components/Booking';

export default function BookingPage({ params }) {
  const { movieTitle, time } = params;

  return <Booking movieTitle={decodeURIComponent(movieTitle)} time={decodeURIComponent(time)} />;
}

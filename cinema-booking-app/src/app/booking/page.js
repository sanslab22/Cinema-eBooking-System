'use client'
import Booking from "../components/Booking";
import { useParams } from "next/navigation";

export default function Page({params}) {
  const { movieTitle, time } = useParams();
  console.log(params.movieTitle);

  return <Booking movieTitle={movieTitle} time={time} />;
}
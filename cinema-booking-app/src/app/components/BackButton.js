"use client";

import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import "./BackButton.css";

export default function BackButton() {
  const router = useRouter();

  return (
    <button className="back-button" onClick={() => router.back()}>
      <FaArrowLeft className="back-icon" />
    </button>
  );
}
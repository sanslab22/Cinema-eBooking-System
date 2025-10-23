"use client";

import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import "./BackButton.css";

export default function BackButton(prop) {
  const router = useRouter();

  return (
    <button className="back-button" onClick={() => (prop.route) ? router.push(prop.route) : router.back()}>
      <FaArrowLeft className="back-icon" />
    </button>
  );
}
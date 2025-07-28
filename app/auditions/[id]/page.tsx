// /app/auditions/[id]/page.tsx
"use client"; // needed if you use client‑side hooks inside
import React from "react";
import { useParams } from "next/navigation";
import { AuditionDetails } from "@/myComponents/AuditionDetails";

export default function AuditionPage() {
  const params = useParams();
  const id = params.id as string;

  // The title & date we pass here can be placeholders,
  // since the component itself fetches the real data.
  return <AuditionDetails audition={{ id, title: "", date: "" }} isFullPage />;
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CommentOnFoodModal from "../../history-reserve/components/CommentOnFoodModal";
import type { UnreviewedReservation } from "../types";

const DISMISSED_RESERVATIONS_KEY = "dismissed-reservation-feedback-ids";

function readDismissedReservationIds(): number[] {
  try {
    const value = JSON.parse(
      localStorage.getItem(DISMISSED_RESERVATIONS_KEY) ?? "[]",
    );

    return Array.isArray(value)
      ? value.filter((id): id is number => typeof id === "number")
      : [];
  } catch {
    return [];
  }
}

export default function ReservationFeedbackPrompt({
  reservations,
}: {
  reservations: UnreviewedReservation[];
}) {
  const router = useRouter();
  const [dismissedReservationIds, setDismissedReservationIds] = useState<
    number[] | null
  >(null);
  const [promptClosed, setPromptClosed] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDismissedReservationIds(readDismissedReservationIds());
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const dismissedIds = new Set(dismissedReservationIds ?? []);
  const selectedReservation =
    dismissedReservationIds === null || promptClosed
      ? null
      : (reservations.find(
          (item) => !dismissedIds.has(item.id),
        ) ?? null);

  const handleOpenChange = (open: boolean) => {
    if (open || !selectedReservation) return;

    const dismissedIds = new Set(readDismissedReservationIds());
    dismissedIds.add(selectedReservation.id);
    localStorage.setItem(
      DISMISSED_RESERVATIONS_KEY,
      JSON.stringify([...dismissedIds]),
    );
    setDismissedReservationIds([...dismissedIds]);
    setPromptClosed(true);
  };

  if (!selectedReservation) return null;

  return (
    <CommentOnFoodModal
      open
      setOpen={handleOpenChange}
      foodId={selectedReservation.food_id}
      reservationId={selectedReservation.id}
      has_feedback={selectedReservation.has_feedback}
      promptMessage={`از اینکه نظرتان را درباره «${selectedReservation.food_name}» با ما در میان بگذارید خوشحال می‌شویم.`}
      onSubmitted={() => {
        setPromptClosed(true);
      }}
      revalidateData={() => router.refresh()}
    />
  );
}

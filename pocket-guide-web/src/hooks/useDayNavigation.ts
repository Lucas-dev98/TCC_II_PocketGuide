import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useMemo } from "react";
import { DayNavigationState } from "@/types";

/**
 * Hook para gerenciar navegação entre dias de uma viagem
 * @param totalDays - Número total de dias na viagem
 */
export const useDayNavigation = (totalDays: number): DayNavigationState & {
  goToDay: (dayNumber: number) => void;
  goToNextDay: () => void;
  goToPreviousDay: () => void;
} => {
  const navigate = useNavigate();
  const { tripId, dayNumber } = useParams();
  
  const currentDayNumber = useMemo(
    () => parseInt(dayNumber || "1", 10),
    [dayNumber]
  );

  const state: DayNavigationState = useMemo(
    () => ({
      currentDayNumber,
      totalDays,
      hasPrevious: currentDayNumber > 1,
      hasNext: currentDayNumber < totalDays,
    }),
    [currentDayNumber, totalDays]
  );

  const goToDay = useCallback(
    (day: number) => {
      if (day >= 1 && day <= totalDays && tripId) {
        navigate(`/trip/${tripId}/day/${day}`, {
          replace: false,
        });
      }
    },
    [navigate, totalDays, tripId]
  );

  const goToNextDay = useCallback(() => {
    if (state.hasNext) {
      goToDay(currentDayNumber + 1);
    }
  }, [state.hasNext, currentDayNumber, goToDay]);

  const goToPreviousDay = useCallback(() => {
    if (state.hasPrevious) {
      goToDay(currentDayNumber - 1);
    }
  }, [state.hasPrevious, currentDayNumber, goToDay]);

  return {
    ...state,
    goToDay,
    goToNextDay,
    goToPreviousDay,
  };
};

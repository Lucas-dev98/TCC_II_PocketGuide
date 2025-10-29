import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components";
import { DayNavigationState } from "@/types";

interface DayNavigationProps {
  navigationState: DayNavigationState;
  onPrevious: () => void;
  onNext: () => void;
  dayDate?: string;
}

/**
 * Componente de navegação entre dias
 * Exibe o dia atual e botões para navegar
 */
export const DayNavigation: React.FC<DayNavigationProps> = ({
  navigationState,
  onPrevious,
  onNext,
  dayDate,
}) => {
  const { currentDayNumber, totalDays } = navigationState;

  return (
    <div
      className="flex items-center justify-between gap-4 bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 sticky top-0 z-10"
      aria-label="Navegação entre dias"
    >
      {/* Botão anterior */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onPrevious}
        disabled={!navigationState.hasPrevious}
        aria-label={`Dia anterior (Dia ${currentDayNumber - 1})`}
        className="rounded-full"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      {/* Indicador de dia */}
      <div className="flex flex-col items-center gap-1">
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Dia {currentDayNumber} de {totalDays}
        </div>
        {dayDate && (
          <div className="text-xs text-slate-600 dark:text-slate-400">{dayDate}</div>
        )}
      </div>

      {/* Botão próximo */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onNext}
        disabled={!navigationState.hasNext}
        aria-label={`Próximo dia (Dia ${currentDayNumber + 1})`}
        className="rounded-full"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default DayNavigation;

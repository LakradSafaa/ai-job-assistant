import { Button } from "@/components/ui/button";

interface Props {
  currentStep: number;
  totalSteps: number;
  next: () => void | Promise<void>;
  previous: () => void;
  disabled?: boolean;
}

export default function NavigationButtons({
  currentStep,
  totalSteps,
  next,
  previous,
  disabled = false,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Button
        type="button"
        variant="outline"
        disabled={currentStep === 1 || disabled}
        onClick={previous}
      >
        Précédent
      </Button>

      <Button
        type="button"
        disabled={disabled}
        className="bg-[#1F6F5F] hover:bg-[#18584C]"
        onClick={next}
      >
        {disabled
          ? "Enregistrement..."
          : currentStep === totalSteps
            ? "Terminer"
            : "Suivant"}
      </Button>
    </div>
  );
}
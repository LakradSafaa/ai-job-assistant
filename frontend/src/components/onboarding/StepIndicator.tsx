interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({
  currentStep,
  totalSteps,
}: StepIndicatorProps) {
  return (
    <div className="mb-8">

      <div className="mb-3 flex justify-between text-sm text-stone-500">
        <span>Étape {currentStep} / {totalSteps}</span>
        <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
      </div>

      <div className="h-2 w-full rounded-full bg-stone-200">

        <div
          className="h-2 rounded-full bg-[#1F6F5F] transition-all duration-300"
          style={{
            width: `${(currentStep / totalSteps) * 100}%`,
          }}
        />

      </div>

    </div>
  );
}
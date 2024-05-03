import { useState } from 'react';

type UseStepperState = {
  activeStep: number;
  setActiveStep: (step: number) => void;
  handleNext: () => void;
  handleBack: () => void;
  handleReset: () => void;
};

export function useModalStepper(): UseStepperState {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return {
    activeStep,
    setActiveStep,
    handleNext,
    handleBack,
    handleReset,
  };
}
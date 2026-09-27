import React from 'react';
import { Check, Filter, Sliders, Eye, Play, CheckCircle2 } from 'lucide-react';

interface Props {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const WizardStepsIndicator: React.FC<Props> = ({ currentStep, onStepClick }) => {
  const steps = [
    { number: 1, title: 'انتخاب محصولات', icon: Filter },
    { number: 2, title: 'تعریف تغییرات', icon: Sliders },
    { number: 3, title: 'پیش‌نمایش ایمن', icon: Eye },
    { number: 4, title: 'تأیید و اجرای دسته‌ای', icon: Play },
    { number: 5, title: 'گزارش و نتیجه', icon: CheckCircle2 }
  ];

  return (
    <div className="bg-white p-4 border border-[#c3c4c7] rounded-sm shadow-sm mb-6">
      <div className="flex items-center justify-between relative">
        {/* Background track line */}
        <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-[#dcdcde] -z-0" />
        <div
          className="absolute top-1/2 right-6 -translate-y-1/2 h-1 bg-[#2271b1] transition-all duration-300 -z-0"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          const StepIcon = step.icon;

          return (
            <button
              key={step.number}
              type="button"
              disabled={!isCompleted && !isActive}
              onClick={() => isCompleted && onStepClick && onStepClick(step.number)}
              className={`flex flex-col items-center relative z-10 transition group ${
                isCompleted ? 'cursor-pointer' : isActive ? 'cursor-default' : 'cursor-not-allowed opacity-60'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition border-2 ${
                  isCompleted
                    ? 'bg-[#2271b1] border-[#2271b1] text-white shadow-sm'
                    : isActive
                    ? 'bg-white border-[#2271b1] text-[#2271b1] shadow-md ring-4 ring-blue-100'
                    : 'bg-white border-[#c3c4c7] text-[#8c8f94]'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : <StepIcon className="w-4 h-4" />}
              </div>
              <span
                className={`text-xs mt-2 font-medium whitespace-nowrap ${
                  isActive ? 'text-[#2271b1] font-bold' : isCompleted ? 'text-[#2c3338]' : 'text-[#8c8f94]'
                }`}
              >
                مرحله {step.number}: {step.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

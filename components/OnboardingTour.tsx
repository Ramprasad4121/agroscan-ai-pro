
import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, Check } from 'lucide-react';

interface Step {
  targetId: string | null; // null for welcome modal
  titleKey: string;
  descKey: string;
}

interface OnboardingTourProps {
  t: any;
  onComplete: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ t, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isPositioning, setIsPositioning] = useState(false);

  const steps: Step[] = [
    {
      targetId: null,
      titleKey: 'tour_welcome_title',
      descKey: 'tour_welcome_desc'
    },
    {
      targetId: 'tour-diagnose',
      titleKey: 'tour_diagnose_title',
      descKey: 'tour_diagnose_desc'
    },
    {
      targetId: 'tour-recommend',
      titleKey: 'tour_rec_title',
      descKey: 'tour_rec_desc'
    },
    {
      targetId: 'tour-schemes',
      titleKey: 'tour_schemes_title',
      descKey: 'tour_schemes_desc'
    }
  ];

  useEffect(() => {
    const updatePosition = () => {
      const step = steps[currentStep];
      if (step.targetId) {
        setIsPositioning(true);
        // Small delay to allow for rendering/scrolling
        setTimeout(() => {
          const element = document.getElementById(step.targetId!);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Wait for scroll to finish roughly
            setTimeout(() => {
              setTargetRect(element.getBoundingClientRect());
              setIsPositioning(false);
            }, 500);
          } else {
            // If element not found, skip highlighting
            setTargetRect(null);
            setIsPositioning(false);
          }
        }, 100);
      } else {
        setTargetRect(null);
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const current = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  // Render Spotlight Effect
  const renderSpotlight = () => {
    if (!targetRect) return null;

    return (
      <>
        {/* Overlay with hole - utilizing CSS clip-path or large border box-shadow trick */}
        <div 
          className="fixed inset-0 z-40 transition-all duration-500 ease-in-out"
          style={{
            background: 'rgba(0, 0, 0, 0.75)',
            clipPath: `polygon(
              0% 0%, 0% 100%, 
              ${targetRect.left}px 100%, 
              ${targetRect.left}px ${targetRect.top}px, 
              ${targetRect.right}px ${targetRect.top}px, 
              ${targetRect.right}px ${targetRect.bottom}px, 
              ${targetRect.left}px ${targetRect.bottom}px, 
              ${targetRect.left}px 100%, 
              100% 100%, 100% 0%
            )`
          }}
        />
        {/* Glowing border around target */}
        <div 
          className="fixed z-50 pointer-events-none border-2 border-white rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-all duration-500 ease-in-out"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />
      </>
    );
  };

  // Render Tooltip Card
  const renderCard = () => {
    let style: React.CSSProperties = {};
    
    if (!targetRect) {
      // Center Modal
      style = {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    } else {
      // Calculate position relative to target
      // Default to bottom, flip to top if no space
      const spaceBelow = window.innerHeight - targetRect.bottom;
      const spaceRight = window.innerWidth - targetRect.right;
      
      if (window.innerWidth < 640) {
        // Mobile: Fixed bottom sheet style or just centered near bottom
        style = {
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%'
        };
      } else {
        // Desktop: Position next to element
        const top = targetRect.bottom + 20;
        const left = targetRect.left + (targetRect.width / 2) - 160; // Center align 320px card
        style = {
          top: top > window.innerHeight - 250 ? targetRect.top - 200 : top, // Flip if too low
          left: Math.max(20, Math.min(window.innerWidth - 340, left)), // Clamp to screen
        };
      }
    }

    return (
      <div 
        className="fixed z-50 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 max-w-sm w-full animate-fade-in-up transition-all duration-500"
        style={style}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-agro-100 dark:bg-agro-900 text-agro-600 text-xs font-bold">
              {currentStep + 1}/{steps.length}
            </span>
          </div>
          <button onClick={onComplete} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {t[current.titleKey]}
        </h3>
        <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
          {t[current.descKey]}
        </p>

        <div className="flex items-center justify-between">
          <button 
            onClick={onComplete}
            className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white px-2"
          >
            {t.tour_skip || 'Skip'}
          </button>
          <button 
            onClick={handleNext}
            className="px-5 py-2.5 bg-agro-600 hover:bg-agro-700 text-white rounded-xl font-bold shadow-lg shadow-agro-200 dark:shadow-none transition-all flex items-center gap-2"
          >
            {isLast ? (t.tour_finish || 'Finish') : (t.tour_next || 'Next')}
            {isLast ? <Check size={16} /> : <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Full Backdrop if no specific target (Welcome Step) */}
      {!targetRect && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in" />
      )}
      
      {/* Spotlight for target steps */}
      {renderSpotlight()}

      {/* Content Card */}
      {renderCard()}
    </>
  );
};

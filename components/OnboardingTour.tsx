
import React, { useState, useEffect } from 'react';
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

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const current = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  // Render Spotlight Effect
  const renderSpotlight = () => {
    if (!targetRect) return null;

    return (
      <>
        {/* Overlay with hole - utilizing CSS clip-path */}
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
          className="fixed z-50 pointer-events-none border-2 border-white rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.6)] animate-pulse transition-all duration-500 ease-in-out"
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
      const spaceBelow = window.innerHeight - targetRect.bottom;
      
      if (window.innerWidth < 640) {
        // Mobile: Fixed bottom sheet style
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
          top: top > window.innerHeight - 250 ? targetRect.top - 220 : top, // Flip if too low
          left: Math.max(20, Math.min(window.innerWidth - 340, left)), // Clamp to screen
        };
      }
    }

    return (
      <div 
        className="fixed z-50 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 max-w-sm w-full animate-fade-in-up transition-all duration-500"
        style={style}
      >
        <div className="flex justify-between items-start mb-2">
           <div>
             <span className="inline-block px-2 py-0.5 rounded bg-agro-100 dark:bg-agro-900/30 text-agro-700 dark:text-agro-400 text-[10px] font-bold uppercase tracking-wider mb-2 border border-agro-200 dark:border-agro-800">
                Step {currentStep + 1} of {steps.length}
             </span>
           </div>
           <button 
            onClick={onComplete} 
            className="p-1 -mr-2 -mt-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={t.tour_skip}
           >
            <X size={20} />
          </button>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {t[current.titleKey]}
        </h3>
        <p className="text-slate-600 dark:text-slate-300 mb-2 leading-relaxed text-sm">
          {t[current.descKey]}
        </p>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 px-3 py-2 transition-colors ${currentStep === 0 ? 'opacity-0 cursor-default' : ''}`}
          >
            Back
          </button>
          
          <div className="flex gap-1.5">
             {steps.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentStep ? 'bg-agro-600 scale-125' : 'bg-slate-200 dark:bg-slate-700'}`} />
             ))}
          </div>

          <button 
            onClick={handleNext}
            className="px-5 py-2.5 bg-agro-600 hover:bg-agro-700 text-white rounded-xl font-bold shadow-lg shadow-agro-200/50 dark:shadow-none transition-all flex items-center gap-2 text-sm"
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

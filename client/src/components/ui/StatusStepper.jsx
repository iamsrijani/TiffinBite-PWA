import React from 'react';
import { Check } from 'lucide-react';

export const StatusStepper = ({ steps = [], currentStep = 0, id }) => {
  return (
    <div
      id={id}
      className="status-stepper-container"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        padding: '12px 0',
        width: '100%',
      }}
    >
      {/* Connector Line */}
      <div
        className="stepper-line"
        style={{
          position: 'absolute',
          top: '30px',
          left: '5%',
          right: '5%',
          height: '2px',
          backgroundColor: 'var(--bg-glass)',
          zIndex: 1,
        }}
      />
      <div
        className="stepper-line-active"
        style={{
          position: 'absolute',
          top: '30px',
          left: '5%',
          width: `${(currentStep / Math.max(1, steps.length - 1)) * 90}%`,
          height: '2px',
          backgroundColor: 'var(--accent-primary)',
          transition: 'width 0.4s ease',
          zIndex: 1,
        }}
      />

      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isActive = idx === currentStep;
        const isFuture = idx > currentStep;

        return (
          <div
            key={idx}
            className="stepper-step"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2,
              flex: 1,
            }}
          >
            {/* Step Icon Capsule */}
            <div
              className={`stepper-node ${isActive ? 'stepper-node--active' : ''}`}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: isCompleted
                  ? 'var(--accent-primary)'
                  : isActive
                  ? 'var(--bg-secondary)'
                  : 'var(--bg-tertiary)',
                border: isActive
                  ? '2px solid var(--accent-primary)'
                  : isCompleted
                  ? 'none'
                  : '2px solid var(--border-glass)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isCompleted ? '#fff' : isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                boxShadow: isActive ? 'var(--accent-glow)' : 'none',
                transition: 'all 0.3s ease',
              }}
            >
              {isCompleted ? <Check size={16} /> : step.icon || <span>{idx + 1}</span>}
            </div>

            {/* Label */}
            <span
              className="stepper-label"
              style={{
                marginTop: '8px',
                fontSize: 'var(--text-xs)',
                fontWeight: isActive ? 600 : 500,
                color: isActive
                  ? 'var(--accent-primary)'
                  : isCompleted
                  ? 'var(--text-primary)'
                  : 'var(--text-muted)',
                textAlign: 'center',
              }}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default StatusStepper;

const STEPS = [
  { key: "welcome", label: "Welcome" },
  { key: "learning", label: "Learning" },
  { key: "challenge", label: "Challenge" },
  { key: "feedback", label: "Feedback" },
];

export default function PageProgress({ activeStep }) {
  return (
    <div className="page-progress">
      {STEPS.map((step) => (
        <span
          key={step.key}
          className={`progress-step ${activeStep === step.key ? "progress-step-active" : ""}`.trim()}
        >
          {step.label}
        </span>
      ))}
    </div>
  );
}

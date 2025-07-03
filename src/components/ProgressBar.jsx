const ProgressBar = ({ progress, status }) => {
  const getProgressSteps = () => {
    const steps = [
      { value: 10, label: 'Uploading' },
      { value: 30, label: 'Analyzing' },
      { value: 60, label: 'Translating' },
      { value: 95, label: 'Finalizing' },
    ];
    
    return steps.map(step => ({
      ...step,
      active: progress >= step.value
    }));
  };
  
  const progressSteps = getProgressSteps();
  
  return (
    <div>
      <div className="mb-2 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{status}</span>
        <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
      </div>
      
      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="mt-6 flex justify-between items-center">
        {progressSteps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className={`progress-step ${step.active ? 'active' : ''}`}>
              {step.active && <span className="text-white text-xs">✓</span>}
            </div>
            {index < progressSteps.length - 1 && (
              <div className={`progress-line ${progressSteps[index + 1].active ? 'active' : ''}`}></div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        {progressSteps.map((step, index) => (
          <div key={index} className={`w-20 text-center ${step.active ? 'text-primary font-medium' : ''}`}>
            {step.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
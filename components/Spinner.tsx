
import React from 'react';

interface SpinnerProps {
  message: string;
}

const Spinner: React.FC<SpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 animate-fade-in" aria-label={message} role="status">
      <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-green-300">
        {message}
      </p>
    </div>
  );
};

export default Spinner;

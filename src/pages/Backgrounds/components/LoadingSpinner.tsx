import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-12 xl-down:py-10 sm-down:py-8">
      <Loader2 className="w-8 h-8 xl-down:w-7 xl-down:h-7 sm-down:w-6 sm-down:h-6 text-purple-500 animate-spin" />
    </div>
  );
};

export default LoadingSpinner;

import React from 'react';
import { Stethoscope } from 'lucide-react';

const Loading = ({ message = 'Loading...', fullScreen = true }) => {
  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Animated Logo */}
      <div className="relative">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
          <Stethoscope className="w-8 h-8 text-white" />
        </div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
      
      {/* Loading Text */}
      <div className="text-center">
        <p className="text-lg font-medium text-gray-900 mb-1">{message}</p>
        <p className="text-sm text-gray-500">Please wait while we load your data</p>
      </div>
      
      {/* Loading Dots */}
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner />
    </div>
  );
};

// Smaller loading component for buttons or inline use
export const LoadingButton = ({ loading, children, ...props }) => {
  return (
    <button {...props} disabled={loading || props.disabled}>
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// Card loading skeleton
export const LoadingSkeleton = ({ lines = 3, className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`h-4 bg-gray-200 rounded ${
              index === lines - 1 ? 'w-3/4' : 'w-full'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

// Table loading skeleton
export const LoadingTable = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="animate-pulse">
      <div className="overflow-hidden border border-gray-200 rounded-lg">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex space-x-4">
            {Array.from({ length: columns }).map((_, index) => (
              <div key={index} className="h-4 bg-gray-200 rounded flex-1"></div>
            ))}
          </div>
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4 border-b border-gray-200 last:border-b-0">
            <div className="flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-200 rounded flex-1"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loading;
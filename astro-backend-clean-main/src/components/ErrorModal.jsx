import React from 'react';

export const ErrorModal = ({ isOpen, onClose, title, message, details }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-zinc-900 border-2 border-red-500/50 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-2xl font-bold text-red-400">{title || 'Cosmic Interference!'}</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors text-2xl leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-zinc-800"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-white mb-4">{message}</p>
          
          {details && (
            <div className="mt-4">
              <p className="text-sm text-zinc-400 mb-2">Technical Details:</p>
              <pre className="bg-black/50 p-4 rounded-lg text-xs text-zinc-300 overflow-x-auto max-h-64 overflow-y-auto">
                {details}
              </pre>
            </div>
          )}
        </div>

        {/* Footer with button */}
        <div className="p-6 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};


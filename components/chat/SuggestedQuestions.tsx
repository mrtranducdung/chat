import React from 'react';

interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
  isDark: boolean;
}

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  questions,
  onSelect,
  isDark
}) => {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-4 ml-8 sm:ml-10 animate-fade-in">
      {questions.map((q, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(q)}
          className={`text-xs px-3 py-1.5 rounded-full border transition-all hover:-translate-y-0.5
          ${isDark 
            ? 'bg-gray-800 border-gray-700 text-blue-300 hover:bg-gray-700' 
            : 'bg-white border-blue-100 text-blue-600 hover:bg-blue-50 hover:shadow-sm'
          }`}
        >
          {q}
        </button>
      ))}
    </div>
  );
};
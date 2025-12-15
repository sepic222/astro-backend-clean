import React, { useRef, useEffect } from 'react';
import CitySearch from './CitySearch';

const RadioInput = ({ options, value, onChange }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {options.map((option) => {
      const isSelected = value === option.value;
      return (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            px-4 py-3 rounded-lg text-left text-sm font-medium transition-all duration-200
            border-2
            ${isSelected 
              ? 'bg-orange-600/20 border-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
              : 'bg-zinc-800/50 border-zinc-700 text-gray-300 hover:bg-zinc-700 hover:border-gray-500'}
          `}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

const CheckboxInput = ({ options, value = [], onChange }) => {
  const handleChange = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((option) => {
        const isSelected = value.includes(option.value);
        return (
          <button
            key={option.value}
            onClick={() => handleChange(option.value)}
            className={`
              px-4 py-3 rounded-lg text-left text-sm font-medium transition-all duration-200
              border-2 relative overflow-hidden
              ${isSelected 
                ? 'bg-cyan-900/30 border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
                : 'bg-zinc-800/50 border-zinc-700 text-gray-300 hover:bg-zinc-700 hover:border-gray-500'}
            `}
          >
            <div className="flex justify-between items-center">
              <span>{option.label}</span>
              {isSelected && (
                <span className="text-cyan-400 text-xs bg-cyan-900/50 px-2 py-0.5 rounded-full">
                  Selected
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

const TextInput = ({ type = "text", placeholder, value = "", onChange, isHero }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={`
      w-full bg-black border-2 rounded-lg outline-none transition-all duration-300
      placeholder:text-zinc-600 text-white
      ${isHero 
        ? 'p-6 text-2xl border-orange-500/50 focus:border-orange-500 focus:shadow-[0_0_30px_rgba(249,115,22,0.2)] text-center' 
        : 'p-4 border-zinc-700 focus:border-cyan-400 focus:bg-zinc-900'}
    `}
  />
);

const TextAreaInput = ({ placeholder, value = "", onChange }) => {
  const ref = useRef(null);

  // Auto-resize when value changes
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [value]);

  const handleInput = (e) => {
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
    onChange(el.value);
  };

  return (
    <textarea
      ref={ref}
      value={value}
      onInput={handleInput}
      placeholder={placeholder}
      rows={4}
      className="
        w-full bg-black border-2 border-zinc-700 rounded-lg p-4 
        text-white placeholder:text-zinc-600 outline-none 
        focus:border-cyan-400 focus:bg-zinc-900 transition-all duration-300
        resize-vertical min-h-[120px]
      "
      style={{ overflow: 'hidden' }}
    />
  );
};

const HeroCard = ({ question, value, onChange }) => (
  <div className="flex flex-col items-center justify-center py-12 space-y-8 animate-fade-in">
    <div className="text-center space-y-4 max-w-xl">
      <div className="inline-block p-3 rounded-full bg-orange-500/10 mb-4">
        <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-orange-200 to-orange-400 pb-2">
        {question.text}
      </h3>
      {question.helpText && (
        <p className="text-xl text-zinc-400 font-light">{question.helpText}</p>
      )}
    </div>
    <div className="w-full max-w-md">
      <TextInput 
        isHero 
        value={value} 
        onChange={onChange} 
        placeholder="Type character name..." 
      />
    </div>
  </div>
);

const HeroStart = ({ question, onNext }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-fade-in">
    <div className="w-32 h-32 md:w-48 md:h-48 mb-6 relative">
      {/* Fallback to text if image fails or is SVG */}
      <img 
        src={question.image} 
        alt="Logo" 
        className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]"
        style={{ boxSizing: 'content-box', borderRadius: '72px' }}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    </div>
    
    <div className="space-y-2">
      <h2 className="text-sm md:text-base tracking-[0.5em] text-orange-400 font-bold uppercase">
        {question.subtitle}
      </h2>
      <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-lg">
        {question.title}
      </h1>
    </div>

    <p className="text-lg md:text-xl text-zinc-400 max-w-lg font-light leading-relaxed">
      {question.text}
    </p>

    <button
      onClick={onNext}
      className="
        mt-8 px-12 py-4 bg-transparent border-2 border-orange-500 text-orange-400 
        text-xl font-bold tracking-widest uppercase rounded-none
        hover:bg-orange-500 hover:text-white transition-all duration-300
        shadow-[0_0_20px_rgba(249,115,22,0.2)] hover:shadow-[0_0_40px_rgba(249,115,22,0.6)]
      "
    >
      {question.buttonText}
    </button>
  </div>
);

export const QuestionRenderer = ({ question, value, onChange, onNext, setGlobalAnswer }) => {
  // Hide manual inputs that are handled by CitySearch
  if (question.id === 'latitude' || question.id === 'longitude' || question.id === 'country') return null;

  if (question.type === 'hero_start') {
    return <HeroStart question={question} onNext={onNext} />;
  }

  if (question.uiType === 'hero_card') {
    return <HeroCard question={question} value={value} onChange={onChange} />;
  }

  // Render CitySearch for the 'city' question
  if (question.id === 'city') {
    return (
      <CitySearch 
        onLocationSelect={({ city, country, lat, lng }) => {
          if (setGlobalAnswer) {
            setGlobalAnswer('city', city);
            setGlobalAnswer('country', country);
            setGlobalAnswer('latitude', lat);
            setGlobalAnswer('longitude', lng);
          }
        }}
      />
    );
  }

  return (
    <div className="space-y-3 animate-slide-up">
      <div className="mb-4">
        <label className="block text-lg font-semibold text-white mb-1">
          {question.text}
        </label>
        {question.helpText && (
          <p className="text-sm text-zinc-400 italic">{question.helpText}</p>
        )}
      </div>

      {question.type === 'radio' && (
        <RadioInput 
          options={question.options} 
          value={value} 
          onChange={onChange} 
        />
      )}

      {question.type === 'checkbox' && (
        <CheckboxInput 
          options={question.options} 
          value={value} 
          onChange={onChange} 
        />
      )}

      {(question.type === 'text' || question.type === 'email') && (
        <TextInput 
          type={question.type}
          placeholder={question.placeholder}
          value={value}
          onChange={onChange}
        />
      )}

       {/* New Inputs for Task 2 */}
      {question.type === 'date' && (
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-black border-2 border-zinc-700 rounded-lg p-4 text-white placeholder:text-zinc-600 outline-none focus:border-cyan-400 focus:bg-zinc-900 transition-all duration-300 [color-scheme:dark]"
        />
      )}

      {question.type === 'time' && (
        <input
          type="time"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-black border-2 border-zinc-700 rounded-lg p-4 text-white placeholder:text-zinc-600 outline-none focus:border-cyan-400 focus:bg-zinc-900 transition-all duration-300 [color-scheme:dark]"
        />
      )}

      {question.type === 'number' && (
        <input
          type="number"
          step="any"
          placeholder={question.placeholder}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-black border-2 border-zinc-700 rounded-lg p-4 text-white placeholder:text-zinc-600 outline-none focus:border-cyan-400 focus:bg-zinc-900 transition-all duration-300"
        />
      )}

      {question.type === 'textarea' && (
        <TextAreaInput 
          placeholder={question.placeholder}
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  );
};

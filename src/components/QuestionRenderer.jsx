import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import CitySearch from './CitySearch';
import { QRCodeCanvas } from 'qrcode.react';

const QRShare = ({ question, onNext }) => {
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    // Generate URL with tracking parameter
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}?source=qr_share`);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8 animate-fade-in relative z-10">
      {/* Glow effect background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-orange-500/20 blur-[100px] rounded-full -z-10 pointer-events-none" />

      <div className="text-center space-y-4 max-w-xl px-4">
        <div className="inline-block p-3 rounded-full bg-orange-500/10 mb-4 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
          <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </div>
        <h3 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-orange-200 to-orange-400 pb-2 leading-tight">
          {question.text}
        </h3>
        {question.subtitle && (
          <p className="text-lg md:text-xl text-zinc-400 font-light leading-relaxed max-w-lg mx-auto">
            {question.subtitle}
          </p>
        )}
      </div>

      {/* QR Code Card - Designed for Screenshots */}
      <div className="p-8 bg-zinc-900/80 backdrop-blur-xl border border-orange-500/30 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center gap-6 transform transition-all hover:scale-105 hover:border-orange-500/50 duration-500 group">
        <div className="bg-white p-4 rounded-2xl shadow-lg relative overflow-hidden">
          {/* Subtle scanline effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent h-full w-full animate-pulse pointer-events-none" />

          {shareUrl && (
            <QRCodeCanvas
              value={shareUrl}
              size={200}
              level={"H"}
              includeMargin={false}
              fgColor="#000000"
              bgColor="#ffffff"
              imageSettings={{
                src: "/assets/fateflix-planet.png",
                x: undefined,
                y: undefined,
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          )}
        </div>
        <div className="text-center space-y-1">
          <p className="text-orange-500 font-bold tracking-[0.2em] text-xs uppercase">Scan to Match</p>
          <p className="text-white font-black tracking-tighter text-lg">FATEFLIX</p>
        </div>
      </div>

      <button
        onClick={onNext}
        className="mt-8 text-zinc-500 hover:text-white transition-colors text-sm uppercase tracking-widest font-medium border-b border-transparent hover:border-white pb-1"
      >
        Skip for now
      </button>
    </div>
  );
};

const RadioInput = ({ options, value, onChange }) => {
  // Handle both simple string values and object values with otherText
  const selectedValue = typeof value === 'object' && value !== null ? value.selected : value;
  const otherText = typeof value === 'object' && value !== null ? value.otherText : '';

  const hasOtherOption = options.some(opt => opt.value === 'other');
  const isOtherSelected = selectedValue === 'other';

  const handleOptionChange = (optionValue) => {
    if (optionValue === 'other') {
      onChange({ selected: 'other', otherText: otherText || '' });
    } else {
      onChange(optionValue);
    }
  };

  const handleOtherTextChange = (text) => {
    onChange({ selected: 'other', otherText: text });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option) => {
          if (option.isHeader) {
            return (
              <div
                key={option.value}
                className="col-span-full mt-4 mb-1 border-b border-zinc-800 pb-2"
              >
                <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
                  {option.label}
                </span>
              </div>
            );
          }

          const isSelected = selectedValue === option.value;
          return (
            <button
              key={option.value}
              onClick={() => handleOptionChange(option.value)}
              className={`
                  px-5 py-4 rounded-xl text-left text-sm font-medium transition-all duration-300
                  border backdrop-blur-md
                  ${isSelected
                  ? 'bg-orange-500/10 border-orange-500/50 text-white shadow-[0_4px_20px_rgba(249,115,22,0.15)] ring-1 ring-orange-500/20'
                  : 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:bg-zinc-800/60 hover:border-white/10 hover:text-white'}
                `}
            >
              <div className="flex items-center justify-between">
                <span>{option.label}</span>
                {isSelected && (
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Show text input when "Other" is selected */}
      {hasOtherOption && isOtherSelected && (
        <div className="mt-4 animate-slide-up">
          <input
            type="text"
            value={otherText}
            onChange={(e) => handleOtherTextChange(e.target.value)}
            placeholder="Please specify..."
            className="w-full bg-zinc-900/40 border border-orange-500/30 rounded-xl p-4 text-white placeholder:text-zinc-600 outline-none focus:border-orange-500/50 focus:shadow-[0_0_20px_rgba(249,115,22,0.1)] transition-all duration-500 backdrop-blur-md"
            autoFocus
          />
        </div>
      )}
    </div>
  );
};

const CheckboxInput = ({ options, value = [], onChange }) => {
  // Handle both array of strings and object with selected array + otherText
  const selectedValues = Array.isArray(value) ? value : (value?.selected || []);
  const otherText = typeof value === 'object' && !Array.isArray(value) ? value.otherText : '';

  const hasOtherOption = options.some(opt => opt.value === 'other');
  const isOtherSelected = selectedValues.includes('other');

  // Group options by header
  const sections = [];
  let currentSection = { header: null, items: [] };

  options.forEach(option => {
    if (option.isHeader) {
      if (currentSection.header || currentSection.items.length > 0) {
        sections.push(currentSection);
      }
      currentSection = { header: option, items: [] };
    } else {
      currentSection.items.push(option);
    }
  });
  sections.push(currentSection);

  // State for open sections
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (headerValue) => {
    setOpenSections(prev => ({
      ...prev,
      [headerValue]: !prev[headerValue]
    }));
  };

  const handleChange = (optionValue) => {
    const newSelected = selectedValues.includes(optionValue)
      ? selectedValues.filter((v) => v !== optionValue)
      : [...selectedValues, optionValue];

    // If "other" is in the new selection, return object format
    if (newSelected.includes('other')) {
      onChange({ selected: newSelected, otherText: otherText || '' });
    } else {
      // Otherwise return simple array
      onChange(newSelected);
    }
  };

  const handleOtherTextChange = (text) => {
    onChange({ selected: selectedValues, otherText: text });
  };

  return (
    <div className="space-y-3">
      {sections.map((section, idx) => {
        // If it's a section with a header
        if (section.header) {
          const isOpen = openSections[section.header.value];
          // Check if any items in this section are selected to show a badge on closed header
          const selectedCount = section.items.filter(item => selectedValues.includes(item.value)).length;

          return (
            <div key={section.header.value} className="border border-white/5 rounded-2xl overflow-hidden mb-4 bg-zinc-900/20 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => toggleSection(section.header.value)}
                className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-zinc-200">
                    {section.header.label}
                  </span>
                  {selectedCount > 0 && !isOpen && (
                    <span className="bg-cyan-900/50 text-cyan-400 text-xs px-2 py-0.5 rounded-full">
                      {selectedCount} selected
                    </span>
                  )}
                </div>
                <svg
                  className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="p-3 grid grid-cols-1 gap-3 bg-black/20 border-t border-zinc-800 animate-slide-down">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {section.items.map(option => {
                      const isSelected = selectedValues.includes(option.value);
                      const isInlineOther = option.isInlineOther;

                      return (
                        <div key={option.value} className={`relative ${isInlineOther && isSelected ? 'col-span-full' : ''}`}>
                          <button
                            onClick={() => handleChange(option.value)}
                            className={`
                              w-full px-5 py-4 rounded-xl text-left text-sm font-medium transition-all duration-300
                              border backdrop-blur-md relative overflow-hidden
                              ${isSelected
                                ? 'bg-cyan-500/10 border-cyan-400/50 text-white shadow-[0_4px_20px_rgba(34,211,238,0.15)] ring-1 ring-cyan-500/20'
                                : 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:bg-zinc-800/60 hover:border-white/10 hover:text-white'}
                            `}
                          >
                            <div className="flex justify-between items-center w-full">
                              <div className="flex flex-col items-start text-left gap-0.5">
                                <span className="leading-snug">{option.label}</span>
                                {option.examples && (
                                  <span className="text-xs text-zinc-500 italic font-light tracking-wide opacity-90 leading-tight">
                                    {option.examples}
                                  </span>
                                )}
                              </div>
                              {isSelected && (
                                <span className="text-cyan-400 text-xs bg-cyan-900/50 px-2 py-0.5 rounded-full ml-3 shrink-0">
                                  Selected
                                </span>
                              )}
                            </div>
                          </button>

                          {/* Inline Text Input for Special "Other" Fields */}
                          {isInlineOther && isSelected && (
                            <div className="mt-3 animate-fade-in px-1">
                              <input
                                type="text"
                                placeholder={`Please specify ${section.header.label} details...`}
                                value={otherText.split(`${section.header.label}: `)[1]?.split(';')[0] || ''}
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  const prefix = `${section.header.label}: `;
                                  let currentText = otherText;
                                  const regex = new RegExp(`${prefix}[^;]+(; )?`, 'g');
                                  currentText = currentText.replace(regex, '');
                                  if (currentText.endsWith('; ')) currentText = currentText.slice(0, -2);
                                  const updatedText = currentText ? `${currentText}; ${prefix}${newVal}` : `${prefix}${newVal}`;
                                  handleOtherTextChange(updatedText);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:border-cyan-500/30 focus:ring-1 focus:ring-cyan-500/20 outline-none transition-all duration-500 backdrop-blur-md"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        }

        // If no header (loose items at start), just render them in a grid
        if (section.items.length > 0) {
          return (
            <div key={`loose-${idx}`} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              {section.items.map(option => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => handleChange(option.value)}
                    className={`
                        px-5 py-4 rounded-xl text-left text-sm font-medium transition-all duration-300
                        border backdrop-blur-md relative overflow-hidden
                        ${isSelected
                        ? 'bg-cyan-500/10 border-cyan-400/50 text-white shadow-[0_4px_20px_rgba(34,211,238,0.15)] ring-1 ring-cyan-500/20'
                        : 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:bg-zinc-800/60 hover:border-white/10 hover:text-white'}
                      `}
                  >
                    <div className="flex justify-between items-center w-full">
                      <div className="flex flex-col items-start text-left gap-0.5">
                        <span className="leading-snug">{option.label}</span>
                        {option.examples && (
                          <span className="text-xs text-zinc-500 italic font-light tracking-wide opacity-90 leading-tight">
                            {option.examples}
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <span className="text-cyan-400 text-xs bg-cyan-900/50 px-2 py-0.5 rounded-full ml-3 shrink-0">
                          Selected
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          );
        }
        return null;
      })}

      {/* Show text input when "Other" is selected */}
      {hasOtherOption && isOtherSelected && (
        <div className="mt-4 animate-slide-up">
          <input
            type="text"
            value={otherText}
            onChange={(e) => handleOtherTextChange(e.target.value)}
            placeholder="Please specify..."
            className="w-full bg-zinc-900/40 border border-cyan-400/30 rounded-xl p-4 text-white placeholder:text-zinc-600 outline-none focus:border-cyan-400/50 focus:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all duration-500 backdrop-blur-md"
            autoFocus
          />
        </div>
      )}
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
      w-full bg-zinc-900/40 border rounded-xl outline-none transition-all duration-500
      placeholder:text-zinc-600 text-white backdrop-blur-md
      ${isHero
        ? 'p-8 text-3xl border-orange-500/30 focus:border-orange-500 focus:shadow-[0_0_40px_rgba(249,115,22,0.15)] text-center font-light'
        : 'p-4 border-white/5 focus:border-cyan-400/50 focus:bg-zinc-800/40 focus:shadow-[0_0_20px_rgba(34,211,238,0.05)]'}
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
        w-full bg-zinc-900/40 border border-white/5 rounded-xl p-5 
        text-white placeholder:text-zinc-600 outline-none 
        focus:border-cyan-400/50 focus:bg-zinc-800/40 transition-all duration-500
        resize-vertical min-h-[140px] backdrop-blur-md
        focus:shadow-[0_0_20px_rgba(34,211,238,0.05)]
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
  <div className="flex flex-col items-center justify-center min-h-[90vh] text-center space-y-16 py-12 animate-fade-in max-w-4xl mx-auto overflow-hidden">
    <div className="flex flex-col items-center space-y-6">
      <div className="w-40 h-40 md:w-56 md:h-56 relative group">
        <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full scale-75 group-hover:scale-110 transition-transform duration-1000" />
        <img
          src={question.image}
          alt="Logo"
          className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-transform duration-700 hover:scale-105"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>
      <h2 className="text-[10px] md:text-xs tracking-[0.8em] text-zinc-500 font-bold uppercase transition-colors duration-500 hover:text-zinc-300">
        {question.subtitle}
      </h2>
    </div>

    <div className="space-y-12 max-w-2xl px-6 w-full">
      <p className="text-xl md:text-2xl text-zinc-200 font-extralight leading-relaxed tracking-tight selection:bg-orange-500/30">
        {question.missionText}
      </p>

      <div className="py-10 border-y border-white/[0.03] space-y-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-orange-500/60 font-black">
          SHARE YOUR TASTE TO UNLOCK:
        </p>
        <div className="space-y-4">
          {question.valueProps.map((prop, idx) => (
            <p key={idx} className="text-zinc-100 font-light text-base md:text-lg tracking-wide opacity-90 hover:opacity-100 transition-opacity">
              {prop}
            </p>
          ))}
        </div>
      </div>

      {/* Marquee Section */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-zinc-950 to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-zinc-950 to-transparent z-10" />

        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="text-zinc-500 text-sm italic font-light tracking-wide mx-8">
              {question.assuranceText}
            </span>
          ))}
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              display: inline-flex;
              animation: marquee 20s linear infinite;
            }
          `
        }} />
      </div>
    </div>

    <button
      onClick={onNext}
      className="
        group relative mt-4 px-12 py-3.5 
        overflow-hidden rounded-full
        bg-zinc-900 border border-white/10
        transition-all duration-500 hover:border-orange-500/50
        hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]
        active:scale-95
      "
    >
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      <span className="relative z-10 text-xs md:text-sm font-bold tracking-[0.2em] uppercase text-white group-hover:text-orange-400 transition-colors">
        {question.buttonText}
      </span>
    </button>
  </div>
);

const MultiEntryInput = ({ question, value = [], onChange, maxEntries = 5 }) => {
  const [showInfo, setShowInfo] = useState(false);
  const entries = Array.isArray(value) ? value : (value ? [value] : []);

  const handleEntryChange = (index, newValue) => {
    const newEntries = [...entries];
    newEntries[index] = newValue;
    onChange(newEntries.filter(e => e.trim() !== '')); // Remove empty entries
  };

  const handleAddEntry = () => {
    if (entries.length < maxEntries) {
      onChange([...entries, '']);
    }
  };

  const handleRemoveEntry = (index) => {
    const newEntries = entries.filter((_, i) => i !== index);
    onChange(newEntries);
  };

  // Always show at least one input field
  const displayEntries = entries.length > 0 ? entries : [''];

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-fade-in relative">
      <div className="text-center space-y-4 max-w-xl">
        <div className="inline-block p-3 rounded-full bg-orange-500/10 mb-4">
          <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div className="flex items-center justify-center gap-3">
          <h3 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-orange-200 to-orange-400 pb-2">
            {question.text}
          </h3>
          {(question.infoPopup || question.inspoPopup) && (
            <button
              type="button"
              onClick={() => setShowInfo(true)}
              className="text-orange-500 hover:text-orange-400 transition-colors p-1"
              aria-label="More info"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </button>
          )}
        </div>

        {question.helpText && (
          <p className="text-xl text-zinc-400 font-light whitespace-pre-line">{question.helpText}</p>
        )}
      </div>

      <div className="w-full max-w-md space-y-3">
        {displayEntries.map((entry, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              type="text"
              value={entry}
              onChange={(e) => handleEntryChange(index, e.target.value)}
              placeholder={`Character ${index + 1}...`}
              className="flex-1 bg-black border-2 border-orange-500/50 rounded-lg p-4 text-lg text-white placeholder:text-zinc-600 outline-none focus:border-orange-500 focus:shadow-[0_0_15px_rgba(249,115,22,0.2)] transition-all duration-300"
            />
            {entries.length > 1 && (
              <button
                onClick={() => handleRemoveEntry(index)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all"
                title="Remove"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}

        {entries.length < maxEntries && (
          <button
            onClick={handleAddEntry}
            className="w-full py-3 border-2 border-dashed border-orange-500/30 rounded-lg text-orange-400 hover:border-orange-500 hover:bg-orange-500/10 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Another ({entries.length}/{maxEntries})
          </button>
        )}
      </div>

      {/* Popup Overlay Logic */}
      {(showInfo && (question.infoPopup || question.inspoPopup)) && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="bg-zinc-900 border border-orange-500/30 rounded-xl p-6 shadow-2xl max-w-sm w-full relative animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-3 right-3 text-zinc-500 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <h4 className="text-orange-400 text-sm font-bold tracking-widest uppercase mb-3">
              {question.inspoPopup ? "Inspiration" : "Info"}
            </h4>

            <p className="text-zinc-200 leading-relaxed font-light whitespace-pre-line text-base">
              {(() => {
                const text = question.infoPopup || question.inspoPopup;
                return text.includes('\n') ? text : text.split(', ').join(',\n');
              })()}
            </p>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export const QuestionRenderer = ({ question, value, onChange, onNext, setGlobalAnswer }) => {
  const [showInfo, setShowInfo] = useState(false);
  // Hide manual inputs that are handled by CitySearch
  if (question.id === 'latitude' || question.id === 'longitude' || question.id === 'country') return null;

  if (question.type === 'hero_start') {
    return <HeroStart question={question} onNext={onNext} />;
  }

  if (question.uiType === 'hero_card') {
    return <HeroCard question={question} value={value} onChange={onChange} />;
  }

  if (question.type === 'qr_share') {
    return <QRShare question={question} onNext={onNext} />;
  }

  // Handle multi-entry input (for character_match)
  if (question.uiType === 'multi_entry') {
    return <MultiEntryInput question={question} value={value} onChange={onChange} maxEntries={question.maxEntries || 5} />;
  }

  // Render CitySearch for the 'city' question
  if (question.id === 'city') {
    return (
      <div className="space-y-2 animate-slide-up">
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
        {question.disclaimer && (
          <p className="text-sm text-zinc-400 italic text-center mt-12">{question.disclaimer}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-slide-up">
      <div className="mb-4 relative">
        <div className="flex items-center gap-2 mb-1">
          <label className="block text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 tracking-tight">
            {question.text}
          </label>
          {/* Logic to handle either infoPopup or inspoPopup */}
          {(question.infoPopup || question.inspoPopup) && (
            <>
              <button
                type="button"
                onClick={() => setShowInfo(true)}
                className="text-orange-500 hover:text-orange-400 transition-colors p-1"
                aria-label="More info"
              >
                {/* Use a generic Info icon for both, or could swap if inspo-only */}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </button>

              {/* Popup Overlay - Mobile Friendly */}
              {showInfo && createPortal(
                <div
                  className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                  onClick={() => setShowInfo(false)} // Click outside to close
                >
                  <div
                    className="bg-zinc-900 border border-orange-500/30 rounded-xl p-6 shadow-2xl max-w-sm w-full relative animate-scale-in"
                    onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
                  >
                    <button
                      onClick={() => setShowInfo(false)}
                      className="absolute top-3 right-3 text-zinc-500 hover:text-white transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>

                    <h4 className="text-orange-400 text-sm font-bold tracking-widest uppercase mb-3">
                      {question.inspoPopup ? "Inspiration" : "Info"}
                    </h4>

                    <p className="text-zinc-200 leading-relaxed font-light whitespace-pre-line text-base">
                      {(() => {
                        const text = question.infoPopup || question.inspoPopup;
                        return text.includes('\n') ? text : text.split(', ').join(',\n');
                      })()}
                    </p>
                  </div>
                </div>,
                document.body
              )}
            </>
          )}
        </div>
        {question.helpText && (
          <p className="text-base text-zinc-500 font-light tracking-wide">{question.helpText}</p>
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

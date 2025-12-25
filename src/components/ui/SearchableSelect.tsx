'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  emptyMessage?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  disabled = false,
  className = '',
  emptyMessage = 'No results found',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter(
      opt =>
        opt.label.toLowerCase().includes(query) ||
        opt.description?.toLowerCase().includes(query) ||
        opt.value.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  // Get selected option label
  const selectedLabel = options.find(opt => opt.value === value)?.label;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className={`searchable-select ${className}`} style={{ position: 'relative' }}>
      {/* Trigger Button */}
      <button
        type="button"
        className="form-input"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: disabled ? 'not-allowed' : 'pointer',
          textAlign: 'left',
          width: '100%',
          opacity: disabled ? 0.6 : 1,
        }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span style={{ color: selectedLabel ? 'var(--foreground)' : 'var(--muted)' }}>
          {selectedLabel || placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && !disabled && (
            <X
              size={14}
              style={{ color: 'var(--muted)', cursor: 'pointer' }}
              onClick={handleClear}
            />
          )}
          <ChevronDown
            size={16}
            style={{
              color: 'var(--muted)',
              transition: 'transform 0.2s',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
            }}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            backgroundColor: '#ffffff',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            zIndex: 9999,
            overflow: 'hidden',
          }}
        >
          {/* Search Input */}
          <div style={{ padding: 'var(--space-2)', borderBottom: '1px solid var(--border)' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--muted)',
                }}
              />
              <input
                ref={inputRef}
                type="text"
                className="form-input"
                style={{ paddingLeft: 32, height: 36 }}
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onClick={e => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Options List */}
          <div
            style={{
              maxHeight: 240,
              overflowY: 'auto',
            }}
          >
            {filteredOptions.length === 0 ? (
              <div
                style={{
                  padding: 'var(--space-4)',
                  textAlign: 'center',
                  color: 'var(--muted)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map(option => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: option.value === value ? 'var(--accent)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (option.value !== value) {
                      e.currentTarget.style.background = 'var(--accent)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (option.value !== value) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div>
                    <div style={{ fontSize: 'var(--text-sm)' }}>{option.label}</div>
                    {option.description && (
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                        {option.description}
                      </div>
                    )}
                  </div>
                  {option.value === value && (
                    <Check size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

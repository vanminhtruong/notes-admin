import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AnalogClock from './components/AnalogClock';

const LOCALE_MAP: Record<string, string> = {
  vi: 'vi-VN',
  en: 'en-US',
  ko: 'ko-KR',
};

type Timezone = 'vietnam' | 'usa' | 'korea';

interface TimezoneOption {
  value: Timezone;
  label: string;
  offset: number;
  flag: string;
}

const Clock: React.FC = () => {
  const { t, i18n } = useTranslation('clock');
  const [selectedTimezone, setSelectedTimezone] = useState<Timezone>('vietnam');
  const [currentTime, setCurrentTime] = useState(new Date());

  const currentLocale = LOCALE_MAP[i18n.language] || 'vi-VN';

  const timezones: TimezoneOption[] = [
    { value: 'vietnam', label: t('timezones.vietnam', { defaultValue: 'Việt Nam' }), offset: 7, flag: '🇻🇳' },
    { value: 'usa', label: t('timezones.usa', { defaultValue: 'Hoa Kỳ (EST)' }), offset: -5, flag: '🇺🇸' },
    { value: 'korea', label: t('timezones.korea', { defaultValue: 'Hàn Quốc' }), offset: 9, flag: '🇰🇷' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getTimeForTimezone = (timezone: Timezone): Date => {
    const tz = timezones.find(t => t.value === timezone);
    if (!tz) return currentTime;

    const utc = currentTime.getTime() + (currentTime.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * tz.offset));
  };

  const displayTime = getTimeForTimezone(selectedTimezone);
  const selectedTz = timezones.find(tz => tz.value === selectedTimezone);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 p-6 xl-down:p-5 lg-down:p-4 md-down:p-3 sm-down:p-2">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 xl-down:mb-6 sm-down:mb-4">
          <h1 className="text-4xl xl-down:text-3xl md-down:text-2xl sm-down:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('title', { defaultValue: 'Đồng Hồ Thế Giới' })}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg xl-down:text-base sm-down:text-sm">
            {t('subtitle', { defaultValue: 'Xem giờ các múi giờ khác nhau' })}
          </p>
        </div>

        {/* Timezone Selector */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl xl-down:rounded-xl shadow-xl border border-gray-200 dark:border-neutral-700 p-6 xl-down:p-5 sm-down:p-4 mb-8 xl-down:mb-6 sm-down:mb-4">
          <h2 className="text-xl xl-down:text-lg sm-down:text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 xl-down:mb-3 sm-down:mb-2">
            {t('selectTimezone', { defaultValue: 'Chọn múi giờ' })}
          </h2>
          <div className="grid grid-cols-3 md-down:grid-cols-1 gap-4 xl-down:gap-3 sm-down:gap-2">
            {timezones.map((tz) => (
              <button
                key={tz.value}
                onClick={() => setSelectedTimezone(tz.value)}
                className={`p-4 xl-down:p-3 sm-down:p-2.5 rounded-xl xl-down:rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                  selectedTimezone === tz.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                    : 'border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 hover:border-blue-300 dark:hover:border-blue-600'
                }`}
              >
                <div className="text-4xl xl-down:text-3xl sm-down:text-2xl mb-2 xl-down:mb-1">{tz.flag}</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100 text-base xl-down:text-sm sm-down:text-xs">
                  {tz.label}
                </div>
                <div className="text-sm xl-down:text-xs sm-down:text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  UTC{tz.offset >= 0 ? '+' : ''}{tz.offset}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Clock Display */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl xl-down:rounded-xl shadow-xl border border-gray-200 dark:border-neutral-700 p-8 xl-down:p-6 sm-down:p-4">
          {/* Current Location Info */}
          <div className="text-center mb-6 xl-down:mb-4 sm-down:mb-3">
            <div className="inline-flex items-center gap-3 xl-down:gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 xl-down:px-4 sm-down:px-3 py-3 xl-down:py-2 sm-down:py-1.5 rounded-full shadow-lg">
              <span className="text-3xl xl-down:text-2xl sm-down:text-xl">{selectedTz?.flag}</span>
              <span className="font-semibold text-lg xl-down:text-base sm-down:text-sm">{selectedTz?.label}</span>
            </div>
          </div>

          {/* Analog Clock */}
          <div className="flex justify-center mb-6 xl-down:mb-4 sm-down:mb-3">
            <AnalogClock time={displayTime} />
          </div>

          {/* Digital Time Display */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 xl-down:gap-2 sm-down:gap-1.5">
              <div className="text-6xl xl-down:text-5xl md-down:text-4xl sm-down:text-3xl font-bold text-gray-900 dark:text-gray-100 font-mono tracking-wider">
                {displayTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit',
                  hour12: selectedTimezone !== 'vietnam' 
                })}
              </div>
              {selectedTimezone !== 'vietnam' && (
                <div className="text-3xl xl-down:text-2xl md-down:text-xl sm-down:text-lg font-bold text-blue-600 dark:text-blue-400">
                  {displayTime.toLocaleTimeString('en-US', { 
                    hour12: true 
                  }).split(' ')[1]}
                </div>
              )}
            </div>
            <div className="text-2xl xl-down:text-xl sm-down:text-lg text-gray-600 dark:text-gray-400 font-medium mt-2 xl-down:mt-1">
              {displayTime.toLocaleDateString(currentLocale, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 xl-down:mt-4 sm-down:mt-3 text-center text-sm xl-down:text-xs text-gray-500 dark:text-gray-400">
          <p>{t('info', { defaultValue: 'Đồng hồ được cập nhật theo thời gian thực' })}</p>
        </div>
      </div>
    </div>
  );
};

export default Clock;

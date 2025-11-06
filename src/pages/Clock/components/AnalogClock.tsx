import React from 'react';

interface AnalogClockProps {
  time: Date;
}

const AnalogClock: React.FC<AnalogClockProps> = ({ time }) => {
  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  // Calculate rotation angles
  const secondAngle = (seconds * 6); // 360 / 60 = 6 degrees per second
  const minuteAngle = (minutes * 6) + (seconds * 0.1); // 6 degrees per minute + smooth transition
  const hourAngle = (hours * 30) + (minutes * 0.5); // 30 degrees per hour + smooth transition

  return (
    <div className="relative w-80 h-80 xl-down:w-72 xl-down:h-72 lg-down:w-64 lg-down:h-64 md-down:w-56 md-down:h-56 sm-down:w-48 sm-down:h-48">
      {/* Clock Face */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-gray-100 dark:from-neutral-700 dark:to-neutral-800 shadow-2xl border-8 xl-down:border-6 sm-down:border-4 border-gray-300 dark:border-neutral-600">
        {/* Center Dot */}
        <div className="absolute top-1/2 left-1/2 w-4 h-4 xl-down:w-3 xl-down:h-3 sm-down:w-2.5 sm-down:h-2.5 bg-gray-800 dark:bg-gray-200 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-30 shadow-lg"></div>

        {/* Hour Markers */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30) - 90;
          const isMainHour = i % 3 === 0;
          const radius = 45; // percentage from center
          const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
          const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
          
          return (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {isMainHour ? (
                <div className="w-3 h-3 xl-down:w-2.5 xl-down:h-2.5 sm-down:w-2 sm-down:h-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-md"></div>
              ) : (
                <div className="w-2 h-2 xl-down:w-1.5 xl-down:h-1.5 sm-down:w-1 sm-down:h-1 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
              )}
            </div>
          );
        })}

        {/* Hour Numbers */}
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, i) => {
          const angle = (i * 30) - 90; // 360 / 12 = 30 degrees per number
          const radius = 35; // percentage from center
          const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
          const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
          
          return (
            <div
              key={num}
              className="absolute text-xl xl-down:text-lg md-down:text-base sm-down:text-sm font-bold text-gray-700 dark:text-gray-300"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {num}
            </div>
          );
        })}

        {/* Hour Hand */}
        <div
          className="absolute top-1/2 left-1/2 origin-bottom z-20"
          style={{
            width: '6px',
            height: '25%',
            background: 'linear-gradient(to top, #1e40af, #3b82f6)',
            borderRadius: '3px 3px 0 0',
            transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)',
          }}
        >
          <div className="absolute top-0 left-1/2 w-3 h-3 bg-blue-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        {/* Minute Hand */}
        <div
          className="absolute top-1/2 left-1/2 origin-bottom z-20"
          style={{
            width: '4px',
            height: '35%',
            background: 'linear-gradient(to top, #7c3aed, #a78bfa)',
            borderRadius: '2px 2px 0 0',
            transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)',
          }}
        >
          <div className="absolute top-0 left-1/2 w-2.5 h-2.5 bg-purple-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        {/* Second Hand */}
        <div
          className="absolute top-1/2 left-1/2 origin-bottom z-20"
          style={{
            width: '2px',
            height: '40%',
            background: 'linear-gradient(to top, #dc2626, #ef4444)',
            borderRadius: '1px 1px 0 0',
            transform: `translate(-50%, -100%) rotate(${secondAngle}deg)`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            transition: 'transform 0.05s linear',
          }}
        >
          <div className="absolute top-0 left-1/2 w-2 h-2 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        {/* Decorative Ring */}
        <div className="absolute inset-4 xl-down:inset-3 sm-down:inset-2 rounded-full border-2 border-gray-200 dark:border-neutral-600 opacity-30"></div>
        <div className="absolute inset-8 xl-down:inset-6 sm-down:inset-4 rounded-full border border-gray-200 dark:border-neutral-600 opacity-20"></div>
      </div>

      {/* Outer Glow Effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-xl -z-10"></div>
    </div>
  );
};

export default AnalogClock;

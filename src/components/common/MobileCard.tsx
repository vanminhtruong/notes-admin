import React, { type ReactNode } from 'react';

interface MobileCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  badges?: ReactNode;
  metadata?: { label: string; value: string | ReactNode }[];
  actions?: ReactNode;
  onClick?: () => void;
}

const MobileCard: React.FC<MobileCardProps> = ({
  title,
  subtitle,
  icon,
  badges,
  metadata,
  actions,
  onClick
}) => {
  return (
    <div 
      className={`bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg xl-down:rounded-md p-4 xl-down:p-3 ${onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors' : ''}`}
      onClick={onClick}
    >
      {/* Header: Icon + Title + Actions */}
      <div className="flex items-start gap-3 xl-down:gap-2 mb-3 xl-down:mb-2">
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="text-base xl-down:text-sm font-semibold text-gray-900 dark:text-white truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm xl-down:text-xs text-gray-600 dark:text-gray-400 truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex-shrink-0 flex items-center gap-2 xl-down:gap-1.5" onClick={(e) => e.stopPropagation()}>
            {actions}
          </div>
        )}
      </div>

      {/* Badges */}
      {badges && (
        <div className="flex flex-wrap items-center gap-2 xl-down:gap-1.5 mb-3 xl-down:mb-2">
          {badges}
        </div>
      )}

      {/* Metadata */}
      {metadata && metadata.length > 0 && (
        <div className="space-y-2 xl-down:space-y-1.5 pt-3 xl-down:pt-2 border-t border-gray-200 dark:border-neutral-700">
          {metadata.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm xl-down:text-xs">
              <span className="text-gray-600 dark:text-gray-400">{item.label}:</span>
              <span className="text-gray-900 dark:text-white font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileCard;

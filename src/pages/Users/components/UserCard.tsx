import React from 'react';
import type { User } from '../interfaces';

interface UserCardProps {
  user: User;
  isSelected: boolean;
  onSelect: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, isSelected, onSelect }) => {
  return (
    <button
      onClick={onSelect}
      className={`flex items-center p-4 xl-down:p-3 sm-down:p-2 rounded-lg xl-down:rounded-md border transition-all duration-200 text-left ${
        isSelected 
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 ring-2 ring-blue-200 dark:ring-blue-700' 
          : 'bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-200 dark:hover:border-blue-700'
      }`}
    >
      <div className="flex-shrink-0">
        {user.avatar ? (
          <img
            className="h-10 w-10 xl-down:h-8 xl-down:w-8 sm-down:h-7 sm-down:w-7 rounded-full object-cover"
            src={user.avatar}
            alt={user.name}
          />
        ) : (
          <div className="h-10 w-10 xl-down:h-8 xl-down:w-8 sm-down:h-7 sm-down:w-7 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm xl-down:text-xs sm-down:text-2xs">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div className="ml-3 xl-down:ml-2 flex-1 min-w-0">
        <p className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
        <p className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
      </div>
      {isSelected && (
        <div className="flex-shrink-0 ml-2 xl-down:ml-1">
          <span className="text-blue-500 text-base xl-down:text-sm">✓</span>
        </div>
      )}
    </button>
  );
};

export default UserCard;

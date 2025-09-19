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
      className={`flex items-center p-4 rounded-lg border transition-all duration-200 text-left ${
        isSelected 
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 ring-2 ring-blue-200 dark:ring-blue-700' 
          : 'bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-200 dark:hover:border-blue-700'
      }`}
    >
      <div className="flex-shrink-0">
        {user.avatar ? (
          <img
            className="h-10 w-10 rounded-full object-cover"
            src={user.avatar}
            alt={user.name}
          />
        ) : (
          <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div className="ml-3 flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
      </div>
      {isSelected && (
        <div className="flex-shrink-0 ml-2">
          <span className="text-blue-500">✓</span>
        </div>
      )}
    </button>
  );
};

export default UserCard;

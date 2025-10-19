import React from 'react';

interface UserAvatarProps {
  avatar?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const UserAvatar: React.FC<UserAvatarProps> = ({ avatar, name, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-5 w-5 sm-down:h-5 sm-down:w-5 text-2xs',
    md: 'h-6 w-6 sm-down:h-5 sm-down:w-5 text-xs sm-down:text-2xs',
    lg: 'h-8 w-8 xl-down:h-6 xl-down:w-6 text-xs xl-down:text-2xs'
  };

  const sizeClass = sizeClasses[size];

  if (avatar) {
    return (
      <img
        className={`${sizeClass} rounded-full object-cover`}
        src={avatar}
        alt={name}
      />
    );
  }

  return (
    <div className={`${sizeClass} bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center`}>
      <span className="text-white font-medium">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
};

export default UserAvatar;

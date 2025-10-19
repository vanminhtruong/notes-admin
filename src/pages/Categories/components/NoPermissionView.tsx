import React from 'react';
import { useTranslation } from 'react-i18next';

const NoPermissionView: React.FC = () => {
  const { t } = useTranslation('categories');

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-red-600 mb-4">{t('noPermissionView')}</p>
      </div>
    </div>
  );
};

export default NoPermissionView;

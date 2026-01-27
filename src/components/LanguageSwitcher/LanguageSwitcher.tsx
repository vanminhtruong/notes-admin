import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import adminService from '@services/adminService';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { ComponentType } from 'react';
import { VN, US, KR, CN, TW } from 'country-flag-icons/react/3x2';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isChineseSubmenuOpen, setIsChineseSubmenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Lưu ý: country-flag-icons có typing DOM hơi khác nhau giữa môi trường, dùng any để tránh xung đột TS
  type Language = { code: string; name: string; Flag: ComponentType<any> };
  
  // Ngôn ngữ chính (không bao gồm tiếng Trung)
  const mainLanguages: Language[] = [
    { code: 'en', name: 'English', Flag: US },
    { code: 'ko', name: '한국어', Flag: KR },
    { code: 'vi', name: 'Tiếng Việt', Flag: VN }
  ];

  // Biến thể tiếng Trung
  const chineseVariants: Language[] = [
    { code: 'zh-CN', name: '简体中文', Flag: CN },
    { code: 'zh-TW', name: '繁體中文', Flag: TW }
  ];

  // Tất cả ngôn ngữ để tìm kiếm
  const allLanguages = [...mainLanguages, ...chineseVariants];

  // Xử lý code ngôn ngữ - giữ nguyên zh-CN và zh-TW, chỉ normalize các ngôn ngữ khác
  const currentLangCode = i18n.language || 'vi';
  const normalizedCode = currentLangCode.startsWith('zh') ? currentLangCode : currentLangCode.split('-')[0];
  const defaultLang = allLanguages.find((l) => l.code === 'vi') || allLanguages[0];
  const currentLanguage = allLanguages.find((lang) => lang.code === normalizedCode) || defaultLang;
  const isChineseSelected = currentLangCode.startsWith('zh');

  const handleLanguageChange = async (languageCode: string) => {
    try {
      // Cập nhật trên backend (server sẽ set cookie 'lang')
      await adminService.updateLanguage(languageCode);
      // Đồng bộ i18n trong app
      await i18n.changeLanguage(languageCode);
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setIsOpen(false);
      setIsChineseSubmenuOpen(false);
    }
  };

  // Đóng dropdown khi click ra ngoài hoặc nhấn Escape
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsChineseSubmenuOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsChineseSubmenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  // Đóng submenu khi đóng dropdown chính
  useEffect(() => {
    if (!isOpen) {
      setIsChineseSubmenuOpen(false);
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span className="leading-none inline-flex items-center">
          <currentLanguage.Flag className="h-4 w-auto rounded-[2px]" />
        </span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {currentLanguage.name}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg z-50"
        >
          <div className="py-1">
            {/* Các ngôn ngữ chính */}
            {mainLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors ${
                  currentLanguage.code === language.code
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-200'
                }`}
                role="menuitem"
              >
                <span className="leading-none inline-flex items-center">
                  <language.Flag className="h-4 w-auto rounded-[2px]" />
                </span>
                <span className="font-medium">{language.name}</span>
                {currentLanguage.code === language.code && (
                  <span className="ml-auto text-blue-500">✓</span>
                )}
              </button>
            ))}

            {/* Tiếng Trung với submenu */}
            <div className="relative">
              <button
                onClick={() => setIsChineseSubmenuOpen(!isChineseSubmenuOpen)}
                className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors ${
                  isChineseSelected
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-200'
                }`}
                role="menuitem"
              >
                <span className="leading-none inline-flex items-center">
                  <CN className="h-4 w-auto rounded-[2px]" />
                </span>
                <span className="font-medium">中文</span>
                {isChineseSelected && (
                  <span className="text-blue-500">✓</span>
                )}
                <ChevronRight
                  className={`w-4 h-4 ml-auto text-gray-500 dark:text-gray-400 transition-transform ${
                    isChineseSubmenuOpen ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {/* Submenu cho biến thể tiếng Trung */}
              {isChineseSubmenuOpen && (
                <div className="absolute left-full top-0 ml-1 w-44 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    {chineseVariants.map((variant) => (
                      <button
                        key={variant.code}
                        onClick={() => handleLanguageChange(variant.code)}
                        className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors ${
                          currentLanguage.code === variant.code
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-200'
                        }`}
                        role="menuitem"
                      >
                        <span className="leading-none inline-flex items-center">
                          <variant.Flag className="h-4 w-auto rounded-[2px]" />
                        </span>
                        <span className="font-medium">{variant.name}</span>
                        {currentLanguage.code === variant.code && (
                          <span className="ml-auto text-blue-500">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;

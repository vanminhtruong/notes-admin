export const useUtilityHandlers = () => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateWords = (text: string, words = 5) => {
    if (!text) return '';
    const parts = text.trim().split(/\s+/);
    return parts.length <= words ? text.trim() : parts.slice(0, words).join(' ') + ' ...';
  };

  const getPlainText = (html?: string) => {
    if (!html) return '';
    const div = typeof document !== 'undefined' ? document.createElement('div') : null;
    if (!div) return '';
    div.innerHTML = html;
    return (div.textContent || div.innerText || '').trim();
  };

  return {
    formatDate,
    truncateWords,
    getPlainText,
  };
};

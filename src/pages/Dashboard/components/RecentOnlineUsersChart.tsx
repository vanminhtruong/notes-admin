import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

interface RecentOnlineUser {
  userId: number;
  username: string;
  email: string;
  avatar: string;
  lastOnline: string;
  isOnline: boolean;
}

interface RecentOnlineUsersChartProps {
  data: RecentOnlineUser[];
}

const RecentOnlineUsersChart: React.FC<RecentOnlineUsersChartProps> = ({ data }) => {
  const { t } = useTranslation('dashboard');

  // Group users by hour for the chart
  const hourlyData = React.useMemo(() => {
    const hourMap: Record<string, number> = {};
    
    data.forEach(user => {
      if (user.lastOnline) {
        const date = new Date(user.lastOnline);
        const hourKey = format(date, 'HH:00');
        hourMap[hourKey] = (hourMap[hourKey] || 0) + 1;
      }
    });

    // Get last 24 hours
    const hours: string[] = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      hours.push(format(hour, 'HH:00'));
    }

    return hours.map(hour => ({
      time: hour,
      users: hourMap[hour] || 0
    }));
  }, [data]);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl xl-down:rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-6 xl-down:p-4 sm-down:p-3">
      <h2 className="text-xl xl-down:text-lg sm-down:text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 xl-down:mb-3 sm-down:mb-2">
        {t('charts.recentOnline.title')}
      </h2>
      <p className="text-sm xl-down:text-xs text-gray-600 dark:text-gray-400 mb-4 xl-down:mb-3 sm-down:mb-2">
        {t('charts.recentOnline.description')}
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={hourlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="dark:stroke-neutral-700" />
          <XAxis 
            dataKey="time" 
            className="dark:fill-gray-300"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis 
            className="dark:fill-gray-300"
            tick={{ fill: 'currentColor' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--tooltip-bg, #fff)',
              border: '1px solid var(--tooltip-border, #ccc)',
              borderRadius: '8px'
            }}
            labelStyle={{ color: 'var(--tooltip-text, #000)' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="users" 
            stroke="#10b981" 
            strokeWidth={2}
            name={t('charts.recentOnline.usersCount')}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* Recent users list */}
      <div className="mt-6 xl-down:mt-4 sm-down:mt-3">
        <h3 className="text-lg xl-down:text-base sm-down:text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 xl-down:mb-2">
          {t('charts.recentOnline.recentUsersList')}
        </h3>
        <div className="space-y-2 xl-down:space-y-1.5 sm-down:space-y-1 max-h-64 overflow-y-auto">
          {data.slice(0, 5).map((user) => (
            <div 
              key={user.userId}
              className="flex items-center gap-3 xl-down:gap-2 sm-down:gap-1.5 p-3 xl-down:p-2 sm-down:p-1.5 bg-gray-50 dark:bg-neutral-800 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
            >
              <div className="w-10 h-10 xl-down:w-8 xl-down:h-8 sm-down:w-7 sm-down:h-7 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
                ) : (
                  user.username.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user.username}
                </p>
                <p className="text-xs xl-down:text-[10px] text-gray-600 dark:text-gray-400 truncate">
                  {user.lastOnline ? format(new Date(user.lastOnline), 'HH:mm - dd/MM/yyyy') : 'N/A'}
                </p>
              </div>
              <div className="flex-shrink-0">
                {user.isOnline ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Online
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    Offline
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentOnlineUsersChart;

import React, { useState, useEffect } from 'react';
import { getActivity } from '@/app/lib/services/admin/dashboardService';

const SkeletonLoader = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="flex gap-3">
        <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>
      </div>
    ))}
  </div>
);

const RecentActivitySection = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getActivity(1, 5);
        if (data && data.activities && data.activities.length > 0) {
          const formattedActivities = data.activities.map((activity, index) => ({
            id: index + 1,
            message: activity,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            icon: '/images/Icons/img_icon_shoppingcart.svg',
            iconBg: index % 2 === 0 ? 'bg-white' : 'bg-primary-background',
            isConnected: index < data.activities.length - 1
          }));
          setActivities(formattedActivities);
        } else {
          setActivities([]);
        }
      } catch (error) {
        console.error('Error fetching activity data:', error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-full bg-gray-bg rounded-xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="small-semibold text-text-muted">
          Recent Activity
        </h3>
        <button className="p-1 hover:bg-gray-100 rounded">
          <img 
            src="/images/Icons/img_icon_dotsthree.svg" 
            alt="Options menu"
            className="w-6 h-6"
          />
        </button>
      </div>

      {/* Activity Timeline */}
      {loading ? (
        <SkeletonLoader />
      ) : activities.length > 0 ? (
        <div className="space-y-0">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-3">
              {/* Icon Column */}
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 ${activity.iconBg} rounded-lg flex items-center justify-center border border-gray-200`}>
                  <img 
                    src={activity.icon} 
                    alt="Activity icon"
                    className="w-6 h-6"
                  />
                </div>
                {activity.isConnected && (
                  <div className="w-px h-6 bg-border-primary mt-1"></div>
                )}
              </div>

              {/* Content Column */}
              <div className="flex-1 pb-4">
                <p className="text-sm text-text-muted leading-base mb-1">
                  {activity.message}
                </p>
                <span className="text-sm text-text-secondary">
                  {activity.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-text-secondary">
          <p>No recent activity</p>
        </div>
      )}
    </div>
  );
};

export default RecentActivitySection;

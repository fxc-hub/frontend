"use client";

import { useState, useEffect, createContext, useContext } from 'react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearNotifications,
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  const getNotificationStyles = (type: Notification['type']) => {
    const baseStyles = "fixed top-4 right-4 z-50 max-w-sm w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4 p-4 transform transition-all duration-300 ease-in-out";
    
    switch (type) {
      case 'success':
        return `${baseStyles} border-green-500`;
      case 'error':
        return `${baseStyles} border-red-500`;
      case 'warning':
        return `${baseStyles} border-yellow-500`;
      case 'info':
        return `${baseStyles} border-blue-500`;
      default:
        return `${baseStyles} border-gray-500`;
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '•';
    }
  };

  const getIconColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className={getNotificationStyles(notification.type)}
          style={{
            transform: `translateX(${notifications.length > 1 ? index * 10 : 0}px)`,
          }}
        >
          <div className="flex items-start">
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${getIconColor(notification.type)} bg-gray-100 dark:bg-gray-700`}>
              <span className="text-sm font-bold">{getIcon(notification.type)}</span>
            </div>
            <div className="ml-3 flex-1">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {notification.title}
              </h4>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {notification.message}
              </p>
              {notification.action && (
                <button
                  onClick={notification.action.onClick}
                  className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                >
                  {notification.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Hook for easy notification usage
export const useNotificationSystem = () => {
  const { addNotification } = useNotifications();

  return {
    showSuccess: (title: string, message: string, duration?: number) => {
      addNotification({ type: 'success', title, message, duration });
    },
    showError: (title: string, message: string, duration?: number) => {
      addNotification({ type: 'error', title, message, duration });
    },
    showWarning: (title: string, message: string, duration?: number) => {
      addNotification({ type: 'warning', title, message, duration });
    },
    showInfo: (title: string, message: string, duration?: number) => {
      addNotification({ type: 'info', title, message, duration });
    },
    showNotification: (notification: Omit<Notification, 'id'>) => {
      addNotification(notification);
    },
  };
}; 
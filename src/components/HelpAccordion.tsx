'use client';

import { useState } from 'react';
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  QuestionMarkCircleIcon,
  LightBulbIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface HelpItem {
  id: string;
  title: string;
  content: string;
  type: 'tip' | 'info' | 'warning' | 'help';
  icon?: React.ComponentType<any>;
}

interface HelpAccordionProps {
  title?: string;
  items: HelpItem[];
  defaultOpen?: string[];
  className?: string;
}

export default function HelpAccordion({ 
  title = "Help & Tips", 
  items, 
  defaultOpen = [], 
  className = "" 
}: HelpAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen));

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const getIcon = (type: string, customIcon?: React.ComponentType<any>) => {
    if (customIcon) {
      const Icon = customIcon;
      return <Icon className="w-5 h-5" />;
    }

    switch (type) {
      case 'tip':
        return <LightBulbIcon className="w-5 h-5 text-yellow-400" />;
      case 'info':
        return <InformationCircleIcon className="w-5 h-5 text-blue-400" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-400" />;
      case 'help':
      default:
        return <QuestionMarkCircleIcon className="w-5 h-5 text-green-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tip':
        return 'border-yellow-500/30 bg-yellow-500/5';
      case 'info':
        return 'border-blue-500/30 bg-blue-500/5';
      case 'warning':
        return 'border-orange-500/30 bg-orange-500/5';
      case 'help':
      default:
        return 'border-green-500/30 bg-green-500/5';
    }
  };

  if (items.length === 0) return null;

  return (
    <div className={`bg-gray-800/50 rounded-lg border border-gray-700 ${className}`}>
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-medium text-white flex items-center space-x-2">
          <QuestionMarkCircleIcon className="w-5 h-5 text-blue-400" />
          <span>{title}</span>
        </h3>
      </div>
      
      <div className="divide-y divide-gray-700">
        {items.map((item) => (
          <div key={item.id} className={`border-l-4 ${getTypeColor(item.type)}`}>
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full p-4 text-left hover:bg-gray-700/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getIcon(item.type, item.icon)}
                  <span className="text-white font-medium">{item.title}</span>
                </div>
                {openItems.has(item.id) ? (
                  <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </button>
            
            {openItems.has(item.id) && (
              <div className="px-4 pb-4">
                <div className="pl-8">
                  <div 
                    className="text-gray-300 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 
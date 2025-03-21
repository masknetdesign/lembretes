
import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BillNotificationBadgeProps {
  type: 'warning' | 'urgent' | 'expired';
  className?: string;
}

const BillNotificationBadge: React.FC<BillNotificationBadgeProps> = ({ type, className }) => {
  const iconMap = {
    warning: <Clock className="h-3 w-3" />,
    urgent: <AlertTriangle className="h-3 w-3" />,
    expired: <AlertTriangle className="h-3 w-3" />
  };
  
  const colorMap = {
    warning: 'bg-amber-400/80 text-amber-950',
    urgent: 'bg-orange-400/80 text-orange-950',
    expired: 'bg-destructive/80 text-destructive-foreground'
  };
  
  return (
    <div className={cn(
      'inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium',
      colorMap[type],
      className
    )}>
      {iconMap[type]}
      <span className="ml-1">
        {type === 'warning' && 'Em breve'}
        {type === 'urgent' && 'Urgente'}
        {type === 'expired' && 'Vencido'}
      </span>
    </div>
  );
};

export default BillNotificationBadge;

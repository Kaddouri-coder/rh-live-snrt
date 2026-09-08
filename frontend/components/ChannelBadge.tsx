import React from 'react';
import { getChannelStyle } from '../data/channelStyles';

interface ChannelBadgeProps {
  name: string;
  className?: string;
}

export const ChannelBadge: React.FC<ChannelBadgeProps> = ({ name, className = '' }) => {
  const style = getChannelStyle(name);

  if (!style.logo) {
    return <span className={className}>{name}</span>;
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <img
        src={style.logo}
        alt=""
        className="w-[28px] h-[28px] rounded-full bg-white object-contain p-[2px] shrink-0"
      />
      <span className="truncate">{name}</span>
    </span>
  );
};
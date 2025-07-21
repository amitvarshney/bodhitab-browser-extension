import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const TimeWidget: React.FC = () => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const updateTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    setTime(`${hours}:${minutes}:${seconds}`);
  };

  return (
    <div className="flex items-center space-x-2">
      <Clock className="w-6 h-6" />
      <span className="text-3xl font-light">{time}</span>
    </div>
  );
};

export default TimeWidget;
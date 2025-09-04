import { Clock, Calendar } from "lucide-react";
import { useState, useEffect } from "react";

interface ServiceHoursProps {
  className?: string;
}

interface HoursInfo {
  day: string;
  hours: string;
  isToday: boolean;
  isCurrentlyOpen: boolean;
}

/**
 * ServiceHours component displays the operating hours for Math Farm
 * Shows current status and highlights today's hours
 */
export function ServiceHours({ className = "" }: ServiceHoursProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hoursInfo, setHoursInfo] = useState<HoursInfo[]>([]);
  const [isCurrentlyOpen, setIsCurrentlyOpen] = useState(false);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Calculate hours info and current status
  useEffect(() => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    // Define service hours
    const weekdayStart = 7 * 60; // 7:00 AM in minutes
    const weekdayEnd = 2 * 60; // 2:00 AM next day in minutes (26:00 = 2:00 AM)
    const weekendStart = 7 * 60; // 7:00 AM in minutes
    const weekendEnd = 3 * 60; // 3:00 AM next day in minutes (27:00 = 3:00 AM)

    // Check if currently open
    let isOpen = false;

    if (currentTimeInMinutes >= 7 * 60) {
      // After 7 AM - check today's hours
      if (currentDay >= 1 && currentDay <= 5) {
        // Monday to Friday - open until 2 AM next day
        isOpen = true;
      } else {
        // Saturday and Sunday - open until 3 AM next day
        isOpen = true;
      }
    } else {
      // Before 7 AM - check if we're in previous day's extended hours
      const previousDay = currentDay === 0 ? 6 : currentDay - 1;

      if (previousDay >= 1 && previousDay <= 5) {
        // Previous day was weekday (Mon-Fri) - open until 2 AM
        isOpen = currentTimeInMinutes < weekdayEnd;
      } else {
        // Previous day was weekend (Sat-Sun) - open until 3 AM
        isOpen = currentTimeInMinutes < weekendEnd;
      }
    }

    setIsCurrentlyOpen(isOpen);

    // Generate hours info for each day
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const hours: HoursInfo[] = days.map((day, index) => {
      const isWeekend = index === 0 || index === 6; // Sunday or Saturday
      const hoursText = isWeekend ? "7:00 AM - 3:00 AM" : "7:00 AM - 2:00 AM";

      return {
        day,
        hours: hoursText,
        isToday: index === currentDay,
        isCurrentlyOpen: index === currentDay ? isOpen : false,
      };
    });

    setHoursInfo(hours);
  }, [currentTime]);

  const getStatusColor = () => {
    return isCurrentlyOpen
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";
  };

  const getStatusText = () => {
    return isCurrentlyOpen ? "Currently Open" : "Currently Closed";
  };

  const getStatusIcon = () => {
    return isCurrentlyOpen ? (
      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
    ) : (
      <div className="w-3 h-3 bg-red-500 rounded-full" />
    );
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header with current status */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">
              Service Hours
            </h3>
          </div>

          <div className="flex items-center justify-center gap-2">
            {getStatusIcon()}
            <span className={`font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>

          <p className="text-sm text-muted-foreground">
            Current time:{" "}
            {currentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </p>
        </div>

        {/* Hours schedule */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Weekly Schedule
            </span>
          </div>

          <div className="space-y-1">
            {hoursInfo.map((info) => (
              <div
                key={info.day}
                className={`flex justify-between items-center py-2 px-3 rounded-md transition-colors ${
                  info.isToday
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted/50"
                }`}
              >
                <span
                  className={`font-medium ${
                    info.isToday ? "text-primary" : "text-foreground"
                  }`}
                >
                  {info.day}
                  {info.isToday && (
                    <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      Today
                    </span>
                  )}
                </span>
                <span
                  className={`text-sm ${
                    info.isToday
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {info.hours}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Time zone notice */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            All times shown in your local time zone
          </p>
        </div>
      </div>
    </div>
  );
}

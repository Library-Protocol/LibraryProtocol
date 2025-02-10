"use client";

import { Bell } from "lucide-react"; // Import Bell icon from lucide-react

interface BellIconProps {
  hasNotification?: boolean;
}

const BellIcon: React.FC<BellIconProps> = ({ hasNotification = false }) => {
  return (
    <div className="relative w-8 h-8">
      {/* Bell icon styled */}
      <Bell className="w-full h-full text-white" />

      {/* Notification dot */}
      {hasNotification && (
        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-black"></span>
      )}
    </div>
  );
};

export default BellIcon;

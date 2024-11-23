import { useState, useEffect } from "react";

// Custom hook to calculate and update countdown
const useCountdown = (interactionStartTime: number, interactionDuration: number) => {
  const [countdown, setCountdown] = useState<string>("");

  // Function to convert seconds into hours, minutes, and seconds
  const convertUnixToTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours} Hrs ${minutes} Mins ${secs} Secs`;
  };

  useEffect(() => {
    if (interactionStartTime > 0 && interactionDuration > 0) {
      const calculateCountdown = () => {
        const currentTime = Math.floor(Date.now() / 1000); // Current time in Unix seconds
        const elapsedTime = currentTime - interactionStartTime;
        const remainingTime = interactionDuration - elapsedTime;

        if (remainingTime <= 0) {
          setCountdown("0 Hrs 0 Mins 0 Secs");
        } else {
          setCountdown(convertUnixToTime(remainingTime));
        }
      };

      // Calculate countdown immediately
      calculateCountdown();

      // Update countdown every second
      const intervalId = setInterval(calculateCountdown, 1000);

      // Cleanup interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [interactionStartTime, interactionDuration]);

  return countdown;
};

export default useCountdown;

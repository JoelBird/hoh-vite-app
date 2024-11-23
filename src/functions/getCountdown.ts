// Instead of a hook, this is now a regular function
const getCountdown = (interactionStartTime: number, interactionDuration: number): string => {
    const currentTime = Math.floor(Date.now() / 1000);
    const elapsedTime = currentTime - interactionStartTime;
    const remainingTime = interactionDuration - elapsedTime;
  
    const hours = Math.floor(remainingTime / 3600);
    const minutes = Math.floor((remainingTime % 3600) / 60);
    const secs = remainingTime % 60;
  
    return `${Math.max(0, hours)} Hrs ${Math.max(0, minutes)} Mins ${Math.max(0, secs)} Secs`;
  };
  
  export default getCountdown;
  
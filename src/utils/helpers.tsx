// Helper function to convert seconds to time format (hours and minutes)
export const sToTime = (seconds: number): string => {
    if (seconds === 0) {
        return "None";
    }
    if (seconds < 60) {
        return "< 1 minute";
    }
    const hours: number = Math.floor(seconds / 3600);
    const secOver: number = seconds % 3600;
    const minutes: number = Math.floor(secOver / 60);
    let timeString: string = "";
    if (hours === 1) {
        timeString += "1 hour";
    } else if (hours > 1) {
        timeString += hours + " hours";
    }
    if (minutes === 1) {
        if (hours > 0) {
            timeString += " and ";
        }
        timeString += "1 minute";
    } else if (minutes > 1) {
        if (hours > 0) {
            timeString += " and ";
        }
        timeString += minutes + " minutes";
    }
    return timeString;
};

// Helper function to capitalize first letter of a string
export const capitalizeFirstLetter = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
/**
 * Time helper utilities
 */
module.exports = {
    /**
     * Gets current hour in 12-hour format (1-12)
     * @returns {number} Hour in 12-hour format
     */
    getHour12: () => {
        try {
            const time = new Date();
            const hours = time.getHours();
            return (hours % 12) || 12;
        } catch (error) {
            console.error('Error in getHour12:', error);
            return null;
        }
    },

    /**
     * Gets the week number (1-5) within the current month
     * @param {Date} [date=new Date()] - Optional date to check
     * @returns {number} Week number of the month
     */
    getWeek4: (date = new Date()) => {
        try {
            if (!(date instanceof Date) || isNaN(date)) {
                throw new Error('Invalid date provided');
            }

            // Get the first day of the month
            const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            
            // Calculate days since the first day of the month
            const daysSinceFirst = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000));
            
            // Calculate week number (1-based)
            const weekNumber = Math.ceil((daysSinceFirst + firstDay.getDay() + 1) / 7);

            return weekNumber;
        } catch (error) {
            console.error('Error in getWeek4:', error);
            return null;
        }
    },

    /**
     * Gets the total minutes elapsed since Unix epoch
     * @returns {number} Minutes since epoch
     */
    getTimeInMinutes: () => {
        try {
            return Math.floor(Date.now() / 60000);
        } catch (error) {
            console.error('Error in getTimeInMinutes:', error);
            return null;
        }
    },

    /**
     * Gets current time in HH:MM format
     * @param {boolean} [is24Hour=false] - Use 24-hour format
     * @returns {string} Formatted time
     */
    getFormattedTime: (is24Hour = false) => {
        try {
            const now = new Date();
            let hours = now.getHours();
            const minutes = now.getMinutes();
            let period = '';

            if (!is24Hour) {
                period = hours >= 12 ? ' PM' : ' AM';
                hours = hours % 12 || 12;
            }

            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}${period}`;
        } catch (error) {
            console.error('Error in getFormattedTime:', error);
            return null;
        }
    },

    /**
     * Gets the day of week (0-6, 0 = Sunday)
     * @param {Date} [date=new Date()] - Optional date to check
     * @returns {number} Day of week
     */
    getDayOfWeek: (date = new Date()) => {
        try {
            if (!(date instanceof Date) || isNaN(date)) {
                throw new Error('Invalid date provided');
            }
            return date.getDay();
        } catch (error) {
            console.error('Error in getDayOfWeek:', error);
            return null;
        }
    }
};

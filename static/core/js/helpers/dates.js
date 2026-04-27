import $A from "../helper.js";

export default {
    /**
     * Parses a date object, confirms Date object, and returns it.
     * 
     * @param {datetime} value: should be a datetime object
     * @returns null | Date object
     */
    parseDate: function (value) {
        if (value instanceof Date) {
            return value;
        }
        const dt = new Date(value);

        return Number.isNaN(dt.getTime()) ? null : dt;
    },

    /**
     * Convert's a datetime value supplied by the back-end into a human-readable date and time value,
     * in the timezone of the current browser.
     * 
     * @param {string} mysqlString: needs to be in format: "YYYY-MM-DDTHH:MM:SS.000Z"
     * @param {object} displayOptions: object spefifying paramerters for display (see default for ideas)
     */
    convertToDisplayLocal: function (mysqlString, displayOptions = null, nullDisplay = '') {
        const dateObj = $A.dates.parseDate(mysqlString);
        if (!dateObj) return nullDisplay;

        if($A.base.is(displayOptions, 'dictionary')) {
            const y = $A.base.get(displayOptions, 'year');
            const m = $A.base.get(displayOptions, 'month');
            const d = $A.base.get(displayOptions, 'day');

            if (y && m && d) {
                return new Intl.DateTimeFormat(navigator.language, displayOptions).format(dateObj); 
            }
        }
        
        if (displayOptions === 'default') {
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                timeZoneName: 'short',
            };

            // long, formal date display
            return new Intl.DateTimeFormat(navigator.language, options).format(dateObj);        
        } else {
            return dateObj.toLocaleString(); // 1/15/2026, 7:00:00 AM
        }
    },

    /**
     * Convert's a datetime value supplied by the back-end into a format readble by the datetime-local
     * input field found in our input forms.
     * 
     * @param {string} mysqlString: needs to be in format: "YYYY-MM-DDTHH:MM:SS.000Z"
     * @returns {string} datetime-local formatted string "YYYY-MM-DDTHH:MM" (local timezone)
     */
    convertToDateTimeToLocalField: function (mysqlString, nullDisplay = '') {
        const dateObj = $A.dates.parseDate(mysqlString);
        if (!dateObj) return nullDisplay;

        const pad = (string) => String(string).padStart(2, '0');
        
        const yyyy = dateObj.getFullYear();
        const mm = pad(dateObj.getMonth() + 1);
        const dd = pad(dateObj.getDate());
        const hh = pad(dateObj.getHours());
        const min = pad(dateObj.getMinutes());

        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    },

    /**
     * Reverse operation of convertToDateTimeToLocalField(), taking a datetime-local
     * formatted string or Date object and converting it to back-end UTC timezone string format.
     * 
     * @param {Date object | string} localString: string can be "YYYY-MM-DDTHH:MM" (local timezone)
     * @returns string format "YYYY-MM-DDTHH:MM:SS.000Z"
     */
    convertLocalToBackendUTC: function (localDate) {
        const dateObj = $A.dates.parseDate(localDate);
        if (!dateObj) {
            if (typeof localDate === 'string') {
                dateObj = $A.dates.sloppyDateTimeCorrection(localDate);
                if (!dateObj) return null;
            } else {
                return null;
            }
        }

        if (!dateObj instanceof Date) {
            return null;
        }

        const pad = (string) => String(string).padStart(2, '0');
        
        const YYYY = dateObj.getUTCFullYear();
        const MM = pad(dateObj.getUTCMonth() + 1);
        const DD = pad(dateObj.getUTCDate());
        const HH = pad(dateObj.getUTCHours());
        const MIN = pad(dateObj.getUTCMinutes());
        const SEC = pad(dateObj.getUTCSeconds());

        return `${YYYY}-${MM}-${DD}T${HH}:${MIN}:${SEC}.000Z`;
    },

    /**
     * Attempts to fix sloppy date-time texts.
     * 
     * @param {string} localDate - user supplied string representation of the datetime value
     * @param {*} nullReturn - what value to return upon failiur
     */
    sloppyDateTimeCorrection: function (localDatem, nullReturn = null) {
        const matches = localDate.match(/^(\d{2,4})\s?[-/:]\s?(\d{2})\s?[-/:]\s?(\d{2})\s?((\d{2})\s?:?\s?(\d{2})\s?:?\s?(\d{2})?)?$/);
        if (!matches) return nullReturn;

        const [, y, mo, day, hh, mm, ss] = matches;

        const yyyy = parseInt(y, 10);
        const month = parseInt(mo, 10) - 1;
        const dd = parseInt(day, 10);
        const hour = parseInt(hh, 10);
        const minute = parseInt(mm, 10);
        const second = ss ? parseInt(ss, 10) : 0;

        dt = new Date(yyyy, month, dd, hour, minute, second);
        
        if (isNaN(dt.getTime())) {
            return nullReturn;
        }

        return dt;
    },

    /**
     * Provided one point in time; use the start and end times to 
     * determine provided timePoint's current cycle-number.
     * 
     * @param {datetime} timePoint: datetime value
     * @param {datetime} cycleStart: start of the whole Project's life-cycle.
     * @param {datetime} cycleEnd: end of the whole project's life-cycle
     * @param {num} cycleIntervalLength: number of interval units
     * @param {str} cycleIntervalUnit: enum (day, week, month, year)
     * @returns (num) cycle number for timePoint
     */
    currentIterationNumber: function(timePoint, cycleStart, cycleEnd, cycleIntervalLength, cycleIntervalUnit) {
        const point = $A.dates.parseDate(timePoint);
        const start = $A.dates.parseDate(cycleStart);
        const end = cycleEnd ? $A.dates.parseDate(cycleEnd) : null;

        if (!point || !start) return null;
        if (end && (point < start || point > end)) return null;
        if (point < start) return null;

        const msPerDay = 1000 * 60 * 60 * 24;

        const unit = (cycleIntervalUnit || 'day').toString().toLowerCase();
        let cycleIndex = 0;

        switch (unit) {
            case 'day': {
                const days = Math.floor((point - start) / msPerDay);
                cycleIndex = Math.floor(days / cycleIntervalLength);
                break;
            }
            case 'week': {
                const days = Math.floor((point - start) / msPerDay);
                cycleIndex = Math.floor(days / (cycleIntervalLength * 7));
                break;
            }
            case 'month': {
                const yearDiff = point.getFullYear() - start.getFullYear();
                const monthDiff = point.getMonth() - start.getMonth();
                const totalMonths = yearDiff * 12 + monthDiff;
                cycleIndex = Math.floor(totalMonths / cycleIntervalLength);
                break;
            }
            case 'year': {
                const yearDiff = point.getFullYear() - start.getFullYear();
                cycleIndex = Math.floor(yearDiff / cycleIntervalLength);
                break;
            }
            default:
                return null;
        }

        // Ensure at least 1 and do not return 0 for first cycle
        return cycleIndex + 1;
    },


    /**
     * When provided with the (current) cycleNumber, using the cycleStart, cycleEnd, interval unit and Length; 
     * calculate the start end date-time of the provided cycle.
     * 
     * @param {num} cycleNumber: cycle number being evaluated
     * @param {datetime} cycleStart: start of the whole Project's life-cycle.
     * @param {datetime} cycleEnd: end of the whole project's life-cycle
     * @param {num} cycleIntervalLength: number of days, weeks, months the interval unit is in
     * @param {str} cycleIntervalUnit: interval unit enum(day, week, month, year)
     * @returns object {start: datetime value, end: datetime value}
     */
    currentIterationInterval: function (cycleNumber, cycleStart, cycleEnd, cycleIntervalLength, cycleIntervalUnit) {
        const startBase = $A.dates.parseDate(cycleStart);
        const endLimit = cycleEnd ? $A.dates.parseDate(cycleEnd) : null;

        if (!startBase || !cycleNumber || cycleNumber < 1 || !cycleIntervalLength || cycleIntervalLength < 1) return null;

        const unit = (cycleIntervalUnit || 'day').toString().toLowerCase();
        let intervalStart = new Date(startBase);
        let intervalEnd;

        switch (unit) {
            case 'day': {
                const ms = cycleIntervalLength * 24 * 60 * 60 * 1000;
                intervalStart = new Date(startBase.getTime() + (cycleNumber - 1) * ms);
                intervalEnd = new Date(intervalStart.getTime() + ms);
                break;
            }
            case 'week': {
                const ms = cycleIntervalLength * 7 * 24 * 60 * 60 * 1000;
                intervalStart = new Date(startBase.getTime() + (cycleNumber - 1) * ms);
                intervalEnd = new Date(intervalStart.getTime() + ms);
                break;
            }
            case 'month': {
                intervalStart.setMonth(startBase.getMonth() + (cycleNumber - 1) * cycleIntervalLength);
                intervalEnd = new Date(intervalStart);
                intervalEnd.setMonth(intervalStart.getMonth() + cycleIntervalLength);
                break;
            }
            case 'year': {
                intervalStart.setFullYear(startBase.getFullYear() + (cycleNumber - 1) * cycleIntervalLength);
                intervalEnd = new Date(intervalStart);
                intervalEnd.setFullYear(intervalStart.getFullYear() + cycleIntervalLength);
                break;
            }
            default:
                return null;
        }

        // If cycleEnd is provided, cap the end at cycleEnd
        if (endLimit && intervalEnd > endLimit) {
            intervalEnd = new Date(endLimit);
        }

        // If start is after or at cycleEnd, invalid
        if (endLimit && intervalStart >= endLimit) return null;

        return { start: intervalStart, end: intervalEnd };
    }
};

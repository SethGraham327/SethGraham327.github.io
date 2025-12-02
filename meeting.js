// Timezone and Meeting Booking Functionality

// Common timezones list
const commonTimezones = [
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Halifax', label: 'Atlantic Time (AT)' },
    { value: 'America/St_Johns', label: 'Newfoundland Time (NT)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)' },
    { value: 'Europe/Berlin', label: 'Berlin (CET)' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
    { value: 'Asia/Kolkata', label: 'India (IST)' },
    { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Beijing/Shanghai (CST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
    { value: 'Pacific/Auckland', label: 'Auckland (NZDT/NZST)' }
];

const LETHBRIDGE_TIMEZONE = 'America/Edmonton'; // Lethbridge is in Mountain Time

let userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
let clockInterval;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    initializeTimezones();
    startClocks();
    setupFormHandlers();
    setMinDate();
});

// Populate timezone dropdown
function initializeTimezones() {
    const select = document.getElementById('userTimezone');

    // Add detected timezone first
    const detectedOption = document.createElement('option');
    detectedOption.value = userTimezone;
    detectedOption.textContent = `${userTimezone} (Detected)`;
    detectedOption.selected = true;
    select.appendChild(detectedOption);

    // Add separator
    const separator = document.createElement('option');
    separator.disabled = true;
    separator.textContent = '──────────────';
    select.appendChild(separator);

    // Add common timezones
    commonTimezones.forEach(tz => {
        if (tz.value !== userTimezone) {
            const option = document.createElement('option');
            option.value = tz.value;
            option.textContent = tz.label;
            select.appendChild(option);
        }
    });

    // Listen for timezone changes
    select.addEventListener('change', function () {
        userTimezone = this.value;
        updateClocks();
        updateTimeConversion();
    });
}

// Start real-time clocks
function startClocks() {
    updateClocks();
    clockInterval = setInterval(updateClocks, 1000);
}

// Update clock displays
function updateClocks() {
    const now = new Date();

    // User's time
    const userTimeStr = now.toLocaleTimeString('en-US', {
        timeZone: userTimezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    document.getElementById('userTime').textContent = userTimeStr;

    // Lethbridge time
    const lethbridgeTimeStr = now.toLocaleTimeString('en-US', {
        timeZone: LETHBRIDGE_TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    document.getElementById('lethbridgeTime').textContent = lethbridgeTimeStr;

    // Calculate time difference
    updateTimezoneOffset();
}

// Calculate and display timezone offset
function updateTimezoneOffset() {
    const now = new Date();

    // Get offset in minutes for both timezones
    const userDate = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }));
    const lethbridgeDate = new Date(now.toLocaleString('en-US', { timeZone: LETHBRIDGE_TIMEZONE }));

    const diffMs = lethbridgeDate - userDate;
    const diffHours = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((Math.abs(diffMs) % (1000 * 60 * 60)) / (1000 * 60));

    let offsetText = '';
    if (diffMs === 0) {
        offsetText = 'Same timezone';
    } else if (diffMs > 0) {
        offsetText = `Lethbridge is ${diffHours}h ${diffMinutes > 0 ? diffMinutes + 'm' : ''} ahead`;
    } else {
        offsetText = `Lethbridge is ${diffHours}h ${diffMinutes > 0 ? diffMinutes + 'm' : ''} behind`;
    }

    document.getElementById('timezoneOffset').textContent = offsetText;
}

// Set minimum date to today
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('meetingDate').min = today;
}

// Setup form handlers
function setupFormHandlers() {
    const meetingTimeInput = document.getElementById('meetingTime');
    const meetingDateInput = document.getElementById('meetingDate');

    // Update conversion when time or date changes
    meetingTimeInput.addEventListener('change', updateTimeConversion);
    meetingDateInput.addEventListener('change', updateTimeConversion);

    // Form submission
    document.getElementById('meetingForm').addEventListener('submit', handleFormSubmit);
}

// Update time conversion display
function updateTimeConversion() {
    const dateInput = document.getElementById('meetingDate').value;
    const timeInput = document.getElementById('meetingTime').value;
    const conversionDisplay = document.getElementById('conversionDisplay');

    if (dateInput && timeInput) {
        // Create date object in user's timezone
        const dateTimeStr = `${dateInput}T${timeInput}`;
        const userDateTime = new Date(dateTimeStr);

        // Convert to Lethbridge time
        const lethbridgeTimeStr = userDateTime.toLocaleString('en-US', {
            timeZone: LETHBRIDGE_TIMEZONE,
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        document.getElementById('convertedTime').textContent = lethbridgeTimeStr;
        conversionDisplay.style.display = 'block';
    } else {
        conversionDisplay.style.display = 'none';
    }
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        date: document.getElementById('meetingDate').value,
        time: document.getElementById('meetingTime').value,
        timezone: userTimezone,
        message: document.getElementById('message').value
    };

    // Create date object for conversion
    const dateTimeStr = `${formData.date}T${formData.time}`;
    const userDateTime = new Date(dateTimeStr);
    const lethbridgeTime = userDateTime.toLocaleString('en-US', {
        timeZone: LETHBRIDGE_TIMEZONE,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    // Create email subject and body
    const subject = encodeURIComponent(`Meeting Request from ${formData.name}`);
    const body = encodeURIComponent(
        `Name: ${formData.name}\n` +
        `Email: ${formData.email}\n\n` +
        `Requested Time (${userTimezone}):\n${formData.date} at ${formData.time}\n\n` +
        `Converted to Lethbridge Time:\n${lethbridgeTime}\n\n` +
        `Message:\n${formData.message || 'No message provided'}`
    );

    // Open email client
    window.location.href = `mailto:seth.graham@uleth.ca?subject=${subject}&body=${body}`;

    // Show success message
    document.getElementById('formSuccess').style.display = 'block';

    // Reset form
    setTimeout(() => {
        document.getElementById('meetingForm').reset();
        document.getElementById('conversionDisplay').style.display = 'none';
        document.getElementById('formSuccess').style.display = 'none';
    }, 3000);
}

// Cleanup on page unload
window.addEventListener('beforeunload', function () {
    if (clockInterval) {
        clearInterval(clockInterval);
    }
});

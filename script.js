/* =====================================================
   SMARTCHAIR JAVASCRIPT
===================================================== */


/* =====================================================
   PAGE NAVIGATION
===================================================== */

function showPage(pageId, button) {

    // Hide all pages
    const pages =
        document.querySelectorAll(".page");

    pages.forEach(page => {
        page.classList.remove("active-page");
    });


    // Show selected page
    const selectedPage =
        document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.classList.add("active-page");
    }


    // Remove active from navigation
    const buttons =
        document.querySelectorAll(".nav-btn");

    buttons.forEach(btn => {
        btn.classList.remove("active");
    });


    // Add active to clicked button
    if (button) {
        button.classList.add("active");
    }


    // Update data when opening analytics/dashboard
    updateDashboard();
    createCharts();
}


/* =====================================================
   BREAK REMINDER TIMER
===================================================== */

let breakTimerInterval = null;

let breakStartTime = null;

let breakDuration = 45 * 60;

let breakTimerRunning = false;


/* =====================================================
   START TIMER
===================================================== */

function startBreakTimer() {

    // Stop previous timer
    if (breakTimerInterval) {
        clearInterval(breakTimerInterval);
    }


    // Get selected sitting duration
    const sittingLimit =
        document.getElementById("sittingLimit");


    const selectedMinutes =
        parseInt(sittingLimit.value);


    // Convert minutes to seconds
    breakDuration =
        selectedMinutes * 60;


    // Save starting time
    breakStartTime =
        Date.now();


    breakTimerRunning = true;


    // Update status
    const status =
        document.getElementById("breakStatus");


    status.textContent =
        "🟢 Sitting session active";


    status.style.color =
        "#1ca866";


    // Ask notification permission
    requestNotificationPermission();


    // Update immediately
    updateBreakTimer();


    // Update every second
    breakTimerInterval =
        setInterval(
            updateBreakTimer,
            1000
        );

}


/* =====================================================
   UPDATE TIMER
===================================================== */

function updateBreakTimer() {

    if (!breakTimerRunning) {
        return;
    }


    // Calculate elapsed time
    const elapsedSeconds =
        Math.floor(
            (Date.now() - breakStartTime) / 1000
        );


    /* -----------------------------------------------
       HOURS
    ----------------------------------------------- */

    const hours =
        Math.floor(
            elapsedSeconds / 3600
        );


    /* -----------------------------------------------
       MINUTES
    ----------------------------------------------- */

    const minutes =
        Math.floor(
            (elapsedSeconds % 3600) / 60
        );


    /* -----------------------------------------------
       SECONDS
    ----------------------------------------------- */

    const seconds =
        elapsedSeconds % 60;


    /* -----------------------------------------------
       FORMAT TIMER
    ----------------------------------------------- */

    const formattedTime =

        String(hours).padStart(2, "0")
        + ":"
        +
        String(minutes).padStart(2, "0")
        + ":"
        +
        String(seconds).padStart(2, "0");


    document.getElementById(
        "breakTimer"
    ).textContent =
        formattedTime;


    /* -----------------------------------------------
       PROGRESS
    ----------------------------------------------- */

    const percentage =
        Math.min(
            (elapsedSeconds /
                breakDuration) * 100,
            100
        );


    document.getElementById(
        "breakProgress"
    ).style.width =
        percentage + "%";


    /* -----------------------------------------------
       REMAINING TIME
    ----------------------------------------------- */

    const remaining =
        breakDuration -
        elapsedSeconds;


    if (remaining > 0) {

        const remainingMinutes =
            Math.ceil(
                remaining / 60
            );


        document.getElementById(
            "remainingTime"
        ).textContent =

            remainingMinutes +
            " minutes remaining until your break.";

    }


    /* -----------------------------------------------
       TIME REACHED
    ----------------------------------------------- */

    if (elapsedSeconds >= breakDuration) {

        triggerBreakAlert();

    }

}


/* =====================================================
   BREAK ALERT
===================================================== */

function triggerBreakAlert() {

    // Stop timer
    clearInterval(
        breakTimerInterval
    );


    breakTimerRunning = false;


    document.getElementById(
        "breakStatus"
    ).textContent =
        "🔔 Break time reached!";


    document.getElementById(
        "breakStatus"
    ).style.color =
        "#d98c00";


    document.getElementById(
        "remainingTime"
    ).textContent =
        "Your selected sitting duration is complete.";


    document.getElementById(
        "breakProgress"
    ).style.width =
        "100%";


    // Show alert
    document.getElementById(
        "breakAlert"
    ).classList.add("show");


    /* -----------------------------------------------
       BROWSER NOTIFICATION
    ----------------------------------------------- */

    if (
        "Notification" in window &&
        Notification.permission === "granted"
    ) {

        new Notification(
            "SmartChair Break Reminder",
            {
                body:
                    "You have reached your sitting limit. Time for a break!"
            }
        );

    }


    // Play sound
    playBreakSound();

}


/* =====================================================
   CLOSE BREAK ALERT
===================================================== */

function closeBreakAlert() {

    document.getElementById(
        "breakAlert"
    ).classList.remove("show");


    resetBreakTimer();


    document.getElementById(
        "breakStatus"
    ).textContent =
        "✓ Break completed. Ready for a new session.";


    document.getElementById(
        "breakStatus"
    ).style.color =
        "#1ca866";


    document.getElementById(
        "remainingTime"
    ).textContent =
        "Start another sitting session when you are ready.";

}


/* =====================================================
   STOP TIMER
===================================================== */

function stopBreakTimer() {

    clearInterval(
        breakTimerInterval
    );


    breakTimerRunning = false;


    document.getElementById(
        "breakStatus"
    ).textContent =
        "Timer stopped";


    document.getElementById(
        "breakStatus"
    ).style.color =
        "#718096";


    /*
       The current session is saved as sitting data.
    */

    saveCurrentSession();

}


/* =====================================================
   RESET TIMER
===================================================== */

function resetBreakTimer() {

    clearInterval(
        breakTimerInterval
    );


    breakTimerRunning = false;

    breakStartTime = null;


    document.getElementById(
        "breakTimer"
    ).textContent =
        "00:00:00";


    document.getElementById(
        "breakProgress"
    ).style.width =
        "0%";


    document.getElementById(
        "remainingTime"
    ).textContent =
        "Select your sitting duration and start your session.";

}


/* =====================================================
   BREAK SOUND
===================================================== */

function playBreakSound() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        const audioContext =
            new AudioContext();


        const oscillator =
            audioContext.createOscillator();


        const gain =
            audioContext.createGain();


        oscillator.connect(gain);

        gain.connect(
            audioContext.destination
        );


        oscillator.frequency.value =
            800;


        gain.gain.value =
            0.15;


        oscillator.start();


        setTimeout(() => {

            oscillator.stop();

        }, 500);

    }

    catch (error) {

        console.log(
            "Sound could not be played."
        );

    }

}


/* =====================================================
   NOTIFICATION PERMISSION
===================================================== */

function requestNotificationPermission() {

    if (
        "Notification" in window
    ) {

        Notification.requestPermission()
            .then(permission => {

                const status =
                    document.getElementById(
                        "notificationStatus"
                    );


                if (permission === "granted") {

                    status.textContent =
                        "✓ Notifications are enabled.";

                }

                else {

                    status.textContent =
                        "Notifications are blocked.";

                }

            });

    }

}


/* =====================================================
   DAILY DATA
===================================================== */


/*
   This stores daily sitting data.

   Later, the ESP32 can send real sensor data
   instead of these demonstration values.
*/

let smartChairData =
    JSON.parse(
        localStorage.getItem(
            "smartChairData"
        )
    ) || {

        sitting: {

            Mon: 120,
            Tue: 180,
            Wed: 150,
            Thu: 210,
            Fri: 165,
            Sat: 90,
            Sun: 0

        },

        posture: {

            good: 95,
            slouch: 25

        },

        focus: 18

    };


/* =====================================================
   SAVE DATA
===================================================== */

function saveData() {

    localStorage.setItem(
        "smartChairData",
        JSON.stringify(
            smartChairData
        )
    );

}


/* =====================================================
   SAVE CURRENT SESSION
===================================================== */

function saveCurrentSession() {

    if (!breakStartTime) {
        return;
    }


    const elapsedMinutes =
        Math.floor(
            (
                Date.now() -
                breakStartTime
            ) / 60000
        );


    if (elapsedMinutes <= 0) {
        return;
    }


    const days = [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat"
    ];


    const today =
        days[
            new Date().getDay()
        ];


    if (
        !smartChairData.sitting[today]
    ) {

        smartChairData.sitting[today] =
            0;

    }


    smartChairData.sitting[today] +=
        elapsedMinutes;


    saveData();

    updateDashboard();

    createCharts();

}


/* =====================================================
   FORMAT MINUTES
===================================================== */

function formatMinutes(totalMinutes) {

    totalMinutes =
        Math.max(
            0,
            Math.round(totalMinutes)
        );


    const hours =
        Math.floor(
            totalMinutes / 60
        );


    const minutes =
        totalMinutes % 60;


    if (hours > 0) {

        return (
            hours +
            "h " +
            minutes +
            "m"
        );

    }


    return minutes + "m";

}


/* =====================================================
   UPDATE DASHBOARD
===================================================== */

function updateDashboard() {

    const days = [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat"
    ];


    const today =
        days[
            new Date().getDay()
        ];


    const sitting =
        smartChairData.sitting[today] || 0;


    const good =
        smartChairData.posture.good || 0;


    const slouch =
        smartChairData.posture.slouch || 0;


    const focus =
        smartChairData.focus || 0;


    /* -----------------------------------------------
       DASHBOARD CARDS
    ----------------------------------------------- */

    document.getElementById(
        "todaySitting"
    ).textContent =
        formatMinutes(sitting);


    document.getElementById(
        "todayGood"
    ).textContent =
        good + "m";


    document.getElementById(
        "todaySlouch"
    ).textContent =
        slouch + "m";


    document.getElementById(
        "todayFocus"
    ).textContent =
        focus + "m";


    /* -----------------------------------------------
       ACTIVITY
    ----------------------------------------------- */

    document.getElementById(
        "goodPostureTime"
    ).textContent =
        good + " minutes";


    document.getElementById(
        "slouchTime"
    ).textContent =
        slouch + " minutes";


    document.getElementById(
        "focusTime"
    ).textContent =
        focus + " minutes";


    /* -----------------------------------------------
       POSTURE PAGE
    ----------------------------------------------- */

    document.getElementById(
        "postureGoodPage"
    ).textContent =
        good + " minutes";


    document.getElementById(
        "postureSlouchPage"
    ).textContent =
        slouch + " minutes";


    /* -----------------------------------------------
       FOCUS PAGE
    ----------------------------------------------- */

    document.getElementById(
        "focusPageTime"
    ).textContent =
        focus + " minutes";


    /* -----------------------------------------------
       ANALYTICS
    ----------------------------------------------- */

    document.getElementById(
        "analyticsGood"
    ).textContent =
        good + " minutes";


    document.getElementById(
        "analyticsSlouch"
    ).textContent =
        slouch + " minutes";


    document.getElementById(
        "analyticsFocus"
    ).textContent =
        focus + " minutes";

}


/* =====================================================
   CREATE BAR CHART
===================================================== */

function createCharts() {

    createChart(
        "sittingChart"
    );


    createChart(
        "analyticsChart"
    );

}


/* =====================================================
   CREATE INDIVIDUAL CHART
===================================================== */

function createChart(chartId) {

    const chart =
        document.getElementById(
            chartId
        );


    if (!chart) {
        return;
    }


    chart.innerHTML = "";


    const days = [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun"
    ];


    const values =
        days.map(
            day =>
                smartChairData.sitting[day] || 0
        );


    const maxValue =
        Math.max(
            ...values,
            60
        );


    days.forEach(
        (day, index) => {

            const value =
                values[index];


            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "bar-wrapper";


            const valueLabel =
                document.createElement(
                    "div"
                );


            valueLabel.className =
                "bar-value";


            valueLabel.textContent =
                formatMinutes(value);


            const bar =
                document.createElement(
                    "div"
                );


            bar.className =
                "bar";


            const height =
                Math.max(
                    2,
                    (value / maxValue) * 220
                );


            bar.style.height =
                height + "px";


            const label =
                document.createElement(
                    "div"
                );


            label.className =
                "bar-label";


            label.textContent =
                day;


            wrapper.appendChild(
                valueLabel
            );


            wrapper.appendChild(
                bar
            );


            wrapper.appendChild(
                label
            );


            chart.appendChild(
                wrapper
            );

        }
    );

}


/* =====================================================
   INITIAL LOAD
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateDashboard();

        createCharts();

    }
);
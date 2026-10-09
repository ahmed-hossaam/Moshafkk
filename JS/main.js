const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", mobileMenu);

function mobileMenu() {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
}

// when we click on hamburger icon its close

const navLink = document.querySelectorAll(".nav-link");

navLink.forEach((n) => n.addEventListener("click", closeMenu));

function closeMenu() {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
}
// ------------------------times pray section
// let timeNow=document.getElementById("time-now");
function updateTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // تحديد ما إذا كان الوقت AM أو PM
    const ampm = hours >= 12 ? "PM" : "AM";
    // تحويل الوقت إلى نظام 12 ساعة
    hours = hours % 12;
    // إذا كانت الساعة 0، نضعها 12
    hours = hours ? hours : 12;
    // إضافة صفر للأرقام الصغيرة (مثل 7 تصبح 07)
    const timeString = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${ampm}`;
    document.getElementById("time-now").textContent = timeString;
}
// تحديث الوقت كل ثانية
setInterval(updateTime, 1000);

// ----
let todayDate = document.getElementById("today-date");

getTime();

function getTime() {
    fetch("https://alquran.vip/APIs/getPrayerTimes")
        .then((response) => response.json())

        .then((data) => {
            //about-todays
            var weekDay = data.date.date_hijri.weekday.ar;
            var day = data.date.date_hijri.day;
            var month = data.date.date_hijri.month.ar;
            var year = data.date.date_hijri.year;
            var dateEn = data.date.date_en;

            todayDate.innerHTML += `
            <!--
            <div class="date-en">
                <span>${dateEn}</span> 
            </div>
            -->
            <div class="today-date">
                <span>${weekDay}</span> 
                <span>(${day}</span> 
                <span>${month}</span> 
                <span>${year})</span> 
            </div>
        `;
        });
}
let cardFajr = document.getElementById("card-الفجر");
let cardSunrise = document.getElementById("card-الشروق");
let cardDhuhr = document.getElementById("card-الظهر");
let cardAsr = document.getElementById("card-العصر");
let cardMaghrib = document.getElementById("card-المغرب");
let cardIsha = document.getElementById("card-العشاء");
getPrayTime();

function getPrayTime() {
    fetch(
        "https://api.aladhan.com/v1/timingsByCity?city=cairo&country=egypt&method=8"
    )
        .then((response) => response.json())

        .then((data) => {
            //cards times pray
            let timeFajr = data.data.timings.Fajr;
            var timeSunrise = data.data.timings.Sunrise;
            var timeDhuhr = data.data.timings.Dhuhr;
            var timeAsr = data.data.timings.Asr;
            var timeMaghrib = data.data.timings.Maghrib;
            var timeIsha = data.data.timings.Isha;

            timeFajr = formatTime(timeFajr);
            timeSunrise = formatTime(timeSunrise);
            timeDhuhr = formatTime(timeDhuhr);
            timeAsr = formatTime(timeAsr);
            timeMaghrib = formatTime(timeMaghrib);
            timeIsha = formatTime(timeIsha);
            function formatTime(time) {
                let [hour, minute] = time.split(":");
                let ampm = hour >= 12 ? "PM" : "AM";
                hour = hour % 12;
                hour = hour ? hour : 12;
                return `${hour}:${minute} ${ampm}`;
            }
            cardFajr.innerHTML += `
                <div class="circle">
                <p>${timeFajr}</p>
                </div>
                <h2>الفجر</h2>
                `;
            cardSunrise.innerHTML += `
                <div class="circle">
                <p>${timeSunrise}</p>
                </div>
                <h2>الشروق</h2>
                `;
            cardDhuhr.innerHTML += `
                <div class="circle">
                <p>${timeDhuhr}</p>
                </div>
                <h2>الظهر</h2>
                `;
            cardAsr.innerHTML += `
                <div class="circle">
                <p>${timeAsr}</p>
                </div>
                <h2>العصر</h2>
                `;
            cardMaghrib.innerHTML += `
                <div class="circle">
                <p>${timeMaghrib}</p>
                </div>
                <h2>المغرب</h2>
                `;
            cardIsha.innerHTML += `
                <div class="circle">
                <p>${timeIsha}</p><br>
                </div>
                <h2>العشاء</h2>
                `;
        });
}

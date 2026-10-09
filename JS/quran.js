let SurahsContainer = document.querySelector('.surahContainer');
getSurahs();

function getSurahs() {
    fetch("https://api.alquran.cloud/v1/meta")
    .then(response => response.json())
    .then(data => {
        let surahs = data.data.surahs.references;
        SurahsContainer.innerHTML = "";
        surahs.forEach((surah, index) => {
            SurahsContainer.innerHTML += `
                <div class="surah">
                    <p>${surah.name}</p>
                    <p>${surah.englishName}</p>
                </div>
            `;
        });

        let popup = document.querySelector('.surah-popup');
        let surahName = document.querySelectorAll(".surah");
        let AyatContainer = document.querySelector(".ayat");

        surahName.forEach((title, index) => {
            title.addEventListener('click', () => {
                fetch(`https://api.alquran.cloud/v1/surah/${index + 1}`)
                .then(response => response.json())
                .then(data => {
                    AyatContainer.innerHTML = "";
                    let surahName = data.data.name;
                    let surahNumber = data.data.numberOfAyahs;
                    let Ayat = data.data.ayahs;

                    AyatContainer.innerHTML += `
                        <h1 class="surah-name">${surahName}</h1>
                        <h1 class="surah-number">عدد الايات: ${surahNumber}</h1>
                    `;

                    let allAyatText = "";
                    Ayat.forEach(aya => {
                        allAyatText += `
                            <span class="aya-text">${aya.text}</span>
                            <span class="label" style="font-size:35px; color:#B17457;font-family: quran;">﴿${aya.numberInSurah}﴾</span>
                        `;
                    });

                    popup.classList.add('active');
                    document.body.style.overflow = 'hidden';
                    AyatContainer.innerHTML += `<span id="ayats">${allAyatText}</span>`;
                });
            });
        });

        let closePopup = document.querySelector('.close-popup');
        closePopup.addEventListener('click', () => {
            popup.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    })
    .catch(error => console.error("Error fetching Surahs:", error));
}
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
let doaaContainer = document.querySelector(".doaa-container");

function getDoaa() {
    fetch(
        "https://raw.githubusercontent.com/nawafalqari/azkar-api/56df51279ab6eb86dc2f6202c7de26c8948331c1/azkar.json"
    )
        .then((response) => response.json())
        .then((data) => {
            doaaContainer.innerHTML = "";

            let doaa = Object.keys(data)[6];
            let contentDoaa = data[doaa];

            doaaContainer.innerHTML += `
                <div class="surah">
                    ${contentDoaa
                    .map(
                        (zekr) => `
                        <p>${zekr.content.slice(
                            6,
                            zekr.content.length - 43
                        )}</p>
                        <div class="dashed">
                            <span class="dashed-line"></span>
                        </div>
                    `
                    )
                    .join("")} 
                </div>
            `;

            console.log(doaa);
            console.log(contentDoaa);
        })
        .catch((error) => console.error("Error fetching Doaa:", error));
}

getDoaa();
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
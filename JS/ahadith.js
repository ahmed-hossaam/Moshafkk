let hadithContainer = document.querySelector(".container-hadith");

function hadith_out(){
    fetch("https://hadis-api-id.vercel.app/hadith/abu-dawud?page=2&limit=300")
    .then((response) => response.json())
    .then(data =>{
        hadithContainer.innerHTML = "";

        let hadith =data.items
        let numHadith=60;

        for (let i = 0 ;i < numHadith ;i++){
            hadithContainer.innerHTML+=`
            <div class="hadith">
                    <h3>حديث ${i + 1}:</h3>
                    <p>${hadith[i].arab}</p>     
                    <div class="dashed">
                        <span class="dashed-line"></span>
                    </div>
            </div>
            `
        }
    });
}
hadith_out();
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
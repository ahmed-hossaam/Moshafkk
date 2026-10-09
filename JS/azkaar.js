// let azkarContainer = document.querySelector(".container-azkar");
// next1 = document.querySelector('.buttons1 .next1'),
//     prev1 = document.querySelector('.buttons1 .prev1'),
//     number1 = document.querySelector('.buttons1 .number1');
// let azkarIndex = 0;

// function getazkarSabahMasaa() {
//     fetch("https://www.hisnmuslim.com/api/ar/27.json")
//         .then((response) => response.json())
//         .then(data => {
//             let ARABIC_TEXT = Object.keys(data)[0];
//             let azkar = data[ARABIC_TEXT];
//             azkarContainer.innerHTML += `
//         <div class="content">
//         <div class="container-content">
//         <h3>${ARABIC_TEXT}</h3> 
//         ${azkar.map(zekr => `
//             <p>${zekr.ARABIC_TEXT}</p>
//             <!--
//             <span class="loop">التكرار: ${zekr.REPEAT}</span>
//             -->
//             `)}
//             </div>
//             </div>
//             `;
//             next1.addEventListener('click', () => {
//                 azkarIndex == 23 ? azkarIndex = 0 : azkarIndex++;
//                 getazkarSabahMasaa()
//             })
//             prev1.addEventListener('click', () => {
//                 azkarIndex == 0 ? azkarIndex = 23 : azkarIndex--;
//                 getazkarSabahMasaa()
//             })
//             function getazkarSabahMasaa() {
//                 azkarContainer.innerText = azkar[azkarIndex].ARABIC_TEXT;
//                 number1.innerText = `24 - ${azkarIndex + 1}`
//             }
//             console.log(azkar);
//         })
//     // .catch(error => console.error("Error fetching Azkar:", error));
// }

// getazkarSabahMasaa();


let azkarContainer = document.querySelector(".container-azkar");
let next1 = document.querySelector('.buttons1 .next1');
let prev1 = document.querySelector('.buttons1 .prev1');
let number1 = document.querySelector('.buttons1 .number1');
let azkarIndex = 0;

function getazkarSabahMasaa() {
    fetch("https://www.hisnmuslim.com/api/ar/27.json")
        .then((response) => response.json())
        .then(data => {
            let ARABIC_TEXT = Object.keys(data)[0];
            let azkar = data[ARABIC_TEXT];
            azkarContainer.innerHTML = `
                <div class="content">
                    <div class="container-content">
                        <h3>${ARABIC_TEXT}</h3>
                        <p>${azkar[azkarIndex].ARABIC_TEXT}</p>
                        <!--
                        <span class="loop">التكرار: ${azkar[azkarIndex].REPEAT}</span>
                        -->
                    </div>
                </div>
            `;
            number1.innerText = `${azkarIndex + 1} / 24`;

            next1.addEventListener('click', () => {
                azkarIndex = (azkarIndex + 1) % 24;
                updateContent(azkar, ARABIC_TEXT);
            });

            prev1.addEventListener('click', () => {
                azkarIndex = (azkarIndex - 1 + 24) % 24;
                updateContent(azkar, ARABIC_TEXT);
            });
        })
        .catch(error => console.error("Error fetching Azkar:", error));
}

function updateContent(azkar, ARABIC_TEXT) {
    azkarContainer.innerHTML = `
        <div class="content">
            <div class="container-content">
                <h3>${ARABIC_TEXT}</h3>
                <p>${azkar[azkarIndex].ARABIC_TEXT}</p>
                <!--
                <span class="loop">التكرار: ${azkar[azkarIndex].REPEAT}</span>
                -->
            </div>
        </div>
    `;
    number1.innerText = `${azkarIndex + 1} / 24`;
}   

getazkarSabahMasaa();


// ---------------------- 
let salahAzkarContainer = document.querySelector(".containerSalah-azkar");
let salahAzkarIndex = 0;

function getazkarSalah() {
        fetch(
            "https://raw.githubusercontent.com/nawafalqari/azkar-api/56df51279ab6eb86dc2f6202c7de26c8948331c1/azkar.json"
        )
            .then((response) => response.json())
            .then((data) => {
                salahAzkarContainer.innerHTML = "";
    
                let salahAzkar = Object.keys(data)[2];
                let contentAzkar = data[salahAzkar];
    
                salahAzkarContainer.innerHTML += `
                    <div class="salah-azkar">
                            <h3>${salahAzkar}</h3>
                        ${contentAzkar
                        .map(

                            (zekr) => `
                        <div class="salah-azkar-container">
                            <span>${zekr.content}</span>
                            <span class="counter">عدد المرات :${zekr.count}</span>
                        </div>
                            `
                        )
                        } 
                    </div>
                `;
    
                console.log(salahAzkar);
                console.log(contentAzkar);
            })
            // .catch((error) => console.error("Error fetching Doaa:", error));
    }
    
    getazkarSalah()


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
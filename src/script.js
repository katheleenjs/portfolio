const contact = document.querySelector(".contact");
const glow = document.querySelector(".contact-glow");

let mouseX = 0;
let mouseY = 0;

let currentX = 0;
let currentY = 0;

contact.addEventListener("mousemove", (e) => {

    const rect = contact.getBoundingClientRect();

    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

});

function animateGlow() {

    currentX += (mouseX - currentX) * 0.12;
    currentY += (mouseY - currentY) * 0.12;

    glow.style.transform = `translate3d(${currentX - 120}px, ${currentY - 120}px, 0)`;

    requestAnimationFrame(animateGlow);
}

animateGlow();

const reveals = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver((entries)=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            entry.target.classList.add("active");

        }

    });

},{
    threshold:.15
});

reveals.forEach(item=>observer.observe(item));

const toggle = document.getElementById("theme-toggle");
const icon = toggle.querySelector("i");

// Recupera o tema salvo
const savedTheme = localStorage.getItem("theme");

// Se o usuário já escolheu o tema claro
if(savedTheme === "light"){

    document.body.classList.add("light");

    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");

}else{

    document.body.classList.remove("light");

    icon.classList.remove("fa-sun");
    icon.classList.add("fa-moon");

}

// Clique no botão
toggle.addEventListener("click",()=>{

    document.body.classList.toggle("light");

    if(document.body.classList.contains("light")){

        localStorage.setItem("theme","light");

        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");

    }else{

        localStorage.setItem("theme","dark");

        icon.classList.remove("fa-sun");
        icon.classList.add("fa-moon");

    }

});

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {

    if(window.scrollY > 40){

        navbar.classList.add("scrolled");

    }else{

        navbar.classList.remove("scrolled");

    }

});

const phrases = [

    "escuta.",
    "observa.",
    "questiona.",
    "prototipa.",
    "testa.",
    "evolui."

];

const text = document.getElementById("typing-text");

let phraseIndex = 0;
let letterIndex = 0;
let deleting = false;

function typeEffect(){

    const current = phrases[phraseIndex];

    if(!deleting){

        text.textContent = current.substring(0,letterIndex);

        letterIndex++;

        if(letterIndex > current.length){

            deleting = true;

            setTimeout(typeEffect,1800);

            return;

        }

    }else{

        text.textContent = current.substring(0,letterIndex);

        letterIndex--;

        if(letterIndex < 0){

            deleting = false;

            phraseIndex++;

            if(phraseIndex >= phrases.length){

                phraseIndex = 0;

            }

        }

    }

    setTimeout(typeEffect,deleting ? 35 : 70);

}

typeEffect();
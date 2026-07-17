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
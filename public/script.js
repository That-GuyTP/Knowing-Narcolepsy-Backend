window.onload = () => {
    createStars();
};

window.onresize = () => {
    //Clear Current Stars
    const existingStars = document.querySelectorAll('.star');
    existingStars.forEach(star => star.remove());
    createStars();
};

function createStars() {
    const numberOfStars = 70;
    const pageHeight = window.innerHeight;
    const pageWidth = window.innerWidth;
    
    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement("div");
        star.className = "star";
        star.innerHTML = "★";

        star.style.position = 'absolute';
        star.style.top = `${Math.random() * (pageHeight - 50)}px`;
        star.style.left = `${Math.random() * (pageWidth - 50)}px`;
        document.body.append(star);
    };
}
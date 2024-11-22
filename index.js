const hexColors = [
    "#FF5733",  // Red-Orange
    "#33FF57",  // Green
    "#5733FF",  // Purple
    "#FF33A1",  // Pink
    "#33A1FF",  // Light Blue
    "#FFFC33",  // Yellow
    "#33FFC7",  // Teal
    "#9B59B6",  // Purple
    "#F39C12",  // Orange
    "#1ABC9C"   // Turquoise
];
const interval = 500;
var gameIntervalPointer = undefined;
var CONTAINER = undefined;
var STARTBTN = undefined;
var SCORE = undefined;
const audio = new Audio('collision.mp3');
document.addEventListener("DOMContentLoaded", () => {
    CONTAINER = document.getElementById("container")
    SCORE = document.getElementById("score")
    STARTBTN = document.getElementById("start-btn")
    STARTBTN.addEventListener('click', startGame)
})
function startGame() {
    STARTBTN.style.display = 'none';
    SCORE.style.display = 'block';
    gameIntervalPointer = setInterval(() => {
        const randomNumber = Math.floor(Math.random() * 10);
        const color = hexColors[randomNumber]
        const el = createElement('div', 'particle', 'particle')
        el.style.backgroundColor = color;
        const y = Math.floor(Math.random() * container.getBoundingClientRect().width+1)
        el.style.left = `${y}px`
        el.style.top = `${-200}px`
        container.append(el)
        el.addEventListener("click", (e) => {

            const elCrush = e.target;
            const color = el.style.backgroundColor
            console.log(" el.style.backgroundColor: ",  el.style.backgroundColor)
            elCrush.style.backgroundColor = 'transparent'
            elCrush.classList.add('particle-crash-container');
            elCrush.style.top = `${elCrush.getBoundingClientRect().y}px`
            elCrush.style.left = `${elCrush.getBoundingClientRect().x}px`
            elCrush.style.transition = 'none';
            SCORE.textContent++
            SCORE.style.color =color
            
            if(!audio.paused) {
                audio.pause();
                audio.currentTime = 0; 
            }
            audio.play();
            for (let index = 0; index < 6; index++) {
                const crash = createElement('div', 'particle-crash', 'particle-crash')
                crash.style.backgroundColor = color
                elCrush.append(crash)   
            }
    
            for (let index = 0; index < el.childNodes.length; index++) {
                const element = el.childNodes[index];
                setTimeout(() => {
                const y = Math.floor(Math.random() * container.getBoundingClientRect().height) - (container.getBoundingClientRect().height/2)
                const x = Math.floor(Math.random() * container.getBoundingClientRect().width) - (container.getBoundingClientRect().width/2)
                const animation = element.animate(
                [
                    { transform: `translateX(0) translateY(0)` },      // Keyframe 1
                    { transform: `translateX(${x}px) translateY(${y}px)`, opacity: 0 }  // Keyframe 2
                ],
                {
                    duration: 1000, // Animation duration in ms
                    easing: "linear",
                    iterations: 1,  // Number of times to repeat
                }
                );
                    animation.onfinish = () => {
                        element.style.transform = `translateX(-400px) translateY(${y}px)`
                        element.remove()
                    }
                }, 1*index)
            }
        })
        setTimeout(() => {
            el.style.top = `${container.getBoundingClientRect().height}px`
        }, 10)
       }, interval)
}

function createElement(tag, id, className) {
    const newEl = document.createElement(tag)
    if(id) newEl.id = id
    if(className) newEl.classList.add(className);
    return newEl;
  }
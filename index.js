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
var lastDeduction = 0;
const speed = 7000;
const interval = 500;
var gameIntervalPointer = undefined;
var CONTAINER = undefined;
var STARTBTN = undefined;
var STOPBTN = undefined;
var CONTINUEBTN = undefined;
var PAUSEBTN = undefined;
var SCORE = undefined;
var gameState = 'notPlaying'
const audio = new Audio('collision.mp3');
var PARTICLESANIMATIONS = {};
let counter = 0;
var specialBall = false;


document.addEventListener("DOMContentLoaded", () => {
    CONTAINER = document.getElementById("container")
    SCORE = document.getElementById("score")
    STARTBTN = document.getElementById("start-btn")
    STOPBTN = document.getElementById("stop-btn")
    PAUSEBTN = document.getElementById("pause-btn")
    CONTINUEBTN = document.getElementById("continue-btn")
    STARTBTN.addEventListener('click', startGame)
    PAUSEBTN.addEventListener('click', pauseGame)
    STOPBTN.addEventListener('click', stopGame)
    CONTINUEBTN.addEventListener('click', continueGame)
})

function generateUniqueKey() {
    return `key_${++counter}`;
}

function startBtnDisappear(onfinish) {
    const anim = STARTBTN.animate(
        [
            { transform: `scale(1) translate(-50%, -50%)` },
            { transform: `scale(0.75) translate(-50%, -50%)`},
            { transform: `scale(0.5) translate(-50%, -50%)` },
            { transform: `scale(0.25) translate(-50%, -50%)`},
            { transform: `scale(0) translate(-50%, -50%)` },
        ],
        {
            duration: 500, // Animation duration in ms
            easing: "ease-out",
            iterations: 1,  // Number of times to repeat
        }
    )
    anim.onfinish = () => {
        STARTBTN.style.display = 'none';
        if(onfinish) onfinish()
    }
}
function showPauseBtnAndScore() {
    PAUSEBTN.style.display = 'block';
    SCORE.style.display = 'block';
    SCORE.animate(
        [
            { transform: `scale(0)` },
            { transform: `scale(0.25)`},
            { transform: `scale(0.5)` },
            { transform: `scale(0.75)`},
            { transform: `scale(1)` },
        ],
        {
            duration: 500, // Animation duration in ms
            easing: "ease-in",
            iterations: 1,  // Number of times to repeat
        }
    )

    const anim = PAUSEBTN.animate(
        [
            { transform: `scale(0)` },
            { transform: `scale(0.25)`},
            { transform: `scale(0.5)` },
            { transform: `scale(0.75)`},
            { transform: `scale(1)` },
        ],
        {
            duration: 500, // Animation duration in ms
            easing: "ease-in",
            iterations: 1,  // Number of times to repeat
        }
    )
    anim.onfinish = throwParticles
}

function startGame() {
    gameState = 'playing'
    startBtnDisappear(() => {
        showPauseBtnAndScore()
    })
}

function throwParticles() {
    gameIntervalPointer = setInterval(() => {
        const particle = createParticle()
        
        const particleAnimation = particle.animate(
            [
                { top: `-200px` },      // Keyframe 1
                { top: `${container.getBoundingClientRect().height + particle.getBoundingClientRect().height}px`}  // Keyframe 2
            ],
            {
                duration: speed-lastDeduction, // Animation duration in ms
                easing: "linear",
                iterations: 1,  // Number of times to repeat
            }
        )
        const key = generateUniqueKey()
        PARTICLESANIMATIONS[key] = particleAnimation
        particleAnimation.onfinish = () => {
            particle.remove();
            PARTICLESANIMATIONS[key].cancel();
            delete PARTICLESANIMATIONS[key]
        }

        container.append(particle)
        particle.addEventListener("click", (e) => {
            if(e.target.dataset.color){
                const particles = document.querySelectorAll(`[data-bgcolor='${e.target.dataset.color}']`)
                particles.forEach((e) => breakParticle(e))
                breakParticle(e)
            } else {
                breakParticle(e)
            }
        })
    }, interval)
}

function createParticle() {
    const particle = createElement('div', 'particle', 'particle')
    const randomNumber = Math.floor(Math.random() * 10);
    const color = hexColors[randomNumber]
    if(specialBall) {
        particle.style.border = `${color} 1px solid`;
        particle.style.backgroundColor = `#fff`;
        specialBall = false
        particle.setAttribute('data-color', color)
    } else {
        particle.style.backgroundColor = color;
        particle.setAttribute('data-bgcolor', color)
    }
    const y = Math.floor(Math.random() * container.getBoundingClientRect().width+1)
    particle.style.left = `${(y + 60) > CONTAINER.getBoundingClientRect().width ? y - 72 : y}px`
    particle.style.top = `${-200}px`

    return particle;
}

function breakParticle(e) {
    if(gameState == 'pause') return;

    const particle = e.target ? e.target : e;
    const color = particle.dataset.color ?? particle.style.backgroundColor
    
    particle.style.backgroundColor = 'transparent'
    particle.style.border = 'transparent'
    particle.classList.add('particle-crash-container');
    particle.style.top = `${particle.getBoundingClientRect().y}px`
    particle.style.left = `${particle.getBoundingClientRect().x}px`
    particle.style.transition = 'none';
    if(gameState == 'playing'){
        SCORE.textContent++
        SCORE.style.color =color
    }
    
    if(!audio.paused) {
        audio.pause();
        audio.currentTime = 0; 
    }
    audio.play();

    for (let index = 0; index < 6; index++) {
        const crash = createElement('div', 'particle-crash', 'particle-crash')
        crash.style.backgroundColor = color
        particle.append(crash)   
    }

    for (let index = 0; index < particle.childNodes.length; index++) {
        const element = particle.childNodes[index];
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
                element.parentNode.remove();
                element.remove()
            }
        }, 1*index)
    }
    const deduction = Math.floor(parseInt(SCORE.textContent)/5)*100;
    if(lastDeduction != deduction) {
        lastDeduction = deduction;
        clearInterval(gameIntervalPointer)
        gameIntervalPointer = undefined;
        specialBall = true
        throwParticles()
    }
}

function pauseGame() {
    gameState = 'pause'
    clearInterval(gameIntervalPointer)
    gameIntervalPointer = undefined;
    const anim = PAUSEBTN.animate(
        [
            { transform: `scale(1)` },
            { transform: `scale(0.75)`},
            { transform: `scale(0.5)` },
            { transform: `scale(0.25)`},
            { transform: `scale(0)` },
        ],
        {
            duration: 200, // Animation duration in ms
            easing: "ease-in",
            iterations: 1,  // Number of times to repeat
        }
    )
    anim.onfinish = () => {
        PAUSEBTN.style.display = 'none'
        showStopAndContinueBtn()
    }
    setTimeout(() => {
        Object.keys(PARTICLESANIMATIONS).forEach(key => PARTICLESANIMATIONS[key].pause())
    }, 200)
    
}

function showStopAndContinueBtn() {
    CONTINUEBTN.style.display = 'block'
    STOPBTN.style.display = 'block'

    CONTINUEBTN.animate(
        [
            { transform: `scale(0)` },
            { transform: `scale(0.25)`},
            { transform: `scale(0.5)` },
            { transform: `scale(0.75)`},
            { transform: `scale(1)` },
        ],
        {
            duration: 200, // Animation duration in ms
            easing: "ease-in",
            iterations: 1,  // Number of times to repeat
        }
    )
    STOPBTN.animate(
        [
            { transform: `scale(0)` },
            { transform: `scale(0.25)`},
            { transform: `scale(0.5)` },
            { transform: `scale(0.75)`},
            { transform: `scale(1)` },
        ],
        {
            duration: 200, // Animation duration in ms
            easing: "ease-in",
            iterations: 1,  // Number of times to repeat
        }
    )
}

function continueGame() {
    gameState = 'playing'
    hideElementWithAnimation(STOPBTN,() => {
        STOPBTN.style.display = 'none'
    })
    hideElementWithAnimation(CONTINUEBTN, () => {
        CONTINUEBTN.style.display = 'none'
        PAUSEBTN.style.display = 'block'
        showElementWithAnimation(PAUSEBTN, () => {
            Object.keys(PARTICLESANIMATIONS).forEach(key => PARTICLESANIMATIONS[key].play())
            setTimeout(throwParticles, 100)
        })
    })
    
}

function stopGame() {
    gameState = 'noPlaying'

    const stpBtnAnimation = STOPBTN.animate(
        [
            { transform: `scale(1)` },
            { transform: `scale(0.75) rotate(90deg)`},
            { transform: `scale(0.5) rotate(180deg)` },
            { transform: `scale(0.25) rotate(270deg)`},
            { transform: `scale(0) rotate(3600deg)`, display: 'none' },
        ],
        {
            duration: 500, // Animation duration in ms
            easing: "ease-out",
            iterations: 1,  // Number of times to repeat
        }
    )
    stpBtnAnimation.onfinish = () => {
        STOPBTN.style.display = 'none'
    }
    const ctnBtnAnimation = CONTINUEBTN.animate(
        [
            { transform: `scale(1)` },
            { transform: `scale(0.75) rotate(90deg)`},
            { transform: `scale(0.5) rotate(180deg)` },
            { transform: `scale(0.25) rotate(270deg)`},
            { transform: `scale(0) rotate(3600deg)`, display: 'none' },
        ],
        {
            duration: 500, // Animation duration in ms
            easing: "ease-out",
            iterations: 1,  // Number of times to repeat
        }
    )

    ctnBtnAnimation.onfinish = () => {
        CONTINUEBTN.style.display = 'none'


        const aniScore = SCORE.animate(
            [
                { top: '50%', right: '50%', transform: 'translate(50%, -100%)', fontSize: '15rem' },
            ],
            {
                duration: 1000, // Animation duration in ms
                easing: "ease-out",
                iterations: 1,  // Number of times to repeat
            }
        )
        aniScore.onfinish = () => {
            SCORE.classList.add('final-score');
            setTimeout(() => document.querySelectorAll('.particle').forEach(e =>  breakParticle(e)), 200)
        }
    }
}

function createElement(tag, id, className) {
    const newEl = document.createElement(tag)
    if(id) newEl.id = id
    if(className) newEl.classList.add(className);
    return newEl;
}

function showElementWithAnimation(element, onfinish, duration) {
    const animation = element.animate(
        [
            { transform: `scale(0)` },
            { transform: `scale(0.25)`},
            { transform: `scale(0.5)` },
            { transform: `scale(0.75)`},
            { transform: `scale(1)` },
        ],
        {
            duration: duration ?? 200, // Animation duration in ms
            easing: "ease-in",
            iterations: 1,  // Number of times to repeat
        }
    )
    if(onfinish) animation.onfinish = onfinish
}

function hideElementWithAnimation(element, onfinish) {
    const animation = element.animate(
        [
            { transform: `scale(1)` },
            { transform: `scale(0.75)`},
            { transform: `scale(0.5)` },
            { transform: `scale(0.25)`},
            { transform: `scale(0)` },
        ],
        {
            duration: 200, // Animation duration in ms
            easing: "ease-in",
            iterations: 1,  // Number of times to repeat
        }
    )
    if(onfinish) animation.onfinish = onfinish
}
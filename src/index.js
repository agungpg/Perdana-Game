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
const goldColor = 'rgb(255, 215, 0)';
var lastDeduction = 0;
const speed = 7000;
const interval = 500;
var gameIntervalPointer = undefined;
var CONTAINER = undefined;
var LIFECONTAINER = undefined;
var STARTBTN = undefined;
var STOPBTN = undefined;
var CONTINUEBTN = undefined;
var PAUSEBTN = undefined;
var SCORE = undefined;
var gameState = 'notPlaying'
const audio = new Audio('assets/audio/collision.mp3');
const mediumExplosionAudio = new Audio('assets/audio/medium-explosion.mp3');
const explosionAudio = new Audio('assets/audio/explosion.mp3');
var PARTICLESANIMATIONS = {};
let counter = 0;
var specialParticle = false;
var verySpacialParticle = false;
var PARTICLESEL = []


document.addEventListener("DOMContentLoaded", () => {
    CONTAINER = document.getElementById("container")
    SCORE = document.getElementById("score")
    STARTBTN = document.getElementById("start-btn")
    STOPBTN = document.getElementById("stop-btn")
    PAUSEBTN = document.getElementById("pause-btn")
    CONTINUEBTN = document.getElementById("continue-btn")
    LIFECONTAINER = document.getElementById("life-container")
    generateLifeHeart()
    STARTBTN.addEventListener('click', startGame)
    PAUSEBTN.addEventListener('click', pauseGame)
    STOPBTN.addEventListener('click', stopGame)
    CONTINUEBTN.addEventListener('click', continueGame)
})
function generateLifeHeart() {
    for (let index = 0; index < 10; index++) {
        const haert = createElement('img', `heart-${index+1}`, 'heart')
        haert.src = './src/assets/icons/heart.png'
        LIFECONTAINER.append(haert)
    }
}

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
    document.getElementById("life-container").style.display = 'flex';
    startBtnDisappear(() => {
        showPauseBtnAndScore()
    })
}

function takeTheHeartLife() {
    const heart = document.querySelectorAll(".heart");
    if(heart.length > 0) {
        heart[heart.length-1].remove()
    } else {
        clearInterval(gameIntervalPointer)
        gameIntervalPointer = undefined;
        Object.keys(PARTICLESANIMATIONS).forEach(key => PARTICLESANIMATIONS[key]?.pause())
        hideElementWithAnimation(PAUSEBTN,() => {
            PAUSEBTN.style.display = 'none'
            stopGame()
        })
    }
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
        particle.setAttribute('data-key', key)
        PARTICLESANIMATIONS[key] = particleAnimation
        particleAnimation.onfinish = () => {
            takeTheHeartLife()
            PARTICLESANIMATIONS[key].cancel();
            delete PARTICLESANIMATIONS[key]
        }

        container.append(particle)
        particle.addEventListener('touchstart', (e) => {
            if(e.target.dataset.color){
                const particles = document.querySelectorAll(`[data-bgcolor='${e.target.dataset.color}']`)
                particles.forEach((e) => breakParticle(e))
                breakParticle(e)
            } else {
                console.log("e.target.style.backgroundColor: ", e.target.style.backgroundColor)
                if(e.target.classList.contains("very-special-particle")) {
                    document.querySelectorAll('.particle').forEach(ne =>  breakParticle(ne))
                } 
                breakParticle(e)
            }
        })
        particle.addEventListener("click", (e) => {
            if(e.target.dataset.color){
                const particles = document.querySelectorAll(`[data-bgcolor='${e.target.dataset.color}']`)
                particles.forEach((e) => breakParticle(e))
                breakParticle(e)
            } else {
                console.log("e.target.style.backgroundColor: ", e.target.style.backgroundColor)
                if(e.target.classList.contains("very-special-particle")) {
                    document.querySelectorAll('.particle').forEach(ne =>  breakParticle(ne))
                } 
                breakParticle(e)
            }
        })
    }, interval)
}

function createParticle() {
    const particle = createElement('div', 'particle', 'particle')
    const randomNumber = Math.floor(Math.random() * 10);
    const color = hexColors[randomNumber]
    if(specialParticle) {
        particle.style.border = `${color} 3px solid`;
        particle.style.backgroundColor = `#fff`;
        specialParticle = false
        particle.setAttribute('data-color', color)
    } else if(verySpacialParticle) {
        particle.classList.add("very-special-particle")
        verySpacialParticle = false;
    } else {
        particle.style.backgroundColor = color;
        particle.setAttribute('data-bgcolor', color)
    }
    const y = Math.floor(Math.random() * container.getBoundingClientRect().width+1)
    particle.style.left = `${(y + 60) > CONTAINER.getBoundingClientRect().width ? y - 72 : y}px`
    particle.style.top = `${-200}px`

    return particle;
}


function stopAudio() {
    audio.pause();
    audio.currentTime = 0; 
}
function stopMediumExplosionAudio() {
    mediumExplosionAudio.pause();
    mediumExplosionAudio.currentTime = 0; 
}
function stopExplosionAudio() {
    explosionAudio.pause();
    explosionAudio.currentTime = 0; 
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
    const isExplosionPlaying = !explosionAudio.paused && explosionAudio.currentTime > 0 && !explosionAudio.ended;
    const isMediumExplosionPlaying = !mediumExplosionAudio.paused && mediumExplosionAudio.currentTime > 0 && !mediumExplosionAudio.ended;

    stopMediumExplosionAudio()
    stopExplosionAudio()
    if(gameState == 'playing'){
        SCORE.textContent++
        SCORE.style.color = particle.classList.contains("very-special-particle") ? '#FFD700' :color
        
    }
    if(particle.classList.contains("very-special-particle")) {
        stopAudio()
        stopMediumExplosionAudio()
        explosionAudio.play()
    } else if(particle.dataset.color && !isExplosionPlaying) {
        stopAudio()
        mediumExplosionAudio.play()
    } else if(!isExplosionPlaying && !isMediumExplosionPlaying){
        stopAudio()
        audio.play();
    }

    for (let index = 0; index < 6; index++) {
        const crash = createElement('div', 'particle-crash', 'particle-crash')
        if(particle.dataset.color) {
            crash.style.border = `1px ${color} solid`;
            crash.style.backgroundColor = 'transparent'
        } else crash.style.backgroundColor = color
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
                    duration: 500, // Animation duration in ms
                    easing: "linear",
                    iterations: 1,  // Number of times to repeat
                }
            );
            animation.onfinish = () => {
                element.style.transform = `translateX(-400px) translateY(${y}px)`
                element.parentNode?.remove();
                element.remove()
            }
        }, 1*index)
    }
    setTimeout(()=>{
        PARTICLESANIMATIONS[particle.dataset.key]?.cancel()
    }, 500)
    const deduction = Math.floor(parseInt(SCORE.textContent)/5)*100;
    if(lastDeduction != deduction) {
        lastDeduction = deduction;
        clearInterval(gameIntervalPointer)
        gameIntervalPointer = undefined;
      
        if(SCORE.textContent % 30 == 0)  verySpacialParticle = true
        else specialParticle = true
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
       
            Object.keys(PARTICLESANIMATIONS).forEach(key => {     
                try {
                    PARTICLESANIMATIONS[key].play()
                } catch (error) {
                    
                }
            })
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
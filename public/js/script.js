// https://developer.mozilla.org/en-US/docs/Web/API/Window/DOMContentLoaded_event
document.addEventListener('DOMContentLoaded', () => {
  console.log('library-project JS imported successfully!');
});

// dark mode
function activateDarkMode() {
  let header = document.querySelector('header');
  let body = document.querySelector('body');
  let nav = document.querySelector('nav');
  let currentHeaderTheme = header.dataset.bsTheme;
  let currentBodyTheme = body.dataset.bsTheme;
  let currentNavTheme = nav.dataset.bsTheme;

  body.style.backgroundImage = 'none';
  body.style.backgroundColor = '#060606';

  header.dataset.bsTheme = currentHeaderTheme == 'light' ? 'dark' : 'light';
  body.dataset.bsTheme = currentBodyTheme == 'light' ? 'dark' : 'light';
  nav.dataset.bsTheme = currentNavTheme == 'light' ? 'dark' : 'light';

  if (nav.dataset.bsTheme === 'dark') {
    nav.classList.add('bg-black');
    nav.classList.remove('bg-white');
    body.style.backgroundColor = 'black';
    localStorage.setItem('dark-mode', 'true'); // Set dark mode to true

    let image = document.querySelector('.dk-mode');
    image.src = '/images/dark.png'; //
  } else {
    nav.classList.add('bg-white');
    nav.classList.remove('bg-black');
    body.style.backgroundColor = '';
    body.style.backgroundImage = url('/images/background.jpg');
    localStorage.setItem('dark-mode', 'false'); // Set dark mode to false
    let image = document.querySelector('.dk-mode');
    image.src = '/images/light.png'; //
  }
}

// check for saved theme on page load
window.onload = function () {
  let savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    activateDarkMode();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Check if dark mode is activated
  if (localStorage.getItem('dark-mode') === 'true') {
    activateDarkMode();
  }
});

//dropdown:
// get all the buttons that toggle the collapse
let accButtons = document.querySelectorAll('[data-toggle="collapse"]');

// add event listener to each button
for (let i = 0; i < accButtons.length; i++) {
  accButtons[i].addEventListener('click', function () {
    // get the target collapse element
    let target = document.querySelector(this.dataset.target);

    // toggle the "show" class on the target element
    target.classList.toggle('show');

    // if the target element is shown, expand the button
    if (target.classList.contains('show')) {
      this.setAttribute('aria-expanded', 'true');
    } else {
      // if the target element is hidden, collapse the button
      this.setAttribute('aria-expanded', 'false');
    }
  });
}

const buttons = document.querySelectorAll('.btn-group-toggle .btn');
buttons.forEach(button => {
  button.addEventListener('click', () => {
    buttons.forEach(otherButton => otherButton.classList.remove('active'));
    button.classList.add('active');
  });
});

require('@lottiefiles/lottie-player/dist/lottie-player.js');

// Select the container
const container = document.querySelector('#animation-container');

// Create a new Lottie player instance
const player = container.querySelector('lottie-player');
player.load();

// Render the animation in the container
player.addEventListener('load', () => {
  player.play();
});

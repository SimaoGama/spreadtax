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

  header.dataset.bsTheme = currentHeaderTheme == 'light' ? 'dark' : 'light';
  body.dataset.bsTheme = currentBodyTheme == 'light' ? 'dark' : 'light';
  nav.dataset.bsTheme = currentNavTheme == 'light' ? 'dark' : 'light';

  if (nav.dataset.bsTheme === 'dark') {
    nav.classList.add('bg-black');
    nav.classList.remove('bg-white');
  } else {
    nav.classList.add('bg-white');
    nav.classList.remove('bg-black');
  }
}

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

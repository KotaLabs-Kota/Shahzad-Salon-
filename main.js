const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.classList.toggle('open');
  mobileMenu.classList.toggle('open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  mobileMenu.setAttribute('aria-hidden', String(!isOpen));
});

document.querySelectorAll('.mobile-menu a').forEach((link) => {
  link.addEventListener('click', () => {
    menuToggle?.classList.remove('open');
    mobileMenu?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    mobileMenu?.setAttribute('aria-hidden', 'true');
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

document.querySelector('#year').textContent = new Date().getFullYear();

const form = document.querySelector('#booking-form');
const toast = document.querySelector('.toast');
let toastTimer;
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  form.reset();
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
});

const reelChoices = [...document.querySelectorAll('.reel-choice')];
const reelVideo = document.querySelector('#reel-video');
const reelVideoFrame = document.querySelector('.reel-video-frame');
const reelPlaceholder = document.querySelector('#reel-video-placeholder');
const reelTitle = document.querySelector('#reel-video-title');
const reelCategory = document.querySelector('#reel-video-category');
const reelCurrent = document.querySelector('#reel-current-count');
const stageCurrent = document.querySelector('#stage-current');
const previousReel = document.querySelector('#reel-previous');
const nextReel = document.querySelector('#reel-next');
let activeReel = 0;

function selectReel(index, shouldPlay = false) {
  if (!reelChoices.length) return;
  activeReel = (index + reelChoices.length) % reelChoices.length;
  const choice = reelChoices[activeReel];
  const reelNumber = String(activeReel + 1).padStart(2, '0');

  reelChoices.forEach((item, itemIndex) => {
    const selected = itemIndex === activeReel;
    item.classList.toggle('is-active', selected);
    item.setAttribute('aria-selected', String(selected));
  });

  reelCurrent.textContent = reelNumber;
  stageCurrent.textContent = reelNumber;
  reelTitle.innerHTML = choice.dataset.title.replace(' the ', ' the<br />');
  reelCategory.textContent = choice.dataset.category;
  reelPlaceholder.style.backgroundImage = `linear-gradient(180deg, transparent, rgba(10,18,12,.85)), url('${choice.dataset.poster}')`;
  reelVideo.poster = choice.dataset.poster;
  reelVideoFrame.classList.remove('is-playing');

  if (shouldPlay) {
    reelVideo.src = encodeURI(`/reels/${choice.dataset.file}`);
    reelVideo.load();
    reelVideo.play().catch(() => {
      // Some browsers require an additional interaction before starting video playback.
    });
  } else {
    reelVideo.pause();
    reelVideo.removeAttribute('src');
    reelVideo.load();
  }
}

reelChoices.forEach((choice, index) => {
  choice.addEventListener('click', () => selectReel(index, true));
});
previousReel?.addEventListener('click', () => selectReel(activeReel - 1, true));
nextReel?.addEventListener('click', () => selectReel(activeReel + 1, true));
reelPlaceholder?.addEventListener('click', () => selectReel(activeReel, true));
reelVideo?.addEventListener('playing', () => reelVideoFrame.classList.add('is-playing'));
reelVideo?.addEventListener('error', () => reelVideoFrame.classList.remove('is-playing'));
reelVideo?.addEventListener('ended', () => reelVideoFrame.classList.remove('is-playing'));
reelVideo?.addEventListener('loadedmetadata', () => {
  const duration = Math.round(reelVideo.duration);
  const minutes = Math.floor(duration / 60);
  const seconds = String(duration % 60).padStart(2, '0');
  const durationLabel = reelChoices[activeReel]?.querySelector('.reel-duration');
  if (durationLabel && Number.isFinite(duration)) durationLabel.textContent = `${minutes}:${seconds}`;
});

selectReel(0, true);

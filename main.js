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

const workVideos = [...document.querySelectorAll('.work-video')];
const workVideoObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const video = entry.target;
    if (entry.isIntersecting) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
}, { threshold: 0.35 });
workVideos.forEach((video) => workVideoObserver.observe(video));

document.querySelector('#year').textContent = new Date().getFullYear();

const siteHeader = document.querySelector('.site-header');
const progressBar = document.querySelector('#scroll-progress-bar');
const navigationLinks = [...document.querySelectorAll('.desktop-nav a, .mobile-menu a:not(.mobile-phone)')];

function updateScrollUI() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
  progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  siteHeader.classList.toggle('is-scrolled', window.scrollY > 20);
}

window.addEventListener('scroll', updateScrollUI, { passive: true });
window.addEventListener('resize', updateScrollUI);
updateScrollUI();

const navSections = [...document.querySelectorAll('#services, #work, #reels, #about')];
const navObserver = new IntersectionObserver((entries) => {
  const visibleSection = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

  if (!visibleSection) return;
  navigationLinks.forEach((link) => {
    const isCurrent = link.getAttribute('href') === `#${visibleSection.target.id}`;
    link.classList.toggle('is-active', isCurrent);
    if (isCurrent) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}, { rootMargin: '-24% 0px -62% 0px', threshold: [0.15, 0.4, 0.7] });

navSections.forEach((section) => navObserver.observe(section));

const form = document.querySelector('#booking-form');
const toast = document.querySelector('.toast');
let toastTimer;
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const guestName = formData.get('name')?.trim() || 'Guest';
  const phone = formData.get('phone')?.trim() || 'Not provided';
  const service = formData.get('service') || 'Appointment request';
  const time = formData.get('time') || 'No preference';
  const whatsappNumber = '919928931785';
  const message = [
    'Hello Shahzad’s Majestic Makeover,',
    '',
    'I would like to request an appointment.',
    `Name: ${guestName}`,
    `Phone: ${phone}`,
    `Service: ${service}`,
    `Preferred time: ${time}`,
    '',
    'Please let me know the available slots. Thank you!',
  ].join('\n');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  const whatsappWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

  if (!whatsappWindow) window.location.assign(whatsappUrl);

  toast.textContent = 'Opening WhatsApp with your appointment details…';
  form.reset();
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 4500);
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

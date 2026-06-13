const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.main-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
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

document.querySelectorAll('[data-product-carousel]').forEach((carousel) => {
  const slides = [...carousel.querySelectorAll('.product-slide')];
  const dotsContainer = carousel.querySelector('.product-carousel-dots');
  let activeIndex = 0;
  let intervalId;

  const dots = slides.map((_, index) => {
    const dot = document.createElement('button');
    dot.className = 'product-carousel-dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', `Show image ${index + 1} of ${slides.length}`);
    dot.addEventListener('click', () => showSlide(index));
    dotsContainer.appendChild(dot);
    return dot;
  });

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle('active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    });
    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  };

  const stopAutoScroll = () => clearInterval(intervalId);
  const startAutoScroll = () => {
    stopAutoScroll();
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      intervalId = setInterval(() => showSlide(activeIndex + 1), 4000);
    }
  };

  carousel.querySelector('.previous').addEventListener('click', () => {
    showSlide(activeIndex - 1);
    startAutoScroll();
  });
  carousel.querySelector('.next').addEventListener('click', () => {
    showSlide(activeIndex + 1);
    startAutoScroll();
  });
  carousel.addEventListener('mouseenter', stopAutoScroll);
  carousel.addEventListener('mouseleave', startAutoScroll);
  carousel.addEventListener('focusin', stopAutoScroll);
  carousel.addEventListener('focusout', startAutoScroll);

  showSlide(0);
  startAutoScroll();
});

document.querySelector('.contact-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button');
  button.textContent = 'Request Received';
  button.disabled = true;
});

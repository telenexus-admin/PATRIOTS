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

const coverageMapElement = document.querySelector('#coverage-map');

if (coverageMapElement && window.L) {
  const coverageAreas = [
    { name: 'Embakasi South & surroundings', lat: -1.326, lng: 36.886, radius: 3500 },
    { name: 'Embakasi East & surroundings', lat: -1.306, lng: 36.947, radius: 6200 },
    { name: 'Embakasi North & surroundings', lat: -1.248, lng: 36.902, radius: 2600 },
    { name: 'South B', lat: -1.311, lng: 36.838, radius: 1200 },
    { name: 'South C', lat: -1.319, lng: 36.829, radius: 1300 },
    { name: 'Dandora', lat: -1.247, lng: 36.899, radius: 1700 },
    { name: 'Allsops', lat: -1.242, lng: 36.871, radius: 900 },
    { name: 'Obama', lat: -1.278, lng: 36.914, radius: 900 },
    { name: 'Kayole', lat: -1.283, lng: 36.919, radius: 1900 },
    { name: 'Kariobangi South', lat: -1.261, lng: 36.884, radius: 1100 },
    { name: 'Kariobangi North', lat: -1.252, lng: 36.883, radius: 1100 },
    { name: 'Riverside', lat: -1.269, lng: 36.806, radius: 1100 },
    { name: 'Baba Dogo', lat: -1.231, lng: 36.875, radius: 1200 },
  ];

  const coverageMap = L.map(coverageMapElement, { scrollWheelZoom: false });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(coverageMap);

  const coverageGroup = L.featureGroup().addTo(coverageMap);
  coverageAreas.forEach((area) => {
    L.circle([area.lat, area.lng], {
      radius: area.radius,
      color: '#e83218',
      weight: 3,
      dashArray: '4 8',
      fillColor: '#f04408',
      fillOpacity: 0.08,
    }).bindTooltip(area.name, { direction: 'top' }).bindPopup(`<strong>${area.name}</strong><br>Approximate Patriots coverage zone.`).addTo(coverageGroup);
  });

  coverageMap.fitBounds(coverageGroup.getBounds(), { padding: [20, 20] });
}

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

const nexaChat = document.querySelector('[data-nexa-chat]');

if (nexaChat) {
  const configUrl = nexaChat.dataset.configUrl;
  const messageUrl = configUrl.replace(/\/config$/, '/message');
  const panel = nexaChat.querySelector('.nexa-chat-panel');
  const toggle = nexaChat.querySelector('.nexa-chat-toggle');
  const close = nexaChat.querySelector('.nexa-chat-close');
  const form = nexaChat.querySelector('.nexa-chat-form');
  const input = form.querySelector('input');
  const sendButton = form.querySelector('button');
  const messages = nexaChat.querySelector('.nexa-chat-messages');
  const agentLabel = nexaChat.querySelector('[data-nexa-agent]');
  const sessionStorageKey = 'patriots-nexa-session';

  const createSessionId = () => {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `patriots-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  };

  let sessionId = localStorage.getItem(sessionStorageKey) || createSessionId();
  localStorage.setItem(sessionStorageKey, sessionId);

  const addMessage = (text, type) => {
    const message = document.createElement('div');
    message.className = `nexa-message ${type}`;
    message.textContent = text;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
    return message;
  };

  const setOpen = (open) => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) input.focus();
  };

  toggle.addEventListener('click', () => setOpen(panel.hidden));
  close.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) setOpen(false);
  });

  fetch(configUrl)
    .then((response) => {
      if (!response.ok) throw new Error('Assistant configuration unavailable');
      return response.json();
    })
    .then((config) => {
      if (config.agent_name) agentLabel.textContent = config.agent_name;
    })
    .catch(() => {
      agentLabel.textContent = 'Patriot';
    });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text || sendButton.disabled) return;

    addMessage(text, 'user');
    input.value = '';
    input.disabled = true;
    sendButton.disabled = true;
    const status = addMessage('Patriot is typing...', 'status');

    try {
      const response = await fetch(messageUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, session_id: sessionId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to send message');
      if (data.session_id) {
        sessionId = data.session_id;
        localStorage.setItem(sessionStorageKey, sessionId);
      }
      status.remove();
      addMessage(data.reply || 'Thank you. A support agent will assist you shortly.', 'assistant');
    } catch (error) {
      status.remove();
      addMessage('I could not connect right now. Please use WhatsApp or call support.', 'error');
    } finally {
      input.disabled = false;
      sendButton.disabled = false;
      input.focus();
    }
  });
}

document.querySelector('.contact-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button');
  button.textContent = 'Request Received';
  button.disabled = true;
});

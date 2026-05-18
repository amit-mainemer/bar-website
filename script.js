const WHATSAPP_NUMBER = '972528777663';
const ADMIN_PASSWORD = 'solea2026';
const STORAGE_KEY = 'solea_appointments';
const WEEKDAY_TIME_SLOTS = ['15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30']; // Sun-Thu
const FRIDAY_TIME_SLOTS = ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00']; // Fri

function getAppointments() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
function saveAppointments(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 50);
});

function initMobileNav() {
  const nav = document.getElementById('nav');
  const navLinks = document.getElementById('navLinks');
  const menuToggle = document.getElementById('menuToggle');
  if (!nav || !navLinks || !menuToggle) return;

  function setMenuState(isOpen) {
    navLinks.classList.toggle('open', isOpen);
    menuToggle.classList.toggle('active', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  }

  menuToggle.addEventListener('click', () => {
    setMenuState(!navLinks.classList.contains('open'));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuState(false));
  });

  document.addEventListener('click', (event) => {
    if (window.innerWidth > 900) return;
    if (!nav.contains(event.target)) setMenuState(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) setMenuState(false);
  });
}

const booking = { service: null, duration: null, price: null, date: null, time: null, name: '', phone: '', notes: '' };

function goToStep(n) {
  if (n === 2 && !booking.service) { alert('אנא בחרי טיפול'); return; }
  if (n === 3 && (!booking.date || !booking.time)) { alert('אנא בחרי תאריך ושעה'); return; }

  document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
  document.getElementById('step' + n).classList.add('active');

  for (let i = 1; i <= 3; i++) {
    const dot = document.getElementById('dot' + i);
    dot.classList.remove('active', 'completed');
    if (i < n) dot.classList.add('completed');
    else if (i === n) dot.classList.add('active');
  }

  if (n === 3) {
    document.getElementById('sumService').textContent = booking.service;
    document.getElementById('sumDate').textContent = formatDate(booking.date);
    document.getElementById('sumTime').textContent = booking.time;
  }

  document.getElementById('booking').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelectorAll('.service-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.service-option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    booking.service = opt.dataset.service;
    booking.duration = opt.dataset.duration;
    booking.price = opt.dataset.price;
  });
});

function initServicesCarousel() {
  const grid = document.querySelector('#services .services-grid');
  const prevBtn = document.getElementById('servicesPrev');
  const nextBtn = document.getElementById('servicesNext');
  const dotsWrap = document.getElementById('servicesDots');
  const controls = document.querySelector('#services .services-carousel-controls');
  if (!grid || !prevBtn || !nextBtn || !dotsWrap || !controls) return;

  const cards = Array.from(grid.querySelectorAll('.service-card'));
  if (cards.length < 2) return;

  const mobileQuery = window.matchMedia('(max-width: 900px)');
  let dots = [];
  let ticking = false;
  let activeIndex = 0;

  function currentIndex() {
    return Math.max(0, Math.min(cards.length - 1, activeIndex));
  }

  function goTo(index) {
    const clamped = Math.max(0, Math.min(cards.length - 1, index));
    activeIndex = clamped;
    cards[clamped].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  }

  function detectClosestCardIndex() {
    const gridRect = grid.getBoundingClientRect();
    const gridCenter = gridRect.left + (gridRect.width / 2);
    let bestIdx = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, idx) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + (rect.width / 2);
      const distance = Math.abs(cardCenter - gridCenter);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIdx = idx;
      }
    });

    return bestIdx;
  }

  function updateControls() {
    const mobile = mobileQuery.matches;
    controls.style.display = mobile ? 'flex' : 'none';
    if (!mobile) return;

    activeIndex = detectClosestCardIndex();
    const idx = currentIndex();
    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx === cards.length - 1;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
  }

  dotsWrap.innerHTML = cards
    .map((_, i) => `<button type="button" class="services-carousel-dot${i === 0 ? ' active' : ''}" aria-label="מעבר לטיפול ${i + 1}"></button>`)
    .join('');
  dots = Array.from(dotsWrap.querySelectorAll('.services-carousel-dot'));

  prevBtn.addEventListener('click', () => goTo(currentIndex() - 1));
  nextBtn.addEventListener('click', () => goTo(currentIndex() + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  grid.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      updateControls();
      ticking = false;
    });
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (!mobileQuery.matches) {
      activeIndex = 0;
      cards[0].scrollIntoView({ behavior: 'auto', inline: 'start', block: 'nearest' });
    }
    updateControls();
  });
  const handleMediaChange = () => {
    if (!mobileQuery.matches) {
      activeIndex = 0;
      cards[0].scrollIntoView({ behavior: 'auto', inline: 'start', block: 'nearest' });
    }
    updateControls();
  };
  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', handleMediaChange);
  } else if (typeof mobileQuery.addListener === 'function') {
    mobileQuery.addListener(handleMediaChange);
  }

  updateControls();
}

function initTestimonialsCarousel() {
  const grid = document.querySelector('#testimonials .testimonials-grid');
  const prevBtn = document.getElementById('testimonialsPrev');
  const nextBtn = document.getElementById('testimonialsNext');
  const dotsWrap = document.getElementById('testimonialsDots');
  const controls = document.querySelector('#testimonials .services-carousel-controls');
  if (!grid || !prevBtn || !nextBtn || !dotsWrap || !controls) return;

  const cards = Array.from(grid.querySelectorAll('.testimonial'));
  if (cards.length < 2) return;

  const mobileQuery = window.matchMedia('(max-width: 900px)');
  let dots = [];
  let ticking = false;
  let activeIndex = 0;

  function currentIndex() {
    return Math.max(0, Math.min(cards.length - 1, activeIndex));
  }

  function goTo(index) {
    const clamped = Math.max(0, Math.min(cards.length - 1, index));
    activeIndex = clamped;
    cards[clamped].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  }

  function detectClosestCardIndex() {
    const gridRect = grid.getBoundingClientRect();
    const gridCenter = gridRect.left + (gridRect.width / 2);
    let bestIdx = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, idx) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + (rect.width / 2);
      const distance = Math.abs(cardCenter - gridCenter);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIdx = idx;
      }
    });

    return bestIdx;
  }

  function updateControls() {
    const mobile = mobileQuery.matches;
    controls.style.display = mobile ? 'flex' : 'none';
    if (!mobile) return;

    activeIndex = detectClosestCardIndex();
    const idx = currentIndex();
    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx === cards.length - 1;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
  }

  dotsWrap.innerHTML = cards
    .map((_, i) => `<button type="button" class="services-carousel-dot${i === 0 ? ' active' : ''}" aria-label="מעבר להמלצה ${i + 1}"></button>`)
    .join('');
  dots = Array.from(dotsWrap.querySelectorAll('.services-carousel-dot'));

  prevBtn.addEventListener('click', () => goTo(currentIndex() - 1));
  nextBtn.addEventListener('click', () => goTo(currentIndex() + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  grid.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      updateControls();
      ticking = false;
    });
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (!mobileQuery.matches) {
      activeIndex = 0;
      cards[0].scrollIntoView({ behavior: 'auto', inline: 'start', block: 'nearest' });
    }
    updateControls();
  });
  const handleMediaChange = () => {
    if (!mobileQuery.matches) {
      activeIndex = 0;
      cards[0].scrollIntoView({ behavior: 'auto', inline: 'start', block: 'nearest' });
    }
    updateControls();
  };
  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', handleMediaChange);
  } else if (typeof mobileQuery.addListener === 'function') {
    mobileQuery.addListener(handleMediaChange);
  }

  updateControls();
}

let calendarDate = new Date();
calendarDate.setDate(1);

const HEBREW_MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
const HEBREW_DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

function renderCalendar() {
  const month = calendarDate.getMonth();
  const year = calendarDate.getFullYear();
  document.getElementById('calendarMonth').textContent = `${HEBREW_MONTHS[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const grid = document.getElementById('calendarGrid');
  grid.innerHTML = '';

  HEBREW_DAYS.forEach(d => {
    const el = document.createElement('div');
    el.className = 'calendar-day-name';
    el.textContent = d;
    grid.appendChild(el);
  });

  for (let i = 0; i < firstDay; i++) {
    const el = document.createElement('div');
    el.className = 'calendar-day empty';
    grid.appendChild(el);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const el = document.createElement('div');
    el.className = 'calendar-day';
    el.textContent = d;

    const isPast = date < today;
    const isSaturday = date.getDay() === 6;
    const isToday = date.getTime() === today.getTime();

    if (isPast || isSaturday) {
      el.classList.add('disabled');
    } else {
      el.addEventListener('click', () => selectDate(date, el));
    }
    if (isToday) el.classList.add('today');

    if (booking.date && booking.date.getTime() === date.getTime()) {
      el.classList.add('selected');
    }

    grid.appendChild(el);
  }

  const now = new Date();
  document.getElementById('prevMonth').disabled = (year === now.getFullYear() && month === now.getMonth());
}

function selectDate(date, el) {
  booking.date = date;
  document.querySelectorAll('.calendar-day.selected').forEach(d => d.classList.remove('selected'));
  el.classList.add('selected');
  renderTimeSlots();
}

function renderTimeSlots() {
  const container = document.getElementById('timeSlotsContainer');
  const grid = document.getElementById('timeSlots');
  container.style.display = 'block';
  grid.innerHTML = '';

  const dateStr = booking.date.toISOString().split('T')[0];
  const taken = getAppointments()
    .filter(a => a.dateISO === dateStr && (a.status === 'pending' || a.status === 'confirmed'))
    .map(a => a.time);

  const availableSlots = booking.date.getDay() === 5 ? FRIDAY_TIME_SLOTS : WEEKDAY_TIME_SLOTS;
  if (booking.time && !availableSlots.includes(booking.time)) booking.time = null;

  availableSlots.forEach(t => {
    const el = document.createElement('div');
    el.className = 'time-slot';
    el.textContent = t;
    if (taken.includes(t)) {
      el.classList.add('taken');
    } else {
      el.addEventListener('click', () => {
        document.querySelectorAll('.time-slot.selected').forEach(s => s.classList.remove('selected'));
        el.classList.add('selected');
        booking.time = t;
      });
    }
    if (booking.time === t && !taken.includes(t)) el.classList.add('selected');
    grid.appendChild(el);
  });
}

document.getElementById('nextMonth').addEventListener('click', () => {
  calendarDate.setMonth(calendarDate.getMonth() + 1);
  renderCalendar();
});
document.getElementById('prevMonth').addEventListener('click', () => {
  calendarDate.setMonth(calendarDate.getMonth() - 1);
  renderCalendar();
});

renderCalendar();
initMobileNav();
initServicesCarousel();
initTestimonialsCarousel();

function formatDate(d) {
  const day = HEBREW_DAYS[d.getDay()];
  return `יום ${day}, ${d.getDate()} ב${HEBREW_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function submitBooking() {
  const name = document.getElementById('clientName').value.trim();
  const phone = document.getElementById('clientPhone').value.trim();
  const notes = document.getElementById('clientNotes').value.trim();

  if (!name) { alert('אנא הזיני שם'); return; }
  if (!phone) { alert('אנא הזיני טלפון'); return; }

  booking.name = name;
  booking.phone = phone;
  booking.notes = notes;

  const appointment = {
    id: Date.now(),
    service: booking.service,
    duration: booking.duration,
    price: booking.price,
    date: formatDate(booking.date),
    dateISO: booking.date.toISOString().split('T')[0],
    time: booking.time,
    name: booking.name,
    phone: booking.phone,
    notes: booking.notes,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  const all = getAppointments();
  all.push(appointment);
  saveAppointments(all);

  const msg = `*🌿 בקשת תור חדשה SOLÉA*%0A%0A` +
    `*שם:* ${name}%0A` +
    `*טלפון:* ${phone}%0A` +
    `*טיפול:* ${booking.service}%0A` +
    `*תאריך:* ${formatDate(booking.date)}%0A` +
    `*שעה:* ${booking.time}%0A` +
    (notes ? `*הערות:* ${notes}%0A` : '') +
    `%0Aאשמח לקבל אישור 💛`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');

  document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
  document.getElementById('step4').classList.add('active');
  for (let i = 1; i <= 3; i++) {
    document.getElementById('dot' + i).classList.remove('active');
    document.getElementById('dot' + i).classList.add('completed');
  }
}

function resetBooking() {
  booking.service = null;
  booking.date = null;
  booking.time = null;
  booking.name = '';
  booking.phone = '';
  booking.notes = '';
  document.getElementById('clientName').value = '';
  document.getElementById('clientPhone').value = '';
  document.getElementById('clientNotes').value = '';
  document.querySelectorAll('.service-option.selected').forEach(o => o.classList.remove('selected'));
  document.getElementById('timeSlotsContainer').style.display = 'none';
  goToStep(1);
}

function openAdmin() {
  document.getElementById('adminModal').classList.add('active');
  document.getElementById('adminLogin').style.display = 'block';
  document.getElementById('adminDashboard').style.display = 'none';
  document.getElementById('adminPassword').value = '';
  document.getElementById('adminPassword').focus();
}

function closeAdmin() {
  document.getElementById('adminModal').classList.remove('active');
}

function checkPassword() {
  const pw = document.getElementById('adminPassword').value;
  if (pw === ADMIN_PASSWORD) {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    renderAppointments();
  } else {
    alert('סיסמה שגויה');
  }
}

function renderAppointments() {
  const all = getAppointments().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  document.getElementById('statPending').textContent = all.filter(a => a.status === 'pending').length;
  document.getElementById('statConfirmed').textContent = all.filter(a => a.status === 'confirmed').length;
  document.getElementById('statRejected').textContent = all.filter(a => a.status === 'rejected').length;
  document.getElementById('statTotal').textContent = all.length;

  const list = document.getElementById('appointmentsList');
  if (all.length === 0) {
    list.innerHTML = '<div class="empty-state">עדיין אין בקשות תורים</div>';
    return;
  }

  list.innerHTML = all.map(a => {
    const statusClass = `status-${a.status}`;
    const statusText = {
      pending: 'ממתין',
      confirmed: 'מאושר',
      rejected: 'נדחה',
      rescheduled: 'הוצע מועד אחר'
    }[a.status];

    return `
      <div class="appointment">
        <div class="appointment-info">
          <h4>${a.name} · ${a.service}</h4>
          <div class="meta"><strong>${a.date}</strong> בשעה <strong>${a.time}</strong></div>
          <div class="meta">📞 ${a.phone}${a.notes ? ' · 📝 ' + a.notes : ''}</div>
          <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
        <div class="appointment-actions">
          ${a.status === 'pending' ? `
            <button class="btn-mini btn-confirm" onclick="updateStatus(${a.id}, 'confirmed', 'אישור')">✓ אישור</button>
            <button class="btn-mini btn-reject" onclick="updateStatus(${a.id}, 'rejected', 'דחיה')">✗ דחה</button>
            <button class="btn-mini btn-reschedule" onclick="rescheduleAppointment(${a.id})">📅 מועד אחר</button>
          ` : ''}
          <a href="https://wa.me/${formatPhoneForWA(a.phone)}" target="_blank" class="btn-mini btn-wa">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51z"/></svg>
            WhatsApp
          </a>
          <button class="btn-mini btn-reject" onclick="deleteAppointment(${a.id})" style="margin-right: auto;">🗑</button>
        </div>
      </div>
    `;
  }).join('');
}

function formatPhoneForWA(phone) {
  let p = phone.replace(/\D/g, '');
  if (p.startsWith('0')) p = '972' + p.substring(1);
  return p;
}

function updateStatus(id, status, action) {
  const all = getAppointments();
  const apt = all.find(a => a.id === id);
  if (!apt) return;
  apt.status = status;
  saveAppointments(all);

  let msg;
  if (status === 'confirmed') {
    msg = `*🌿 SOLÉA Facial Studio*%0A%0Aהתור שלך אושר! ✨%0A%0A*${apt.service}*%0A${apt.date}%0Aבשעה ${apt.time}%0A%0Aמחכה לך!%0A`;
  } else {
    msg = `*🌿 SOLÉA Facial Studio*%0A%0Aשלום ${apt.name},%0Aלצערי לא אוכל לקבל אותך במועד שביקשת:%0A${apt.date} בשעה ${apt.time}%0A%0Aנשמח להציע מועד חלופי. צרי איתי קשר 💛`;
  }
  
  if (confirm(`האם לפתוח את WhatsApp לשליחת הודעת ${action} ל${apt.name}?`)) {
    window.open(`https://wa.me/${formatPhoneForWA(apt.phone)}?text=${msg}`, '_blank');
  }
  renderAppointments();
}

function rescheduleAppointment(id) {
  const all = getAppointments();
  const apt = all.find(a => a.id === id);
  if (!apt) return;

  const newDate = prompt('הציעי תאריך חלופי (לדוגמה: יום שני, 15 ביוני):', '');
  if (!newDate) return;
  const newTime = prompt('שעה חלופית (לדוגמה: 14:00):', '');
  if (!newTime) return;

  apt.status = 'rescheduled';
  apt.suggestedDate = newDate;
  apt.suggestedTime = newTime;
  saveAppointments(all);

  const msg = `*🌿 SOLÉA Facial Studio*%0A%0Aשלום ${apt.name},%0Aלצערי המועד שביקשת (${apt.date} בשעה ${apt.time}) לא זמין.%0A%0Aאשמח להציע לך מועד חלופי:%0A*${newDate}*%0A*בשעה ${newTime}*%0A%0Aמתאים לך? ✨`;

  if (confirm(`האם לפתוח את WhatsApp לשליחת הצעה חלופית ל${apt.name}?`)) {
    window.open(`https://wa.me/${formatPhoneForWA(apt.phone)}?text=${msg}`, '_blank');
  }
  renderAppointments();
}

function deleteAppointment(id) {
  if (!confirm('למחוק את הבקשה לצמיתות?')) return;
  const all = getAppointments().filter(a => a.id !== id);
  saveAppointments(all);
  renderAppointments();
}

document.getElementById('adminModal').addEventListener('click', (e) => {
  if (e.target.id === 'adminModal') closeAdmin();
});

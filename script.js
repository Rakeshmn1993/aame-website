// Edit this object to personalize the site.
const CONFIG = {
  childName: "Abhiram R Simha",
  tagline: "Blessings, sweets, and a little haircut ceremony for our favourite boy.",
  introText:
    "Our little one is curious, cheerful, and already the center of every room. Join us as we begin this special milestone with family and friends.",
  facts: [
    { title: "Vehicle lover", text: "Happiest when he spots a JCB, tractor, or truck." },
    { title: "Fruit fan", text: "Loves papaya, mango, and ice apple." },
    { title: "Little cyclist", text: "Loves riding his cycle around all by himself." },
    { title: "Pet buddy", text: "Loves playing with Bhairava, our pet." },
    { title: "Biggest fan of Anna and Akka", text: "He loves Dhruva (anna) and Apporva (akka) so much that he always chants their names, even in his sleep." },
    { title: "Gentle biter", text: "Bites whenever he gets too excited or angry, so watch your fingers." },
  ],
  // Files in the images/ folder; captions are read from the date in each filename.
  photos: [
    "IMG20250101113747.jpg", "IMG20250330090534.jpg", "IMG20250827092341.jpg", "IMG20251115175353.jpg",
    "IMG20251224172218.jpg", "IMG20260109111911.jpg", "IMG20260109113438.jpg",
    "IMG20260119105444.jpg", "IMG20260127084559.jpg", "IMG20260404125010.jpg", "IMG20260411192214.jpg",
    "IMG20260411201149.jpg", "IMG20260519205915.jpg", "IMG20260521131552.jpg", "IMG20260526115002.jpg",
    "IMG20260527082729.jpg", "IMG20260531182531.jpg", "IMG20260601143421.jpg", "IMG20260729092007.jpg",
    "IMG20260829170350.jpg", "IMG20261002123301.jpg",
  ],
  morePhotos: [
    "special_images/special-01.jpg", "special_images/special-02.jpg", "special_images/special-03.jpg",
    "special_images/special-04.jpg", "special_images/special-05.jpg", "special_images/special-06.jpg",
    "special_images/special-07.jpg", "special_images/special-08.jpg", "special_images/special-09.jpg",
    "special_images/special-10.jpg", "special_images/special-11.jpg", "special_images/special-12.jpg",
    "special_images/special-13.jpg", "special_images/special-14.jpg",
  ],
  poll: {
    question: "Which look suits me best?",
    sheets: ["poll/poll-02.jpg"],
    options: Array.from({ length: 15 }, (_, i) => ({ label: `Look ${i + 1}` })),
  },
  event: {
    name: "Chudakarma",
    start: "2027-02-19T10:00:00",
    durationHours: 3,
    timeText: "10:00 AM onwards",
    venueName: "Sri Rama mandira, Mudlapura",
    venueAddress: "Mudlapura, Karnataka, India",
    mapsQuery: "Sri Rama mandira, Mudlapura, Hassan, Karnataka, India",
    coordinates: "13.071328,76.121352",
  },
  rsvpBy: "February 1, 2027",
  rsvpEmail: "rakeshmn09@gmail.com",
  footer: "With love, the family - Nataraj (ajja), Shashikala (ajji), Rakesh (appa), Sahana (amma), Girish (appayi), Swarna (ammayi), Dhruva and Apporva (anna appooorvaa) and my all other family members",
};

const $ = (id) => document.getElementById(id);
const eventDate = new Date(CONFIG.event.start);

function renderText() {
  $("hero-name").textContent = CONFIG.childName;
  $("hero-tagline").textContent = CONFIG.tagline;
  $("intro-text").textContent = CONFIG.introText;
  $("venue-name").textContent = CONFIG.event.venueName;
  $("venue-address").textContent = CONFIG.event.venueAddress;
  $("time-text").textContent = CONFIG.event.timeText;
  $("rsvp-by").textContent = CONFIG.rsvpBy;
  $("footer-text").textContent = CONFIG.footer;
  const mapTarget = CONFIG.event.coordinates || CONFIG.event.mapsQuery;
  $("map-link").href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(mapTarget);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  $("date-badge").innerHTML =
    `<span class="m">${months[eventDate.getMonth()]}</span>` +
    `<span class="d">${eventDate.getDate()}</span>` +
    `<span class="y">${eventDate.getFullYear()}</span>`;
  $("date-full").textContent = eventDate.toLocaleDateString("en-US", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const facts = $("facts");
  CONFIG.facts.forEach((f) => {
    const card = document.createElement("div");
    card.className = "fact";
    const h = document.createElement("h3");
    h.textContent = f.title;
    const p = document.createElement("p");
    p.textContent = f.text;
    card.append(h, p);
    facts.append(card);
  });
}

function captionFromFilename(file) {
  const m = /IMG(\d{4})(\d{2})(\d{2})/.exec(file);
  if (!m) return "";
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function renderCollage() {
  const collage = $("collage");
  CONFIG.photos.forEach((file, i) => {
    const src = "images/" + file;
    const caption = captionFromFilename(file);

    const figure = document.createElement("figure");
    figure.className = "polaroid";
    // Deterministic tilt between -4 and 4 degrees, so the layout is stable on reload.
    figure.style.setProperty("--rot", `${((i * 7) % 9) - 4}deg`);

    const img = document.createElement("img");
    img.src = src;
    img.alt = caption;
    img.loading = "lazy";
    // Hide broken image slots so missing photos don't show a broken icon.
    img.onerror = () => figure.remove();

    const cap = document.createElement("figcaption");
    cap.textContent = caption;

    figure.append(img, cap);
    figure.addEventListener("click", () => openLightbox(src, caption));
    collage.append(figure);
  });
}

function openLightbox(src, alt) {
  $("lightbox-img").src = src;
  $("lightbox-img").alt = alt;
  $("lightbox").hidden = false;
}

function closeLightbox() {
  $("lightbox").hidden = true;
  $("lightbox-img").src = "";
}

function setupLightbox() {
  $("lightbox").addEventListener("click", (e) => {
    if (e.target.id === "lightbox" || e.target.classList.contains("lightbox-close")) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
}

function startCountdown() {
  const box = $("countdown");
  let timer = null;
  const tick = () => {
    const diff = eventDate - new Date();
    if (diff <= 0) {
      box.innerHTML = "<p>The ceremony is today!</p>";
      if (timer) clearInterval(timer);
      return;
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff / 3600000) % 24);
    const mins = Math.floor((diff / 60000) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    box.innerHTML = [
      [days, "Days"], [hours, "Hours"], [mins, "Minutes"], [secs, "Seconds"],
    ].map(([n, label]) => `<div><strong>${n}</strong><span>${label}</span></div>`).join("");
  };
  tick();
  timer = setInterval(tick, 1000);
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function icsTimestamp(d) {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

function downloadCalendar() {
  const end = new Date(eventDate.getTime() + CONFIG.event.durationHours * 3600000);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Chudakarma Invite//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@chudakarma-invite`,
    `DTSTAMP:${icsTimestamp(new Date())}`,
    `DTSTART:${icsTimestamp(eventDate)}`,
    `DTEND:${icsTimestamp(end)}`,
    `SUMMARY:${CONFIG.event.name} - ${CONFIG.childName}`,
    `LOCATION:${CONFIG.event.venueName}, ${CONFIG.event.venueAddress}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "chudakarma.ics";
  a.click();
  URL.revokeObjectURL(url);
}

function setupRsvp() {
  const form = $("rsvp-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const status = $("form-status");
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const guests = Number(data.get("guests"));

    if (!name || !(guests >= 1 && guests <= 20)) {
      status.textContent = "Please enter your name and a valid number of guests.";
      return;
    }

    const attending = data.get("attending") === "yes" ? "Attending" : "Not attending";
    const body = [
      `Name: ${name}`,
      `Guests: ${guests}`,
      `Status: ${attending}`,
      `Message: ${data.get("message") || "-"}`,
    ].join("\n");

    const subject = `RSVP - ${CONFIG.event.name} for ${CONFIG.childName}`;
    window.location.href = `mailto:${CONFIG.rsvpEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = "Thank you! Your reply is ready to send from your email app.";
    form.reset();
  });
}

function renderMorePhotos() {
  const grid = $("more-photos");
  CONFIG.morePhotos.forEach((file) => {
    const src = "images/" + file;
    const caption = captionFromFilename(file);
    const img = document.createElement("img");
    img.src = src;
    img.alt = caption;
    img.loading = "lazy";
    img.onerror = () => img.remove();
    img.addEventListener("click", () => openLightbox(src, caption));
    grid.append(img);
  });
}

// Votes are stored on the server (data/votes.json) and shared across devices.
const POLL_API = "api/votes";

async function getVotes() {
  const res = await fetch(POLL_API, { cache: "no-store" });
  if (!res.ok) throw new Error("Poll unavailable");
  return res.json();
}

function renderPoll() {
  const form = $("poll-form");
  $("poll-question").textContent = CONFIG.poll.question;

  const sheets = $("poll-sheets");
  CONFIG.poll.sheets.forEach((file) => {
    const src = "images/" + file;
    const img = document.createElement("img");
    img.src = src;
    img.alt = "Look sheet";
    img.loading = "lazy";
    img.onerror = () => img.remove();
    img.addEventListener("click", () => openLightbox(src, "Look sheet"));
    sheets.append(img);
  });

  const input = document.createElement("input");
  input.type = "number";
  input.name = "look";
  input.min = 1;
  input.max = CONFIG.poll.options.length;
  input.step = 1;
  input.required = true;
  input.placeholder = "Look number";
  input.setAttribute("aria-label", "Look number");
  form.append(input);
  const submit = document.createElement("button");
  submit.className = "btn";
  submit.type = "submit";
  submit.textContent = "Vote";
  form.append(submit);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const look = Number(new FormData(form).get("look"));
    try {
      const res = await fetch(POLL_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ look }),
      });
      if (!res.ok) throw new Error("Vote rejected");
      form.reset();
    } catch {
      alert("Could not record your vote. Please try again.");
    }
    renderResults();
  });

  renderResults();
}

async function renderResults() {
  const box = $("poll-results");
  let votes;
  try {
    votes = await getVotes();
  } catch {
    box.textContent = "Poll results are unavailable right now.";
    return;
  }
  const counts = CONFIG.poll.options.map((o) => votes[o.label] || 0);
  const total = counts.reduce((sum, c) => sum + c, 0);
  const max = Math.max(1, ...counts);
  box.replaceChildren();

  const chart = document.createElement("div");
  chart.className = "poll-chart";
  CONFIG.poll.options.forEach((opt, i) => {
    const col = document.createElement("div");
    col.className = "poll-col";
    col.title = `${opt.label}: ${counts[i]} vote${counts[i] === 1 ? "" : "s"}`;

    const count = document.createElement("span");
    count.className = "poll-count";
    count.textContent = counts[i];

    const bar = document.createElement("div");
    bar.className = "poll-bar";
    bar.style.height = (counts[i] / max) * 200 + "px";

    const num = document.createElement("span");
    num.className = "poll-label";
    num.textContent = i + 1;

    col.append(count, bar, num);
    chart.append(col);
  });

  const note = document.createElement("p");
  note.className = "poll-total";
  note.textContent = `${total} vote${total === 1 ? "" : "s"} so far`;
  box.append(chart, note);
}

async function countVisit() {
  try {
    const res = await fetch("api/visits", { method: "POST", cache: "no-store" });
    if (!res.ok) return;
    const { count } = await res.json();
    $("visit-count").textContent = count.toLocaleString();
    $("visit-counter").hidden = false;
  } catch {
    // Server unreachable (e.g. page opened from disk): leave the counter hidden.
  }
}

renderText();
renderCollage();
renderMorePhotos();
renderPoll();
setupLightbox();
startCountdown();
setupRsvp();
$("ics-btn").addEventListener("click", downloadCalendar);
countVisit();

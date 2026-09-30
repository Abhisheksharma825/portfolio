const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const roles = ["interactive web experiences", "secure digital products", "AI-powered ideas", "clean user interfaces"];
const typingText = $("#typing-text");
let roleIndex = 0, charIndex = 0, deleting = false;

function typeLoop() {
  if (!typingText) return;
  const role = roles[roleIndex];
  typingText.textContent = deleting ? role.slice(0, charIndex--) : role.slice(0, charIndex++);
  if (!deleting && charIndex > role.length) {
    deleting = true;
    setTimeout(typeLoop, 1300);
    return;
  }
  if (deleting && charIndex < 0) {
    deleting = false;
    charIndex = 0;
    roleIndex = (roleIndex + 1) % roles.length;
    setTimeout(typeLoop, 350);
    return;
  }
  setTimeout(typeLoop, deleting ? 42 : 75);
}
typeLoop();

// Header, active navigation and scroll progress
const header = $("#site-header");
const progress = $("#scroll-progress");
const backTop = $("#back-to-top");
const navLinks = $$(".nav-link");
const sections = $$("main section[id]");

function handleScroll() {
  const y = window.scrollY;
  header.classList.toggle("scrolled", y > 20);
  backTop.classList.toggle("visible", y > 600);
  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - window.innerHeight;
  progress.style.width = `${scrollable > 0 ? (y / scrollable) * 100 : 0}%`;
  let current = "hero";
  sections.forEach(section => {
    if (y >= section.offsetTop - 180) current = section.id;
  });
  navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${current}`));
}
window.addEventListener("scroll", handleScroll, { passive: true });
handleScroll();

// Mobile navigation
const hamburger = $("#hamburger");
const nav = $("#nav-links");
hamburger?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  hamburger.setAttribute("aria-expanded", String(open));
  hamburger.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
});
navLinks.forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  hamburger?.setAttribute("aria-expanded", "false");
}));

// Theme toggle
const themeToggle = $("#theme-toggle");
const savedTheme = localStorage.getItem("portfolio-theme");
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
function updateThemeIcon() {
  if (!themeToggle) return;
  const light = document.documentElement.dataset.theme === "light";
  themeToggle.innerHTML = `<i class="fa-solid fa-${light ? "moon" : "sun"}"></i>`;
  themeToggle.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
}
updateThemeIcon();
themeToggle?.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("portfolio-theme", next);
  updateThemeIcon();
});

// Scroll reveal + skill bar animation
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("show");
    if (entry.target.classList.contains("skill-category")) entry.target.classList.add("skills-visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: .12 });
$$(".reveal, .skill-category").forEach(el => revealObserver.observe(el));

// Counters
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    $$(".counter", entry.target).forEach(counter => {
      const target = Number(counter.dataset.target || 0);
      const start = performance.now();
      const duration = 900;
      const tick = now => {
        const progress = Math.min((now - start) / duration, 1);
        counter.textContent = String(Math.floor(progress * target));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    counterObserver.unobserve(entry.target);
  });
}, { threshold: .4 });
const counterSection = $("[data-counter-section]");
if (counterSection) counterObserver.observe(counterSection);

// Skill filters
$$('[data-skill-filter]').forEach(button => {
  button.addEventListener("click", () => {
    $$('[data-skill-filter]').forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    const filter = button.dataset.skillFilter;
    $$(".skill-category").forEach(card => {
      card.classList.toggle("hidden", filter !== "all" && card.dataset.skillCategory !== filter);
    });
  });
});

// Project filters
$$('[data-project-filter]').forEach(button => {
  button.addEventListener("click", () => {
    $$('[data-project-filter]').forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    const filter = button.dataset.projectFilter;
    $$(".project-card").forEach(card => {
      const categories = card.dataset.projectCategory.split(" ");
      card.classList.toggle("hidden", filter !== "all" && !categories.includes(filter));
    });
  });
});

// Project modal data
const projectData = {
  portfolio: {
    kicker: "Web • JavaScript",
    title: "Personal Portfolio Website",
    description: "A responsive developer portfolio redesigned around usability: active navigation, scroll reveals, skill filtering, project filtering, project modals, theme persistence, interactive terminal and a validated contact workflow.",
    tags: ["HTML5", "CSS3", "JavaScript", "Responsive UI"],
    links: [{ label: "GitHub", href: "https://github.com/Abhisheksharma825" }]
  },
  todo: {
    kicker: "Node.js • CLI",
    title: "CLI Todo List",
    description: "A terminal-first task manager focused on quick interaction and simple command-line workflows. The project demonstrates JavaScript fundamentals and Node.js usage outside the browser.",
    tags: ["Node.js", "JavaScript", "CLI"],
    links: [{ label: "GitHub", href: "https://github.com/Abhisheksharma825" }]
  },
  "prompt-heist": {
    kicker: "Hackathon • Cybersecurity",
    title: "Prompt Heist",
    description: "A browser-based futuristic AI vault game where the player uses natural-language commands to interact with the game state, solve security puzzles and escape with the Digital Core.",
    tags: ["HTML", "CSS", "Vanilla JavaScript", "Prompt interaction"],
    links: [{ label: "Live Demo", href: "https://gamzyfy.netlify.app/" }, { label: "GitHub", href: "https://github.com/Abhisheksharma825/gamzyfy" }]
  }
};

const projectModal = $("#project-modal");
function openProject(id) {
  const data = projectData[id];
  if (!data || !projectModal) return;
  $("#modal-kicker").textContent = data.kicker;
  $("#modal-title").textContent = data.title;
  $("#modal-description").textContent = data.description;
  $("#modal-tags").innerHTML = data.tags.map(tag => `<span>${tag}</span>`).join("");
  $("#modal-actions").innerHTML = data.links.map(link => `<a class="btn small ${link.label === "GitHub" ? "btn-outline" : ""}" href="${link.href}" target="_blank" rel="noreferrer">${link.label} <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`).join("");
  projectModal.showModal();
  document.body.classList.add("modal-open");
}
$$(".project-open").forEach(button => button.addEventListener("click", () => openProject(button.dataset.projectId)));
projectModal?.addEventListener("click", event => {
  if (event.target === projectModal || event.target.closest("[data-close-modal]")) projectModal.close();
});
projectModal?.addEventListener("close", () => document.body.classList.remove("modal-open"));

// Experience accordions
$$(".timeline-toggle").forEach(button => button.addEventListener("click", () => {
  button.closest(".expandable")?.classList.toggle("open");
}));

// Certificate modal
const certificateModal = $("#certificate-modal");
$$(".certificate-open").forEach(button => button.addEventListener("click", () => {
  const name = button.dataset.certificate;
  const file = button.dataset.certificateFile;
  $("#certificate-title").textContent = name;
  $("#certificate-message").textContent = "If you have placed the real certificate PDF at this path, use the button below to open it. Otherwise replace the placeholder path with your verified certificate file.";
  $("#certificate-link").href = file;
  certificateModal.showModal();
  document.body.classList.add("modal-open");
}));
certificateModal?.addEventListener("click", event => {
  if (event.target === certificateModal || event.target.closest("[data-close-certificate]")) certificateModal.close();
});
certificateModal?.addEventListener("close", () => document.body.classList.remove("modal-open"));

// Terminal
const terminalOutput = $("#terminal-output");
const terminalInput = $("#terminal-input");
const terminalForm = $("#terminal-form");
const terminalCommands = {
  help: "Commands: about • skills • projects • experience • contact • clear",
  about: "Abhishek Sharma — B.Tech CSE student focused on web development, cybersecurity and AI/ML.",
  skills: "Frontend: HTML, CSS, JavaScript, React | Backend: Node.js, Express | Programming: C, C++, Python, Java | Security: Linux, Nmap, Wireshark",
  projects: "Projects: Personal Portfolio • CLI Todo List • Prompt Heist",
  experience: "Learning experiences: Cisco Cyber Smart AI • Full Stack Development • GirlScript Summer of Code",
  contact: "Email: abhisheksharma.h2005@gmail.com | GitHub: github.com/Abhisheksharma825",
  clear: "__CLEAR__"
};
function terminalPrint(text, type = "output") {
  if (!terminalOutput) return;
  if (text === "__CLEAR__") { terminalOutput.innerHTML = ""; return; }
  const div = document.createElement("div");
  div.className = `terminal-line ${type}`;
  div.textContent = text;
  terminalOutput.appendChild(div);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}
terminalPrint("Welcome. Type 'help' to explore.");
terminalForm?.addEventListener("submit", event => {
  event.preventDefault();
  const command = terminalInput.value.trim().toLowerCase();
  if (!command) return;
  terminalPrint(`> ${command}`, "command");
  terminalInput.value = "";
  terminalPrint(terminalCommands[command] || `Command not found: ${command}. Type 'help'.`);
});

// Contact form: opens the user's email client with validated content.
const contactForm = $("#contact-form");
const formStatus = $("#form-status");
contactForm?.addEventListener("submit", event => {
  event.preventDefault();
  if (!contactForm.checkValidity()) {
    contactForm.reportValidity();
    return;
  }
  const data = new FormData(contactForm);
  const subject = encodeURIComponent(data.get("subject"));
  const body = encodeURIComponent(`Hi Abhishek,\n\nName: ${data.get("name")}\nEmail: ${data.get("email")}\n\n${data.get("message")}`);
  window.location.href = `mailto:abhisheksharma.h2005@gmail.com?subject=${subject}&body=${body}`;
  formStatus.textContent = "Opening your email app…";
});

// Back to top
backTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// Cursor glow for desktop
const cursorGlow = $(".cursor-glow");
window.addEventListener("pointermove", event => {
  if (!cursorGlow) return;
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
});

// Resume helper: the project intentionally does not invent a resume PDF.
function handleResume(event) {
  const path = "assets/resume.pdf";
  fetch(path, { method: "HEAD" }).then(response => {
    if (!response.ok) {
      event.preventDefault();
      showToast("Add your resume as assets/resume.pdf first.");
    }
  }).catch(() => {
    event.preventDefault();
    showToast("Add your resume as assets/resume.pdf first.");
  });
  return true;
}
window.handleResume = handleResume;

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 3200);
}

document.title = "Abhishek Sharma | Developer Portfolio";
$("#current-year").textContent = new Date().getFullYear();

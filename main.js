// =========================
// Loader
// =========================
window.addEventListener("load", () => {
  const loader = document.getElementById("cfLoader");
  if (!loader) return;
  setTimeout(() => loader.classList.add("is-hide"), 350);
});

// =========================
// Drawer (MENU) with animation
// =========================
const btn = document.getElementById("menuBtn");
const drawer = document.getElementById("drawer");
const closeBtn = document.getElementById("drawerClose");

drawer?.addEventListener("click", (e) => {
  if (e.target === drawer) {
    closeDrawer();
  }
});

closeBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  closeDrawer();
});

function openDrawer() {
  if (!drawer) return;

  drawer.hidden = false;
  requestAnimationFrame(() => {
    drawer.classList.add("is-open");
  });

  btn?.setAttribute("aria-expanded", "true");
  document.body.classList.add("drawer-open");
}

function closeDrawer() {
  if (!drawer) return;

  drawer.classList.remove("is-open");
  btn?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("drawer-open");

  setTimeout(() => {
    drawer.hidden = true;
  }, 260);
}

btn?.addEventListener("click", (e) => {
  e.stopPropagation();
  const isOpen = !drawer.hidden;
  isOpen ? closeDrawer() : openDrawer();
});

// ドロワー内リンク押したら閉じる
drawer?.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (!a) return;
  closeDrawer();
});

// 外側クリックで閉じる
document.addEventListener("click", (e) => {
  if (!document.body.classList.contains("drawer-open")) return;
  const inside = drawer?.contains(e.target) || btn?.contains(e.target);
  if (!inside) closeDrawer();
});

// Escで閉じる
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!document.body.classList.contains("drawer-open")) return;
  closeDrawer();
});

// =========================
// Reveal on scroll
// =========================
const revealEls = document.querySelectorAll(".reveal");

if (revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-show");
      io.unobserve(entry.target);
    });
  }, {
    root: null,
    rootMargin: "0px 0px -10% 0px",
    threshold: 0.1
  });

  revealEls.forEach((el) => io.observe(el));
}

// ======================
// background bubbles
// ======================
const bubbleWrap = document.querySelector(".vfesBubbles");

if (bubbleWrap) {
  const bubbleCount = 18;

  for (let i = 0; i < bubbleCount; i++) {
    const bubble = document.createElement("span");
    bubble.className = "bubble";

    const size = Math.random() * 120 + 40;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}%`;

    const duration = Math.random() * 20 + 30;
    bubble.style.animationDuration = `${duration}s`;

    const delay = -Math.random() * duration;
    bubble.style.animationDelay = `${delay}s`;

    const colors = [
      "rgba(249,160,63,.28)",
      "rgba(249,160,63,.22)",
      "rgba(93,173,236,.28)",
      "rgba(93,173,236,.22)"
    ];

    bubble.style.background =
      colors[Math.floor(Math.random() * colors.length)];

    bubbleWrap.appendChild(bubble);
  }
}

// =========================
// FOOD Carousel
// =========================
(() => {
  const carousel = document.getElementById("foodCarousel");
  if (!carousel) return;

  const viewport = carousel.querySelector(".cfCarViewport");
  const track = carousel.querySelector(".cfCarTrack");
  const cards = Array.from(track?.querySelectorAll(".cfFoodTopCard") || []);
  const prevBtn = carousel.querySelector(".cfCarBtn.is-prev");
  const nextBtn = carousel.querySelector(".cfCarBtn.is-next");
  const dotsWrap = document.getElementById("foodCarDots");

  if (!viewport || !track || !cards.length) return;

  let currentIndex = 0;
  let isAnimating = false;

  const isMobile = () => window.innerWidth <= 600;

  function clampIndex(index) {
    const max = cards.length - 1;
    if (index < 0) return max;
    if (index > max) return 0;
    return index;
  }

  function renderDots() {
    if (!dotsWrap) return;

    dotsWrap.innerHTML = "";

    cards.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "cfCarDot";
      dot.type = "button";
      dot.setAttribute("aria-label", `${i + 1}枚目へ移動`);

      if (i === currentIndex) {
        dot.classList.add("is-active");
      }

      dot.addEventListener("click", () => {
        currentIndex = i;
        updateCarousel(true);
      });

      dotsWrap.appendChild(dot);
    });
  }

  function updateClasses() {
    cards.forEach((card, i) => {
      card.classList.remove("is-active", "is-near");

      if (i === currentIndex) {
        card.classList.add("is-active");
      } else if (i === currentIndex - 1 || i === currentIndex + 1) {
        card.classList.add("is-near");
      }
    });
  }

  function updateDots() {
    const dots = dotsWrap?.querySelectorAll(".cfCarDot");
    dots?.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === currentIndex);
    });
  }

  function getDesktopTarget(index) {
    const active = cards[index];
    const viewportWidth = viewport.clientWidth;
    const activeWidth = active.offsetWidth;
    const activeLeft = active.offsetLeft;

    let target = activeLeft - (viewportWidth - activeWidth) / 2;
    const maxTranslate = Math.max(0, track.scrollWidth - viewportWidth);

    if (target < 0) target = 0;
    if (target > maxTranslate) target = maxTranslate;

    return target;
  }

  function getMobileScrollTarget(index) {
    const active = cards[index];
    const viewportWidth = viewport.clientWidth;
    const activeWidth = active.offsetWidth;
    const activeLeft = active.offsetLeft;

    let target = activeLeft - (viewportWidth - activeWidth) / 2;
    const maxScroll = Math.max(0, viewport.scrollWidth - viewportWidth);

    if (target < 0) target = 0;
    if (target > maxScroll) target = maxScroll;

    return target;
  }

  function updateCarousel(shouldAnimateMobile = false) {
    if (!cards.length) return;

    updateClasses();
    updateDots();

    if (isMobile()) {
      track.style.transform = "";

      if (shouldAnimateMobile) {
        viewport.scrollTo({
          left: getMobileScrollTarget(currentIndex),
          behavior: "smooth"
        });
      }
      return;
    }

    const target = getDesktopTarget(currentIndex);
    track.style.transform = `translateX(-${target}px)`;
  }

  function updateByScrollPosition() {
    if (!isMobile()) return;

    let nearestIndex = 0;
    let nearestDistance = Infinity;
    const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2;

    cards.forEach((card, i) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(cardCenter - viewportCenter);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    });

    currentIndex = nearestIndex;
    updateClasses();
    updateDots();
  }

  prevBtn?.addEventListener("click", () => {
    if (isAnimating) return;
    isAnimating = true;

    currentIndex = clampIndex(currentIndex - 1);
    updateCarousel(true);

    setTimeout(() => {
      isAnimating = false;
    }, 320);
  });

  nextBtn?.addEventListener("click", () => {
    if (isAnimating) return;
    isAnimating = true;

    currentIndex = clampIndex(currentIndex + 1);
    updateCarousel(true);

    setTimeout(() => {
      isAnimating = false;
    }, 320);
  });

  viewport.addEventListener("scroll", () => {
    if (!isMobile()) return;
    updateByScrollPosition();
  }, { passive: true });

  window.addEventListener("resize", () => {
    updateCarousel(false);
  });

  renderDots();
  updateCarousel(false);
})();

// ===============================
// TIGETリンク一括管理
// ===============================
const TIGET_URL = "https://tiget.net/events/478236"; // ←ここに本番URL

document.querySelectorAll(".js-ticket-btn").forEach(btn => {
  btn.href = TIGET_URL;
});
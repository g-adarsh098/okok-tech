// ══════════════════════════════════════════════════════
//  OKOK TECH — PREMIUM INTERACTIONS v7.0
//  Firebase Auth · Admin Panel · Firestore CRUD
//  Target Cursor (ReactBits) · Page Transitions · Scroll
// ══════════════════════════════════════════════════════

// ── GLOBAL STATE ──
let currentUser = null;
let currentUserRole = null;
let currentUserData = null;

// ── TARGET CURSOR (Vanilla JS port of ReactBits TargetCursor) ──
(function () {
  const SPIN_DURATION = 2;
  const HOVER_DURATION = 0.2;
  const PARALLAX_ON = true;
  const BORDER_WIDTH = 3;
  const CORNER_SIZE = 12;
  const TARGET_SELECTOR = "a, button, .pc, .svc-card, .hsp, .val, .tc, .hex-fc, input, textarea, select, .admin-tab, .admin-item";

  const hasTouchScreen = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  const isMobileUA = mobileRegex.test((navigator.userAgent || "").toLowerCase());
  const isMobile = (hasTouchScreen && isSmallScreen) || isMobileUA;

  if (isMobile) {
    document.body.style.cursor = "auto";
    const wrapper = document.getElementById("targetCursor");
    if (wrapper) wrapper.style.display = "none";
    return;
  }

  const cursor = document.getElementById("targetCursor");
  const dotEl = document.getElementById("targetDot");
  const corners = cursor.querySelectorAll(".target-cursor-corner");

  if (!cursor || !dotEl) return;

  document.body.style.cursor = "none";

  let activeTarget = null;
  let currentLeaveHandler = null;
  let resumeTimeout = null;
  let isActive = false;
  let targetCornerPositions = null;
  let activeStrength = { current: 0 };

  gsap.set(cursor, {
    xPercent: -50,
    yPercent: -50,
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  let spinTl = gsap.timeline({ repeat: -1 }).to(cursor, {
    rotation: "+=360",
    duration: SPIN_DURATION,
    ease: "none",
  });

  function moveCursor(x, y) {
    gsap.to(cursor, { x, y, duration: 0.1, ease: "power3.out" });
  }

  function tickerFn() {
    if (!targetCornerPositions || !cursor || !corners.length) return;
    const strength = activeStrength.current;
    if (strength === 0) return;

    const cursorX = gsap.getProperty(cursor, "x");
    const cursorY = gsap.getProperty(cursor, "y");

    corners.forEach((corner, i) => {
      const currentX = gsap.getProperty(corner, "x");
      const currentY = gsap.getProperty(corner, "y");
      const targetX = targetCornerPositions[i].x - cursorX;
      const targetY = targetCornerPositions[i].y - cursorY;
      const finalX = currentX + (targetX - currentX) * strength;
      const finalY = currentY + (targetY - currentY) * strength;
      const duration = strength >= 0.99 ? (PARALLAX_ON ? 0.2 : 0) : 0.05;

      gsap.to(corner, {
        x: finalX,
        y: finalY,
        duration: duration,
        ease: duration === 0 ? "none" : "power1.out",
        overwrite: "auto",
      });
    });
  }

  window.addEventListener("mousemove", (e) => moveCursor(e.clientX, e.clientY), { passive: true });

  window.addEventListener("mousedown", () => {
    gsap.to(dotEl, { scale: 0.7, duration: 0.3 });
    gsap.to(cursor, { scale: 0.9, duration: 0.2 });
  });
  window.addEventListener("mouseup", () => {
    gsap.to(dotEl, { scale: 1, duration: 0.3 });
    gsap.to(cursor, { scale: 1, duration: 0.2 });
  });

  window.addEventListener("scroll", () => {
    if (!activeTarget || !cursor) return;
    const mouseX = gsap.getProperty(cursor, "x");
    const mouseY = gsap.getProperty(cursor, "y");
    const el = document.elementFromPoint(mouseX, mouseY);
    const stillOver = el && (el === activeTarget || el.closest(TARGET_SELECTOR) === activeTarget);
    if (!stillOver && currentLeaveHandler) currentLeaveHandler();
  }, { passive: true });

  function enterHandler(e) {
    let target = null;
    let current = e.target;
    while (current && current !== document.body) {
      if (current.matches(TARGET_SELECTOR)) {
        target = current;
        break;
      }
      current = current.parentElement;
    }
    if (!target || !cursor || !corners.length) return;
    if (activeTarget === target) return;

    if (activeTarget && currentLeaveHandler) {
      activeTarget.removeEventListener("mouseleave", currentLeaveHandler);
      currentLeaveHandler = null;
    }

    if (resumeTimeout) {
      clearTimeout(resumeTimeout);
      resumeTimeout = null;
    }

    activeTarget = target;
    corners.forEach((c) => gsap.killTweensOf(c));
    gsap.killTweensOf(cursor, "rotation");
    spinTl.pause();
    gsap.set(cursor, { rotation: 0 });

    const rect = target.getBoundingClientRect();
    const cursorX = gsap.getProperty(cursor, "x");
    const cursorY = gsap.getProperty(cursor, "y");

    targetCornerPositions = [
      { x: rect.left - BORDER_WIDTH, y: rect.top - BORDER_WIDTH },
      { x: rect.right + BORDER_WIDTH - CORNER_SIZE, y: rect.top - BORDER_WIDTH },
      { x: rect.right + BORDER_WIDTH - CORNER_SIZE, y: rect.bottom + BORDER_WIDTH - CORNER_SIZE },
      { x: rect.left - BORDER_WIDTH, y: rect.bottom + BORDER_WIDTH - CORNER_SIZE },
    ];

    isActive = true;
    gsap.ticker.add(tickerFn);

    gsap.to(activeStrength, {
      current: 1,
      duration: HOVER_DURATION,
      ease: "power2.out",
    });

    corners.forEach((corner, i) => {
      gsap.to(corner, {
        x: targetCornerPositions[i].x - cursorX,
        y: targetCornerPositions[i].y - cursorY,
        duration: 0.2,
        ease: "power2.out",
      });
    });

    const leaveHandler = () => {
      gsap.ticker.remove(tickerFn);
      isActive = false;
      targetCornerPositions = null;
      gsap.set(activeStrength, { current: 0, overwrite: true });
      activeTarget = null;

      gsap.killTweensOf(Array.from(corners));
      const positions = [
        { x: -CORNER_SIZE * 1.5, y: -CORNER_SIZE * 1.5 },
        { x: CORNER_SIZE * 0.5, y: -CORNER_SIZE * 1.5 },
        { x: CORNER_SIZE * 0.5, y: CORNER_SIZE * 0.5 },
        { x: -CORNER_SIZE * 1.5, y: CORNER_SIZE * 0.5 },
      ];

      const tl = gsap.timeline();
      corners.forEach((corner, idx) => {
        tl.to(corner, { x: positions[idx].x, y: positions[idx].y, duration: 0.3, ease: "power3.out" }, 0);
      });

      resumeTimeout = setTimeout(() => {
        if (!activeTarget && cursor && spinTl) {
          const rot = gsap.getProperty(cursor, "rotation");
          const norm = rot % 360;
          spinTl.kill();
          spinTl = gsap.timeline({ repeat: -1 }).to(cursor, {
            rotation: "+=360",
            duration: SPIN_DURATION,
            ease: "none",
          });
          gsap.to(cursor, {
            rotation: norm + 360,
            duration: SPIN_DURATION * (1 - norm / 360),
            ease: "none",
            onComplete: () => spinTl.restart(),
          });
        }
        resumeTimeout = null;
      }, 50);

      target.removeEventListener("mouseleave", leaveHandler);
      currentLeaveHandler = null;
    };

    currentLeaveHandler = leaveHandler;
    target.addEventListener("mouseleave", leaveHandler);
  }

  window.addEventListener("mouseover", enterHandler, { passive: true });
})();

// ── SCROLL PROGRESS ──
document.addEventListener(
  "scroll",
  () => {
    const p = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    document.getElementById("scroll-bar").style.width = p + "%";
  },
  { passive: true }
);

// ── TOAST NOTIFICATIONS ──
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = "toast toast-" + type + " toast-show";
  setTimeout(() => {
    toast.classList.remove("toast-show");
  }, 3500);
}

// ── COUNT-UP ANIMATION ──
function countUp(el) {
  const target = parseInt(el.dataset.count);
  const suffix = el.dataset.suffix || "";
  const dur = 1600;
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 4);
    el.textContent = Math.floor(ease * target) + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ── PAGE TRANSITIONS (split wipe) ──
let transitioning = false;
function showSection(id) {
  // Guard: admin-only sections
  if (id === "admin" && currentUserRole !== "admin") {
    showToast("Access denied. Admin only.", "error");
    return;
  }
  if ((id === "dashboard" || id === "admin") && !currentUser) {
    showToast("Please sign in first.", "error");
    openAuth("signin");
    return;
  }

  if (transitioning) return;
  const cur2 = document.querySelector("section.page.active");
  if (cur2 && cur2.id === id) return;
  transitioning = true;

  const top = document.getElementById("pt-top"), bot = document.getElementById("pt-bot");
  top.classList.remove("exit"); bot.classList.remove("exit");
  top.classList.add("enter"); bot.classList.add("enter");

  setTimeout(() => {
    document.querySelectorAll("section.page").forEach((s) => s.classList.remove("active", "visible"));
    document.querySelectorAll(".nav-links a, .mob-menu a").forEach((a) => a.classList.remove("active"));

    const sec = document.getElementById(id);
    sec.classList.add("active");
    document.getElementById("nav-" + id)?.classList.add("active");
    document.getElementById("mnav-" + id)?.classList.add("active");
    window.scrollTo(0, 0);

    // Load admin data when tab opens
    if (id === "admin" && currentUserRole === "admin") {
      loadAdminData();
    }
    if (id === "dashboard" && currentUser) {
      loadDashboardData();
    }

    setTimeout(() => {
      sec.classList.add("visible");
      sec.querySelectorAll(".sg").forEach((g) => {
        g.classList.remove("in");
        setTimeout(() => g.classList.add("in"), 80);
      });
      sec.querySelectorAll("[data-count]").forEach((el) => {
        el.textContent = "0" + (el.dataset.suffix || "");
        countUp(el);
      });
    }, 70);

    top.classList.remove("enter"); bot.classList.remove("enter");
    top.classList.add("exit"); bot.classList.add("exit");

    setTimeout(() => {
      top.classList.remove("exit"); bot.classList.remove("exit");
      transitioning = false;
    }, 450);
  }, 420);
}

// Init home on load
setTimeout(() => {
  const home = document.getElementById("home");
  home.classList.add("visible");
  home.querySelectorAll(".sg").forEach((g) => g.classList.add("in"));
  home.querySelectorAll("[data-count]").forEach((el) => countUp(el));
  // Load stats from Firestore immediately
  loadStats();
}, 200);

// ── MOBILE MENU ──
function toggleMob() { document.getElementById("mobMenu").classList.toggle("open"); }
function closeMob() { document.getElementById("mobMenu").classList.remove("open"); }
document.addEventListener("click", (e) => {
  const m = document.getElementById("mobMenu"), h = document.getElementById("hamburger");
  if (m.classList.contains("open") && !m.contains(e.target) && !h.contains(e.target)) closeMob();
});

// ── PROJECT FILTER ──
let activeProjectFilter = 'all';
function fProj(btn, cat) {
  activeProjectFilter = cat;
  document.querySelectorAll(".fil").forEach((b) => b.classList.remove("on"));
  btn.classList.add("on");
  applyProjectFilters();
}

// ── PROJECT SEARCH ──
let projectSearchQuery = '';
function searchProjects(query) {
  projectSearchQuery = (query || '').toLowerCase().trim();
  applyProjectFilters();
}

function applyProjectFilters() {
  document.querySelectorAll(".pc").forEach((c, i) => {
    const catMatch = activeProjectFilter === "all" || c.dataset.cat === activeProjectFilter;
    const nameMatch = !projectSearchQuery ||
      (c.dataset.name || '').toLowerCase().includes(projectSearchQuery) ||
      (c.dataset.desc || '').toLowerCase().includes(projectSearchQuery);
    const show = catMatch && nameMatch;
    c.style.transition = `opacity .35s ${i * 0.06}s, transform .35s ${i * 0.06}s`;
    if (show) {
      c.style.opacity = "1"; c.style.transform = ""; c.style.display = "";
    } else {
      c.style.opacity = "0"; c.style.transform = "scale(0.94)";
      setTimeout(() => { if (c.style.opacity === "0") c.style.display = "none"; }, 380);
    }
  });
}

// ── SERVICE DETAILS TOGGLE ──
function toggleSvcDetails(btn) {
  const details = btn.nextElementSibling;
  if (!details) return;
  const isOpen = details.classList.contains('open');
  // Close all others first
  document.querySelectorAll('.svc-details.open').forEach(d => {
    d.classList.remove('open');
    d.previousElementSibling.textContent = 'View Details ↓';
  });
  if (!isOpen) {
    details.classList.add('open');
    btn.textContent = 'Hide Details ↑';
  }
}

// ── MODALS (Booking & Auth) ──
function openBooking(svc) {
  document.getElementById("bForm").style.display = "block";
  document.getElementById("bOk").style.display = "none";
  document.getElementById("bSvc").value = svc;
  // Pre-fill if signed in
  if (currentUserData) {
    document.getElementById("bN").value = currentUserData.name || "";
    document.getElementById("bE").value = currentUserData.email || "";
  }
  document.getElementById("bModal").classList.add("show");
}
function closeBook() {
  document.getElementById("bModal").classList.remove("show");
  setTimeout(() => {
    document.getElementById("bN").value = "";
    document.getElementById("bE").value = "";
    document.getElementById("bPhone").value = "";
    document.getElementById("bMsg").value = "";
    document.getElementById("bForm").style.display = "block";
    document.getElementById("bOk").style.display = "none";
  }, 300);
}
function submitBook() {
  const svc = document.getElementById("bSvc").value;
  const n = document.getElementById("bN").value.trim();
  const e = document.getElementById("bE").value.trim();
  const phone = document.getElementById("bPhone").value.trim();
  const msg = document.getElementById("bMsg").value.trim();
  if (!n || !e.includes("@")) return showToast("Valid name and email required.", "error");

  const bookingData = {
    service: svc,
    name: n,
    email: e,
    phone: phone,
    message: msg,
    userId: currentUser ? currentUser.uid : null,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    status: "pending"
  };

  // Save booking to Firestore
  db.collection("bookings").add(bookingData).then(() => {
    document.getElementById("bForm").style.display = "none";
    document.getElementById("bOk").style.display = "block";
    showToast("Booking submitted successfully!");

    // Send email via EmailJS
    sendBookingEmail(n, e, phone, svc, msg);

    // Record to Google Sheets
    sendToGoogleSheet(n, e, phone, svc, msg);

  }).catch((err) => {
    showToast("Failed to submit booking: " + err.message, "error");
  });
}

// ══════════════════════════════════════════════════════
//  FIREBASE AUTH
// ══════════════════════════════════════════════════════

let aMode = "signin";

function openAuth(m) {
  aMode = m;
  updAuth();
  document.getElementById("authError").style.display = "none";
  document.getElementById("aE").value = "";
  document.getElementById("aP").value = "";
  document.getElementById("aN").value = "";
  document.getElementById("aModal").classList.add("show");
}

function closeAuth() {
  document.getElementById("aModal").classList.remove("show");
}

function togAuth() {
  aMode = aMode === "signin" ? "signup" : "signin";
  document.getElementById("authError").style.display = "none";
  updAuth();
}

function updAuth() {
  const up = aMode === "signup";
  document.getElementById("aT").textContent = up ? "Create account" : "Welcome back";
  document.getElementById("aSB").textContent = up ? "Create Account" : "Sign In";
  document.getElementById("aNW").style.display = up ? "block" : "none";
  document.getElementById("aTP").innerHTML = up
    ? "Already have an account? <a onclick='togAuth()'>Sign in</a>"
    : "Don't have an account? <a onclick='togAuth()'>Sign up free</a>";
}

function showAuthError(msg) {
  const el = document.getElementById("authError");
  el.textContent = msg;
  el.style.display = "block";
}

function subAuth() {
  const email = document.getElementById("aE").value.trim();
  const pass = document.getElementById("aP").value.trim();
  const name = document.getElementById("aN").value.trim();

  if (!email || !pass) {
    showAuthError("Email and password are required.");
    return;
  }
  if (aMode === "signup" && !name) {
    showAuthError("Please enter your full name.");
    return;
  }

  const btn = document.getElementById("aSB");
  btn.textContent = "Loading...";
  btn.disabled = true;

  if (aMode === "signup") {
    let newCred = null;
    auth.createUserWithEmailAndPassword(email, pass)
      .then((cred) => {
        newCred = cred;
        // Save the name in the Firebase Auth profile instead of Firestore for now
        return newCred.user.updateProfile({
          displayName: name
        });
      })
      .then(() => {
        // Send email verification link
        return newCred.user.sendEmailVerification();
      })
      .then(() => {
        // Immediately sign out to force verification
        return auth.signOut();
      })
      .then(() => {
        closeAuth();
        showToast("Account created! Please check your inbox to verify your email.", "success");
      })
      .catch((err) => {
        showAuthError(getAuthErrorMessage(err.code));
        btn.textContent = "Create Account";
        btn.disabled = false;
      });
  } else {
    auth.signInWithEmailAndPassword(email, pass)
      .then((cred) => {
        // Enforce email verification for 'email/password' sign-ins
        if (!cred.user.emailVerified) {
          // Send a fresh verification email because the old one might have expired
          cred.user.sendEmailVerification().catch(() => {});
          auth.signOut();
          showAuthError("Account not verified! A fresh verification link was just sent to your inbox.");
          btn.textContent = "Sign In";
          btn.disabled = false;
        } else {
          // Only create the user data document in Firestore AFTER they successfully verify and login
          return db.collection("users").doc(cred.user.uid).get().then((doc) => {
            if (!doc.exists) {
              return db.collection("users").doc(cred.user.uid).set({
                name: cred.user.displayName || "User",
                email: cred.user.email,
                role: "user",
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
              });
            }
          }).then(() => {
            closeAuth();
            showToast("Signed in successfully!");
          });
        }
      })
      .catch((err) => {
        showAuthError(getAuthErrorMessage(err.code));
        btn.textContent = "Sign In";
        btn.disabled = false;
      });
  }
}

function subAuthGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      return db.collection("users").doc(user.uid).get().then((doc) => {
        if (!doc.exists) {
          return db.collection("users").doc(user.uid).set({
            name: user.displayName || "User",
            email: user.email,
            role: "user",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
      });
    })
    .then(() => {
      closeAuth();
      showToast("Signed in with Google successfully!");
    })
    .catch((err) => {
      console.error("Google Auth Error:", err);
      showAuthError("Google Auth Error: " + err.message);
    });
}

function getAuthErrorMessage(code) {
  const messages = {
    "auth/email-already-in-use": "This email is already registered. Try signing in.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-credential": "Invalid credentials. Please check and try again.",
    "auth/too-many-requests": "Too many attempts. Please wait and try again.",
    "auth/network-request-failed": "Network error. Check your connection.",
  };
  return messages[code] || "Authentication failed. Please try again.";
}

function handleSignOut() {
  auth.signOut().then(() => {
    showToast("Signed out successfully.");
    // Go to home if on protected page
    const activePage = document.querySelector("section.page.active");
    if (activePage && (activePage.id === "admin" || activePage.id === "dashboard")) {
      showSection("home");
    }
  });
}

// ── AUTH STATE OBSERVER ──
auth.onAuthStateChanged((user) => {
  if (user) {
    // Forcefully check if the user account is still valid/active in Firebase
    user.reload().then(() => {
      currentUser = auth.currentUser; // get latest references
      
      // Prevent unverified email/password users from appearing logged in
      const isPasswordUser = currentUser.providerData && currentUser.providerData.some(p => p.providerId === 'password');
      if (isPasswordUser && !currentUser.emailVerified) {
        auth.signOut();
        return; // stop the state check entirely
      }
      
      // Fetch user role from Firestore
      db.collection("users").doc(user.uid).get().then((doc) => {
        if (doc.exists) {
          currentUserData = doc.data();
          currentUserRole = (currentUserData.role || "user").trim();
        } else {
          currentUserRole = "user";
          currentUserData = { email: user.email, name: user.displayName || "User" };
        }
        updateAuthUI(true);
      }).catch(() => {
        currentUserRole = "user";
        currentUserData = { email: user.email, name: "User" };
        updateAuthUI(true);
      });
    }).catch((error) => {
      // If user was deleted from Firebase Console, this throws an error.
      // We log them out so their local session doesn't linger.
      auth.signOut();
      currentUser = null;
      currentUserRole = null;
      currentUserData = null;
      updateAuthUI(false);
    });
  } else {
    currentUser = null;
    currentUserRole = null;
    currentUserData = null;
    updateAuthUI(false);
  }
});

function updateAuthUI(isSignedIn) {
  // Nav CTAs
  const ctaOut = document.getElementById("navCtaOut");
  const ctaIn = document.getElementById("navCtaIn");
  const mobOut = document.getElementById("mobBtnsOut");
  const mobIn = document.getElementById("mobBtnsIn");

  if (isSignedIn) {
    ctaOut.style.display = "none";
    ctaIn.style.display = "flex";
    mobOut.style.display = "none";
    mobIn.style.display = "flex";

    // User pill
    const name = currentUserData?.name || currentUser?.email?.split("@")[0] || "User";
    const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    document.getElementById("userPillAvatar").textContent = initials;
    document.getElementById("userPillName").textContent = name;

    // Show dashboard link
    document.querySelectorAll(".nav-auth-only").forEach(el => el.style.display = "");

    // Show admin link if admin
    if (currentUserRole === "admin") {
      document.querySelectorAll(".nav-admin-only").forEach(el => el.style.display = "");
      // Hide booking/service buttons for admin — they manage, not book
      document.querySelectorAll(".btn-svc, .btn-hm").forEach(el => el.style.display = "none");
      // Hide dashboard for admin (they use admin panel instead)
      document.querySelectorAll(".nav-auth-only").forEach(el => {
        if (el.id === "nav-dashboard" || el.id === "mnav-dashboard") el.style.display = "none";
      });
    } else {
      document.querySelectorAll(".nav-admin-only").forEach(el => el.style.display = "none");
      // Show booking buttons for regular users
      document.querySelectorAll(".btn-svc, .btn-hm").forEach(el => el.style.display = "");
    }
  } else {
    ctaOut.style.display = "flex";
    ctaIn.style.display = "none";
    mobOut.style.display = "flex";
    mobIn.style.display = "none";

    document.querySelectorAll(".nav-auth-only").forEach(el => el.style.display = "none");
    document.querySelectorAll(".nav-admin-only").forEach(el => el.style.display = "none");
  }

  // Reset auth modal button
  const btn = document.getElementById("aSB");
  if (btn) {
    btn.disabled = false;
    btn.textContent = aMode === "signup" ? "Create Account" : "Sign In";
  }

  // Load dynamic content from Firestore
  loadPublicContent();
}

// ══════════════════════════════════════════════════════
//  FIRESTORE — PUBLIC CONTENT LOADING
// ══════════════════════════════════════════════════════

let projectsLoaded = false;
let testimonialsLoaded = false;
let teamLoaded = false;

function loadPublicContent() {
  loadProjects();
  loadTestimonials();
  loadStats();
  loadTeam();
}

// ── LOAD PROJECTS ──
function loadProjects() {
  db.collection("projects").orderBy("createdAt", "desc").get().then((snap) => {
    if (snap.empty && !projectsLoaded) return; // Keep hardcoded fallback
    projectsLoaded = true;

    const grid = document.getElementById("projectsGrid");
    grid.innerHTML = "";

    if (snap.empty) {
      grid.innerHTML = '<div style="grid-column: span 12; text-align: center; color: var(--text3); padding: 60px 0;">No projects yet.</div>';
      return;
    }

    const gradients = [
      "linear-gradient(135deg, #0d2137, #1a3a5c, #0d2a3a)",
      "linear-gradient(135deg, #0d1f2d, #0f3d2a, #0d2d1a)",
      "linear-gradient(135deg, #1a0d2d, #2d1a3d, #0d1a2d)",
      "linear-gradient(135deg, #271e0a, #3d2a0a, #1a1e0a)",
      "linear-gradient(135deg, #0a271e, #0a3d2a, #0a1a2d)",
    ];

    let idx = 0;
    snap.forEach((doc) => {
      const d = doc.data();
      const layout = d.layout || "big";
      const gradient = gradients[idx % gradients.length];
      idx++;

      const card = document.createElement("div");
      card.className = `pc ${layout}`;
      card.dataset.cat = d.category || "web";
      card.dataset.name = d.name || '';
      card.dataset.desc = d.description || '';
      if (d.url) {
        card.style.cursor = 'pointer';
        card.onclick = () => window.open(d.url, '_blank');
      }
      const bgStyle = d.image
        ? `background-image: url('${d.image}'); background-size: cover; background-position: center;`
        : `background: ${gradient}`;
      card.innerHTML = `
        <div class="pbg" style="${bgStyle}"></div>
        <div class="p-emoji">${d.emoji || "📦"}</div>
        <div class="pcon">
          <div class="p-ref">REF_ID: ${doc.id.slice(0, 8).toUpperCase()}</div>
          <div class="p-name">${escHtml(d.name)}</div>
          <div class="p-desc">${escHtml(d.description)}</div>
          ${d.url ? '<div class="p-link">🔗 View Project</div>' : ''}
        </div>
      `;
      grid.appendChild(card);
    });
  }).catch(() => {
    // Keep hardcoded fallback on error
  });
}

// ── LOAD TESTIMONIALS ──
function loadTestimonials() {
  db.collection("testimonials").orderBy("createdAt", "desc").get().then((snap) => {
    if (snap.empty && !testimonialsLoaded) return; // Keep hardcoded fallback
    testimonialsLoaded = true;

    const grid = document.getElementById("testimonialsGrid");
    grid.innerHTML = "";

    if (snap.empty) {
      grid.innerHTML = '<div style="text-align: center; color: var(--text3); padding: 60px 0;">No testimonials yet.</div>';
      return;
    }

    const avColors = [
      { bg: "linear-gradient(135deg, rgba(74,222,128,0.2), rgba(34,211,238,0.15))", color: "var(--accent)" },
      { bg: "linear-gradient(135deg, rgba(129,140,248,0.2), rgba(253,224,71,0.1))", color: "var(--accent3)" },
      { bg: "linear-gradient(135deg, rgba(253,224,71,0.2), rgba(74,222,128,0.1))", color: "var(--gold)" },
    ];

    let idx = 0;
    snap.forEach((doc) => {
      const d = doc.data();
      const rating = parseInt(d.rating) || 5;
      const stars = "⭐".repeat(rating);
      const initials = (d.clientName || "").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
      const avStyle = avColors[idx % avColors.length];
      const isFeat = idx === 0;
      idx++;

      const card = document.createElement("div");
      card.className = `tc${isFeat ? " feat" : ""}`;
      card.innerHTML = `
        <div class="tref">CLT-${String(idx).padStart(3, "0")} // ${rating}★</div>
        <span class="tqm">"</span>
        <div class="tstars">${stars}</div>
        <p class="tt">${escHtml(d.quote)}</p>
        <div class="tau">
          <div class="av" style="background: ${avStyle.bg}; color: ${avStyle.color}">${initials}</div>
          <div>
            <div class="an">${escHtml(d.clientName)}</div>
            <div class="ar">${escHtml(d.role)}</div>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }).catch(() => {
    // Keep hardcoded fallback on error
  });
}

// ── LOAD STATS ──
function loadStats() {
  db.collection("siteConfig").doc("stats").get().then((doc) => {
    if (!doc.exists) return;
    const d = doc.data();

    // Update ALL stat elements on the page and re-run countUp
    if (d.projects !== undefined) {
      updateAllStats("projects", d.projects, "+");
    }
    if (d.clients !== undefined) {
      updateAllStats("clients", d.clients, "+");
    }
    if (d.years !== undefined) {
      updateAllStats("years", d.years, "+");
    }
    if (d.satisfaction !== undefined) {
      updateAllStats("satisfaction", d.satisfaction, "%");
    }
    if (d.response !== undefined) {
      updateAllStats("response", d.response, "h");
    }
  }).catch(() => {
    // Keep defaults on error
  });
}

function updateAllStats(statName, value, suffix) {
  // Update by ID (hero stats)
  const el = document.getElementById("stat-" + statName);
  if (el) {
    el.dataset.count = value;
    el.dataset.suffix = suffix;
    countUp(el);
  }

  // Update hex stats row by matching label text
  const labelMap = {
    "projects": "Projects",
    "clients": "Clients",
    "years": "Yrs Exp",
    "satisfaction": "Satisfaction",
    "response": "Response"
  };
  const label = labelMap[statName];
  if (label) {
    document.querySelectorAll(".hsp").forEach((pill) => {
      const pillLabel = pill.querySelector(".hsp-l");
      if (pillLabel && pillLabel.textContent.trim() === label) {
        const numEl = pill.querySelector(".hsp-n");
        if (numEl) {
          numEl.dataset.count = value;
          numEl.dataset.suffix = suffix;
          countUp(numEl);
        }
      }
    });
  }
}

// ── LOAD TEAM ──
function loadTeam() {
  db.collection("team").orderBy("createdAt", "asc").get().then((snap) => {
    if (snap.empty && !teamLoaded) return;
    teamLoaded = true;

    const grid = document.getElementById("teamGrid");
    grid.innerHTML = "";

    if (snap.empty) {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text3); padding: 60px 0;">No team members added yet.</div>';
      return;
    }

    snap.forEach((doc) => {
      const d = doc.data();
      const card = document.createElement("div");
      card.className = "team-card";
      let socialsHtml = "";
      if (d.linkedin) socialsHtml += `<a href="${d.linkedin}" target="_blank" class="tm-social" title="LinkedIn">💼</a>`;
      if (d.github) socialsHtml += `<a href="${d.github}" target="_blank" class="tm-social" title="GitHub/Twitter">🔗</a>`;

      card.innerHTML = `
        <img src="${d.image || 'https://via.placeholder.com/80/333/fff?text=' + escHtml(d.name).charAt(0).toUpperCase()}" alt="${escHtml(d.name)}" class="tm-img" />
        <div class="tm-name">${escHtml(d.name)}</div>
        <div class="tm-role">${escHtml(d.role)}</div>
        <div class="tm-desc">${escHtml(d.description)}</div>
        <div class="tm-socials">
          ${socialsHtml}
        </div>
      `;
      grid.appendChild(card);
    });
  }).catch(() => { });
}

// ── UTILITY ──
function escHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

// ══════════════════════════════════════════════════════
//  ADMIN PANEL — TABS & CRUD
// ══════════════════════════════════════════════════════

function switchAdminTab(btn, tabId) {
  document.querySelectorAll(".admin-tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".admin-tab-content").forEach(c => c.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById(tabId).classList.add("active");
}

function loadAdminData() {
  renderAdminProjects();
  renderAdminTestimonials();
  loadAdminStats();
  renderAdminBookings();
  renderAdminTeam();
  renderAdminUsers();
}

// ── ADMIN: PROJECTS ──
function adminSaveProject() {
  const editId = document.getElementById("apEditId").value;
  const name = document.getElementById("apName").value.trim();
  const desc = document.getElementById("apDesc").value.trim();
  const cat = document.getElementById("apCat").value;
  const emoji = document.getElementById("apEmoji").value.trim() || "📦";
  const layout = document.getElementById("apLayout").value;
  const image = document.getElementById("apImage").value.trim();
  const url = document.getElementById("apUrl").value.trim();

  if (!name || !desc) {
    showToast("Project name and description are required.", "error");
    return;
  }

  const projectData = {
    name, description: desc, category: cat, emoji, layout, image, url,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  if (editId) {
    // UPDATE existing project
    db.collection("projects").doc(editId).update(projectData).then(() => {
      showToast("Project updated successfully!");
      adminCancelEditProject();
      renderAdminProjects();
      loadProjects();
    }).catch((err) => {
      showToast("Failed to update: " + err.message, "error");
    });
  } else {
    // ADD new project
    projectData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    db.collection("projects").add(projectData).then(() => {
      showToast("Project added successfully!");
      adminCancelEditProject();
      renderAdminProjects();
      loadProjects();
    }).catch((err) => {
      showToast("Failed to add project: " + err.message, "error");
    });
  }
}

function adminEditProject(id) {
  db.collection("projects").doc(id).get().then((doc) => {
    if (!doc.exists) return;
    const d = doc.data();

    // Populate form
    document.getElementById("apEditId").value = id;
    document.getElementById("apName").value = d.name || "";
    document.getElementById("apDesc").value = d.description || "";
    document.getElementById("apImage").value = d.image || "";
    document.getElementById("apUrl").value = d.url || "";
    document.getElementById("apCat").value = d.category || "web";
    document.getElementById("apEmoji").value = d.emoji || "";
    document.getElementById("apLayout").value = d.layout || "big";

    // Show image preview if editing a project with an image
    if (d.image) {
      showProjectPreview(d.image);
    } else {
      removeProjectImage();
    }

    // Switch to edit mode UI
    document.getElementById("apFormIcon").textContent = "✏️";
    document.getElementById("apFormTitle").textContent = "Edit Project";
    document.getElementById("apSubmitBtn").textContent = "Update Project ✓";
    document.getElementById("apCancelBtn").style.display = "";

    // Scroll form into view
    document.getElementById("apName").scrollIntoView({ behavior: "smooth", block: "center" });
    document.getElementById("apName").focus();
  });
}

function adminCancelEditProject() {
  document.getElementById("apEditId").value = "";
  document.getElementById("apName").value = "";
  document.getElementById("apDesc").value = "";
  document.getElementById("apImage").value = "";
  document.getElementById("apUrl").value = "";
  document.getElementById("apEmoji").value = "";
  document.getElementById("apCat").value = "web";
  document.getElementById("apLayout").value = "big";

  // Reset to add mode UI
  document.getElementById("apFormIcon").textContent = "➕";
  document.getElementById("apFormTitle").textContent = "Add New Project";
  document.getElementById("apSubmitBtn").textContent = "Add Project →";
  document.getElementById("apCancelBtn").style.display = "none";

  // Clear image preview
  if (typeof removeProjectImage === 'function') removeProjectImage();
}

function renderAdminProjects() {
  const list = document.getElementById("adminProjectsList");
  list.innerHTML = '<div class="admin-empty">Loading...</div>';

  db.collection("projects").orderBy("createdAt", "desc").get().then((snap) => {
    if (snap.empty) {
      list.innerHTML = '<div class="admin-empty">No projects yet. Add one above!</div>';
      return;
    }
    list.innerHTML = "";
    snap.forEach((doc) => {
      const d = doc.data();
      const hasImage = d.image ? `<div class="admin-item-thumb" style="background-image: url('${d.image}')"></div>` : "";
      const hasUrl = d.url ? ` · <a href="${d.url}" target="_blank" style="color:var(--accent2);text-decoration:none">🔗 URL</a>` : '';
      const item = document.createElement("div");
      item.className = "admin-item";
      item.innerHTML = `
        <div class="admin-item-info">
          ${hasImage}
          <span class="admin-item-emoji">${d.emoji || "📦"}</span>
          <div>
            <div class="admin-item-name">${escHtml(d.name)}</div>
            <div class="admin-item-meta">${d.category?.toUpperCase() || "WEB"} · ${d.layout || "big"}${d.image ? " · 🖼️" : ""}${hasUrl}</div>
          </div>
        </div>
        <div class="admin-item-actions">
          <button class="btn-admin-edit" onclick="adminEditProject('${doc.id}')">Edit</button>
          <button class="btn-admin-delete" onclick="adminDeleteProject('${doc.id}')">Delete</button>
        </div>
      `;
      list.appendChild(item);
    });
  });
}

function adminDeleteProject(id) {
  if (!confirm("Delete this project?")) return;
  db.collection("projects").doc(id).delete().then(() => {
    showToast("Project deleted.");
    // If we were editing this project, cancel edit
    if (document.getElementById("apEditId").value === id) {
      adminCancelEditProject();
    }
    renderAdminProjects();
    loadProjects();
  }).catch((err) => {
    showToast("Failed: " + err.message, "error");
  });
}

// ── ADMIN: TESTIMONIALS ──
function adminAddTestimonial() {
  const clientName = document.getElementById("atName").value.trim();
  const role = document.getElementById("atRole").value.trim();
  const quote = document.getElementById("atQuote").value.trim();
  const rating = document.getElementById("atRating").value;

  if (!clientName || !quote) {
    showToast("Client name and quote are required.", "error");
    return;
  }

  db.collection("testimonials").add({
    clientName, role, quote, rating: parseInt(rating),
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    showToast("Testimonial added successfully!");
    document.getElementById("atName").value = "";
    document.getElementById("atRole").value = "";
    document.getElementById("atQuote").value = "";
    renderAdminTestimonials();
    loadTestimonials();
  }).catch((err) => {
    showToast("Failed: " + err.message, "error");
  });
}

function renderAdminTestimonials() {
  const list = document.getElementById("adminTestimonialsList");
  list.innerHTML = '<div class="admin-empty">Loading...</div>';

  db.collection("testimonials").orderBy("createdAt", "desc").get().then((snap) => {
    if (snap.empty) {
      list.innerHTML = '<div class="admin-empty">No testimonials yet. Add one above!</div>';
      return;
    }
    list.innerHTML = "";
    snap.forEach((doc) => {
      const d = doc.data();
      const stars = "⭐".repeat(parseInt(d.rating) || 5);
      const item = document.createElement("div");
      item.className = "admin-item";
      item.innerHTML = `
        <div class="admin-item-info">
          <div>
            <div class="admin-item-name">${escHtml(d.clientName)} <span style="font-size:12px">${stars}</span></div>
            <div class="admin-item-meta">${escHtml(d.role)}</div>
            <div class="admin-item-quote">"${escHtml(d.quote?.slice(0, 80))}${d.quote?.length > 80 ? "..." : ""}"</div>
          </div>
        </div>
        <button class="btn-admin-delete" onclick="adminDeleteTestimonial('${doc.id}')">Delete</button>
      `;
      list.appendChild(item);
    });
  });
}

function adminDeleteTestimonial(id) {
  if (!confirm("Delete this testimonial?")) return;
  db.collection("testimonials").doc(id).delete().then(() => {
    showToast("Testimonial deleted.");
    renderAdminTestimonials();
    loadTestimonials();
  }).catch((err) => {
    showToast("Failed: " + err.message, "error");
  });
}

// ── ADMIN: STATS ──
function loadAdminStats() {
  db.collection("siteConfig").doc("stats").get().then((doc) => {
    if (doc.exists) {
      const d = doc.data();
      document.getElementById("asProjects").value = d.projects || "";
      document.getElementById("asClients").value = d.clients || "";
      document.getElementById("asYears").value = d.years || "";
      document.getElementById("asSatisfaction").value = d.satisfaction || "";
      document.getElementById("asResponse").value = d.response || "";
    }
  });
}

function adminUpdateStats() {
  const projects = parseInt(document.getElementById("asProjects").value) || 0;
  const clients = parseInt(document.getElementById("asClients").value) || 0;
  const years = parseInt(document.getElementById("asYears").value) || 0;
  const satisfaction = parseInt(document.getElementById("asSatisfaction").value) || 0;
  const response = parseInt(document.getElementById("asResponse").value) || 0;

  db.collection("siteConfig").doc("stats").set({
    projects, clients, years, satisfaction, response,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    showToast("Stats updated successfully!");
    loadStats();
  }).catch((err) => {
    showToast("Failed: " + err.message, "error");
  });
}

// ── ADMIN: BOOKINGS ──
function renderAdminBookings() {
  const list = document.getElementById("adminBookingsList");
  list.innerHTML = '<div class="admin-empty">Loading...</div>';

  db.collection("bookings").orderBy("createdAt", "desc").get().then((snap) => {
    if (snap.empty) {
      list.innerHTML = '<div class="admin-empty">No bookings yet.</div>';
      return;
    }
    list.innerHTML = "";
    snap.forEach((doc) => {
      const d = doc.data();
      const dateObj = d.createdAt ? new Date(d.createdAt.seconds * 1000) : null;
      const date = dateObj ? dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
      const item = document.createElement("div");
      item.className = "admin-item admin-booking-item";
      item.innerHTML = `
        <div class="admin-item-info">
          <div>
            <div class="admin-item-name">${escHtml(d.name)}</div>
            <div class="admin-item-meta">${escHtml(d.email)} · ${escHtml(d.service)}</div>
            <div class="admin-item-quote" style="margin-top: 8px; font-style: normal; opacity: 0.9"><strong>Description:</strong> ${escHtml(d.message || "No description provided.")}</div>
          </div>
        </div>
        <div class="admin-booking-right">
          <span class="admin-booking-date">${date}</span>
          <span class="admin-booking-status status-${d.status || "pending"}">${(d.status || "pending").toUpperCase()}</span>
          <button class="btn-admin-delete btn-small" onclick="adminDeleteBooking('${doc.id}')">✕</button>
        </div>
      `;
      list.appendChild(item);
    });
  });
}

function adminDeleteBooking(id) {
  if (!confirm("Delete this booking?")) return;
  db.collection("bookings").doc(id).delete().then(() => {
    showToast("Booking deleted.");
    renderAdminBookings();
  });
}

// ══════════════════════════════════════════════════════
//  USER DASHBOARD
// ══════════════════════════════════════════════════════

function loadDashboardData() {
  if (!currentUser || !currentUserData) return;

  const name = currentUserData.name || currentUser.email?.split("@")[0] || "User";
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  document.getElementById("dashAvatar").textContent = initials;
  document.getElementById("dashName").textContent = name;
  document.getElementById("dashEmail").textContent = currentUser.email;
  document.getElementById("dashRole").textContent = currentUserRole === "admin" ? "Administrator" : "Member";

  // Joined date
  if (currentUserData.createdAt) {
    const joined = new Date(currentUserData.createdAt.seconds * 1000);
    document.getElementById("dashJoined").textContent = joined.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  }

  // Load user's bookings
  // Try compound query first; if it fails (missing Firestore composite index), fall back to simple query
  db.collection("bookings").where("userId", "==", currentUser.uid).orderBy("createdAt", "desc").get()
    .catch((err) => {
      console.warn("Compound bookings query failed (likely missing index), falling back to simple query:", err.message);
      // Fallback: query without orderBy (no composite index needed)
      return db.collection("bookings").where("userId", "==", currentUser.uid).get();
    })
    .then((snap) => {
      if (!snap) return;

      // Sort client-side in case we used the fallback query
      const docs = [];
      snap.forEach((doc) => docs.push({ id: doc.id, ...doc.data() }));
      docs.sort((a, b) => {
        const ta = a.createdAt?.seconds || 0;
        const tb = b.createdAt?.seconds || 0;
        return tb - ta;
      });

      document.getElementById("dashBookings").textContent = docs.length;
      const list = document.getElementById("userBookingsList");

      if (docs.length === 0) {
        list.innerHTML = '<div class="dash-empty">No bookings yet. <a onclick="showSection(\'products\')" style="color: var(--accent); cursor: pointer;">Browse services →</a></div>';
        return;
      }

      list.innerHTML = "";
      docs.forEach((d) => {
        const date = d.createdAt ? new Date(d.createdAt.seconds * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
        const item = document.createElement("div");
        item.className = "dash-booking-item";
        item.innerHTML = `
          <div>
            <div class="dash-booking-service">${escHtml(d.service)}</div>
            <div class="dash-booking-date">${date}</div>
          </div>
          <span class="admin-booking-status status-${d.status || "pending"}">${(d.status || "pending").toUpperCase()}</span>
        `;
        list.appendChild(item);
      });
    }).catch((err) => {
      console.error("Failed to load user bookings:", err);
    });
}

// ── ADMIN: TEAM ──
function adminAddTeamMember() {
  const name = document.getElementById("admTeamName").value.trim();
  const role = document.getElementById("admTeamRole").value.trim();
  const desc = document.getElementById("admTeamDesc").value.trim();
  const image = document.getElementById("admTeamImg").value.trim();
  const linkedin = document.getElementById("admTeamLi").value.trim();
  const github = document.getElementById("admTeamGh").value.trim();

  if (!name || !role) return showToast("Name and role are required.", "error");

  db.collection("team").add({
    name, role, description: desc, image, linkedin, github,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    showToast("Team member added!");
    document.getElementById("admTeamName").value = "";
    document.getElementById("admTeamRole").value = "";
    document.getElementById("admTeamDesc").value = "";
    document.getElementById("admTeamImg").value = "";
    document.getElementById("admTeamLi").value = "";
    document.getElementById("admTeamGh").value = "";
    renderAdminTeam();
    loadTeam(); // refresh public roster
  }).catch((err) => showToast("Error adding team member: " + err.message, "error"));
}

function renderAdminTeam() {
  const list = document.getElementById("adminTeamList");
  // Only attempt to load if element exists
  if (!list) return;
  list.innerHTML = '<div class="admin-empty">Loading team...</div>';
  db.collection("team").orderBy("createdAt", "asc").get().then((snap) => {
    list.innerHTML = "";
    if (snap.empty) {
      list.innerHTML = '<div class="admin-empty">No team members. Add above.</div>';
      return;
    }
    snap.forEach((doc) => {
      const d = doc.data();
      const div = document.createElement("div");
      div.className = "admin-item";
      div.innerHTML = `
        <div class="ai-info">
          <div class="ai-title">${escHtml(d.name)}</div>
          <div class="ai-desc">${escHtml(d.role)}</div>
        </div>
        <div class="ai-acts">
          <button class="btn-ai-del" onclick="adminDeleteTeamMember('${doc.id}')">Delete</button>
        </div>
      `;
      list.appendChild(div);
    });
  }).catch(() => list.innerHTML = '<div class="admin-empty" style="color:var(--accent)">Failed to load.</div>');
}

function adminDeleteTeamMember(id) {
  if (!confirm("Remove this team member?")) return;
  db.collection("team").doc(id).delete().then(() => {
    showToast("Team member removed.");
    renderAdminTeam();
    loadTeam(); // refresh public roster
  });
}

// ── ADMIN: USER ROLE MANAGEMENT ──
let allUsersCache = [];

function renderAdminUsers() {
  const list = document.getElementById("adminUsersList");
  if (!list) return;
  list.innerHTML = '<div class="admin-empty">Loading users...</div>';

  db.collection("users").get().then((snap) => {
    allUsersCache = [];
    snap.forEach((doc) => {
      allUsersCache.push({ id: doc.id, ...doc.data() });
    });

    // Sort: admins first, then alphabetical
    allUsersCache.sort((a, b) => {
      const ra = (a.role || "user").trim();
      const rb = (b.role || "user").trim();
      if (ra === "admin" && rb !== "admin") return -1;
      if (ra !== "admin" && rb === "admin") return 1;
      return (a.name || "").localeCompare(b.name || "");
    });

    renderFilteredUsers("");
  }).catch((err) => {
    list.innerHTML = '<div class="admin-empty" style="color:#ef4444">Failed to load users: ' + err.message + '</div>';
  });
}

function filterAdminUsers(query) {
  renderFilteredUsers(query);
}

function renderFilteredUsers(query) {
  const list = document.getElementById("adminUsersList");
  if (!list) return;
  list.innerHTML = "";

  const q = (query || "").toLowerCase().trim();
  const filtered = q
    ? allUsersCache.filter(u => {
      return (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q);
    })
    : allUsersCache;

  if (filtered.length === 0) {
    list.innerHTML = '<div class="admin-empty">No users found.</div>';
    return;
  }

  filtered.forEach((u) => {
    const role = (u.role || "user").trim();
    const isAdmin = role === "admin";
    const isSelf = currentUser && u.id === currentUser.uid;
    const initials = (u.name || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    const joinDate = u.createdAt
      ? new Date(u.createdAt.seconds * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
      : "—";

    const item = document.createElement("div");
    item.className = "admin-item admin-user-item";
    item.innerHTML = `
      <div class="admin-item-info">
        <div class="admin-user-avatar" style="background: ${isAdmin ? 'linear-gradient(135deg, var(--gold), #f59e0b)' : 'linear-gradient(135deg, var(--accent), var(--accent2))'}; color: #06080d;">${initials}</div>
        <div>
          <div class="admin-item-name">
            ${escHtml(u.name || "Unknown")}
            ${isSelf ? '<span class="user-you-badge">YOU</span>' : ''}
          </div>
          <div class="admin-item-meta">${escHtml(u.email || "—")} · Joined ${joinDate}</div>
        </div>
      </div>
      <div class="admin-user-role-toggle">
        <span class="role-label ${isAdmin ? 'role-admin' : 'role-user'}">${isAdmin ? '🔐 ADMIN' : '👤 USER'}</span>
        <button class="btn-role-toggle ${isAdmin ? 'btn-demote' : 'btn-promote'}" 
          onclick="toggleUserRole('${u.id}', '${role}', ${isSelf})" 
          ${isSelf ? 'title="You cannot change your own role"' : (isAdmin ? 'title="Demote to User"' : 'title="Promote to Admin"')}>
          ${isSelf ? '🔒' : (isAdmin ? 'Demote ↓' : 'Make Admin ↑')}
        </button>
      </div>
    `;
    list.appendChild(item);
  });
}

function toggleUserRole(userId, currentRole, isSelf) {
  if (isSelf) {
    showToast("You cannot change your own role.", "error");
    return;
  }

  const newRole = currentRole.trim() === "admin" ? "user" : "admin";
  const action = newRole === "admin" ? "promote to Admin" : "demote to User";

  if (!confirm(`Are you sure you want to ${action} this user?`)) return;

  db.collection("users").doc(userId).update({ role: newRole })
    .then(() => {
      showToast(`User ${newRole === 'admin' ? 'promoted to Admin' : 'demoted to User'} successfully!`);
      // Update local cache
      const cached = allUsersCache.find(u => u.id === userId);
      if (cached) cached.role = newRole;
      // Re-render with current search
      const searchVal = document.getElementById("userSearchInput")?.value || "";
      renderFilteredUsers(searchVal);
    })
    .catch((err) => {
      showToast("Failed to update role: " + err.message, "error");
    });
}

// ── Backdrop Close ──
document.getElementById("bModal").addEventListener("click", (e) => { if (e.target === document.getElementById("bModal")) closeBook(); });
document.getElementById("aModal").addEventListener("click", (e) => { if (e.target === document.getElementById("aModal")) closeAuth(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeBook(); closeAuth(); closeMob(); } });

// ══════════════════════════════════════════════════════
//  IMAGE UPLOAD — Device, Google Drive, URL
// ══════════════════════════════════════════════════════

function compressImage(file) {
  return new Promise((resolve) => {
    if (file.size < 300 * 1024) return resolve(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          } else {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.8);
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

// ── UPLOAD TO FIREBASE STORAGE ──
function uploadImageToStorage(file, folder, progressBarId, progressTextId) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const ref = storage.ref(fileName);
    const task = ref.put(file);

    const progressEl = document.getElementById(progressBarId);
    const textEl = document.getElementById(progressTextId);

    task.on('state_changed',
      (snapshot) => {
        const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (progressEl) progressEl.style.setProperty('--progress', pct + '%');
        if (textEl) textEl.textContent = `Uploading... ${pct}%`;
      },
      (error) => {
        reject(error);
      },
      () => {
        task.snapshot.ref.getDownloadURL().then((url) => {
          if (textEl) textEl.textContent = 'Upload complete!';
          resolve(url);
        });
      }
    );
  });
}

// ── DEVICE UPLOAD — PROJECT ──
function handleDeviceUpload(input) {
  const file = input.files[0];
  if (!file) return;

  // Validate file
  if (!file.type.startsWith('image/')) {
    showToast('Please select a valid image file.', 'error');
    input.value = '';
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showToast('Image must be under 10MB.', 'error');
    input.value = '';
    return;
  }

  // Show progress
  document.getElementById('apUploadProgress').style.display = 'flex';
  document.getElementById('apProgressBar').style.setProperty('--progress', '0%');

  // Show local preview immediately
  const reader = new FileReader();
  reader.onload = (e) => {
    showProjectPreview(e.target.result);
  };
  reader.readAsDataURL(file);

  // Upload to Firebase Storage with compression
  compressImage(file).then(compressedFile => {
    uploadImageToStorage(compressedFile, 'project-images', 'apProgressBar', 'apProgressText')
      .then((url) => {
        document.getElementById('apImage').value = url;
        showProjectPreview(url);
        showToast('Image uploaded successfully!');
        setTimeout(() => {
          document.getElementById('apUploadProgress').style.display = 'none';
        }, 1500);
      })
      .catch((err) => {
        showToast('Upload failed: ' + err.message, 'error');
        document.getElementById('apUploadProgress').style.display = 'none';
      });
  });

  input.value = '';
}

// ── DEVICE UPLOAD — TEAM ──
function handleTeamUpload(input) {
  const file = input.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('Please select a valid image file.', 'error');
    input.value = '';
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showToast('Image must be under 10MB.', 'error');
    input.value = '';
    return;
  }

  document.getElementById('teamUploadProgress').style.display = 'flex';
  document.getElementById('teamProgressBar').style.setProperty('--progress', '0%');

  const reader = new FileReader();
  reader.onload = (e) => {
    showTeamPreview(e.target.result);
  };
  reader.readAsDataURL(file);

  compressImage(file).then(compressedFile => {
    uploadImageToStorage(compressedFile, 'team-images', 'teamProgressBar', 'teamProgressText')
      .then((url) => {
        document.getElementById('admTeamImg').value = url;
        showTeamPreview(url);
        showToast('Image uploaded successfully!');
        setTimeout(() => {
          document.getElementById('teamUploadProgress').style.display = 'none';
        }, 1500);
      })
      .catch((err) => {
        showToast('Upload failed: ' + err.message, 'error');
        document.getElementById('teamUploadProgress').style.display = 'none';
      });
  });

  input.value = '';
}

// ── PREVIEW HELPERS ──
function showProjectPreview(url) {
  const preview = document.getElementById('apPreview');
  const img = document.getElementById('apPreviewImg');
  img.src = url;
  preview.style.display = 'flex';
}

function showTeamPreview(url) {
  const preview = document.getElementById('teamPreview');
  const img = document.getElementById('teamPreviewImg');
  img.src = url;
  preview.style.display = 'flex';
}

function removeProjectImage() {
  document.getElementById('apPreview').style.display = 'none';
  document.getElementById('apPreviewImg').src = '';
  document.getElementById('apImage').value = '';
  document.getElementById('apUploadProgress').style.display = 'none';
}

function removeTeamImage() {
  document.getElementById('teamPreview').style.display = 'none';
  document.getElementById('teamPreviewImg').src = '';
  document.getElementById('admTeamImg').value = '';
  document.getElementById('teamUploadProgress').style.display = 'none';
}

// ── URL PREVIEW ──
let previewDebounce = null;
function previewImageUrl(url) {
  clearTimeout(previewDebounce);
  if (!url || !url.trim()) {
    document.getElementById('apPreview').style.display = 'none';
    return;
  }
  previewDebounce = setTimeout(() => {
    const img = new Image();
    img.onload = () => showProjectPreview(url);
    img.onerror = () => {
      document.getElementById('apPreview').style.display = 'none';
    };
    img.src = url;
  }, 500);
}

let teamPreviewDebounce = null;
function previewTeamImageUrl(url) {
  clearTimeout(teamPreviewDebounce);
  if (!url || !url.trim()) {
    document.getElementById('teamPreview').style.display = 'none';
    return;
  }
  teamPreviewDebounce = setTimeout(() => {
    const img = new Image();
    img.onload = () => showTeamPreview(url);
    img.onerror = () => {
      document.getElementById('teamPreview').style.display = 'none';
    };
    img.src = url;
  }, 500);
}

// ── DRAG AND DROP ──
function setupDropZone(dropAreaId, handler) {
  const dropArea = document.getElementById(dropAreaId);
  if (!dropArea) return;

  ['dragenter', 'dragover'].forEach(evt => {
    dropArea.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropArea.classList.add('drag-over');
    });
  });

  ['dragleave', 'drop'].forEach(evt => {
    dropArea.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropArea.classList.remove('drag-over');
    });
  });

  dropArea.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handler(files[0]);
    }
  });
}

// Initialize drag-and-drop zones
document.addEventListener('DOMContentLoaded', () => {
  setupDropZone('apDropArea', (file) => {
    // Create a fake input-like object
    const fakeInput = { files: [file], value: '' };
    handleDeviceUpload(fakeInput);
  });

  setupDropZone('teamDropArea', (file) => {
    const fakeInput = { files: [file], value: '' };
    handleTeamUpload(fakeInput);
  });
});

// ── GOOGLE DRIVE PICKER ──
// Note: Google Drive Picker requires a Google Cloud project with the Picker API enabled
// and an OAuth2 client ID. Set these values in your firebase-config.js or here:

const GOOGLE_DEVELOPER_KEY = ''; // Your Google API Key with Picker API enabled
const GOOGLE_CLIENT_ID = '';     // Your OAuth2 Client ID

let pickerApiLoaded = false;
let oauthToken = null;
let activePickerTarget = 'project'; // 'project' or 'team'

function openGoogleDrivePicker(target) {
  activePickerTarget = target || 'project';

  if (!GOOGLE_DEVELOPER_KEY || !GOOGLE_CLIENT_ID) {
    // Fallback: If no API keys configured, show helpful message and open Drive in new tab
    showToast('Google Drive Picker requires API keys. Opening Drive in new tab instead.', 'error');
    window.open('https://drive.google.com', '_blank');
    return;
  }

  gapi.load('auth', { callback: onAuthApiLoad });
  gapi.load('picker', { callback: onPickerApiLoad });
}

function onAuthApiLoad() {
  gapi.auth.authorize({
    client_id: GOOGLE_CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    immediate: false
  }, handleAuthResult);
}

function handleAuthResult(authResult) {
  if (authResult && !authResult.error) {
    oauthToken = authResult.access_token;
    createPicker();
  }
}

function onPickerApiLoad() {
  pickerApiLoaded = true;
  createPicker();
}

function createPicker() {
  if (pickerApiLoaded && oauthToken) {
    const view = new google.picker.View(google.picker.ViewId.DOCS_IMAGES);
    const picker = new google.picker.PickerBuilder()
      .enableFeature(google.picker.Feature.NAV_HIDDEN)
      .setOAuthToken(oauthToken)
      .addView(view)
      .addView(new google.picker.DocsUploadView())
      .setDeveloperKey(GOOGLE_DEVELOPER_KEY)
      .setCallback(pickerCallback)
      .setTitle('Select an Image from Google Drive')
      .build();
    picker.setVisible(true);
  }
}

function pickerCallback(data) {
  if (data.action === google.picker.Action.PICKED) {
    const fileId = data.docs[0].id;
    const fileName = data.docs[0].name;
    const mimeType = data.docs[0].mimeType;

    // Get a publicly viewable link
    const driveUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

    if (activePickerTarget === 'team') {
      document.getElementById('admTeamImg').value = driveUrl;
      showTeamPreview(driveUrl);
    } else {
      document.getElementById('apImage').value = driveUrl;
      showProjectPreview(driveUrl);
    }
    showToast('Image selected from Google Drive!');
  }
}

// ══════════════════════════════════════════════════════
//  INTEGRATIONS (EmailJS, Google Sheets)
// ══════════════════════════════════════════════════════

// ── EmailJS Integration ──
// Initialize EmailJS (Requires your EmailJS Public Key)
const EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY'; // Replace with actual key
if (window.emailjs) {
  try {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  } catch (err) {
    console.error("EmailJS initialization failed:", err);
  }
}

function sendBookingEmail(name, email, phone, service, message) {
  if (!window.emailjs) {
    console.warn("EmailJS not loaded.");
    return;
  }

  // Replace these with your actual Service ID and Template ID from EmailJS dashboard
  const SERVICE_ID = 'YOUR_EMAILJS_SERVICE_ID';
  const TEMPLATE_ID = 'YOUR_EMAILJS_TEMPLATE_ID';

  const templateParams = {
    to_email: email,                // Destination: User's email
    to_name: name,                  // Recipient: User's name
    from_name: 'OKOK Tech',         // Sender: Company Name
    reply_to: 'hello@okoktech.in',  // Reply to: Company Email
    phone: phone,
    service: service,
    message: message || 'No extra message provided.'
  };

  emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams)
    .then(function (response) {
      console.log('Email sent successfully!', response.status, response.text);
    }, function (error) {
      console.error('Failed to send email...', error);
    });
}

// ── Google Sheets Integration (via Apps Script) ──
// Replace this with the Web App URL that you deployed via Google Apps Script
const GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbz4A-rnoRFbBwYAg_WdcEG4VHRTR8WFc5VaOXPUm6XDwkVJa34FRtVLqB8aI_n-Sgg9/exec';
const GOOGLE_SHEET_EMBED_URL = 'https://docs.google.com/spreadsheets/d/13YTIpH0g11Z250PODqAbIDBf_YkNb-IkztHCfrS076o/edit?usp=sharing'; // Add your published spreadsheet URL here for the admin panel iframe

function sendToGoogleSheet(name, email, phone, service, message) {
  if (!GOOGLE_SHEET_WEBHOOK_URL || GOOGLE_SHEET_WEBHOOK_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
    console.warn("Google Sheet Webhook URL not configured.");
    return;
  }

  // Use POST request (or GET if your Apps Script expects it, but POST is safer for long data)
  // Depending on CORS, you might need to use `mode: 'no-cors'` if your apps script doesn't handle OPTIONS properly.
  fetch(GOOGLE_SHEET_WEBHOOK_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify({
      name: name,
      email: email,
      phone: phone,
      service: service,
      message: message,
      timestamp: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    })
  })
    .then(() => {
      console.log("Recorded to Google Sheets via webhook.");
    })
    .catch(err => {
      console.error("Error sending to Google Sheets:", err);
    });
}

function syncToGoogleSheets() {
  if (!GOOGLE_SHEET_WEBHOOK_URL || GOOGLE_SHEET_WEBHOOK_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
    showToast("Google Sheet Webhook URL not configured.", "error"); return;
  }

  db.collection("bookings").orderBy("createdAt", "asc").get().then((snap) => {
    if (snap.empty) { showToast("No bookings to sync."); return; }

    showToast("Syncing data to Google Sheets... Please wait.");
    const bookings = [];
    snap.forEach((doc) => {
      const d = doc.data();
      const dateObj = d.createdAt ? new Date(d.createdAt.seconds * 1000) : null;
      const dateStr = dateObj ? dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

      bookings.push({
        name: d.name || "",
        email: d.email || "",
        phone: d.phone || "",
        service: d.service || "",
        message: d.message || "",
        timestamp: dateStr
      });
    });

    let syncCount = 0;
    const syncNext = () => {
      if (syncCount >= bookings.length) {
        showToast("Sync Complete!");
        return;
      }

      const b = bookings[syncCount];
      fetch(GOOGLE_SHEET_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(b)
      }).then(() => {
        syncCount++;
        setTimeout(syncNext, 500); // 500ms delay to prevent rate limits
      }).catch((e) => {
        console.error(e);
        syncCount++;
        syncNext();
      });
    };

    syncNext();
  });
}

function refreshGoogleSheetsEmbed() {
  const iframe = document.getElementById("sheetsEmbed");
  if (iframe && iframe.src) {
    // Reload iframe by resetting its src
    // append a timestamp query parameter to bypass browser caching
    let currentUrl = new URL(iframe.src);
    currentUrl.searchParams.set('_t', Date.now());
    iframe.src = currentUrl.toString();
  }
}

// Admin Tab helper for Google Sheets embed
document.addEventListener("DOMContentLoaded", () => {
  if (GOOGLE_SHEET_EMBED_URL && GOOGLE_SHEET_EMBED_URL.trim() !== '') {
    const placeholder = document.getElementById('sheetsPlaceholder');
    const iframe = document.getElementById('sheetsEmbed');
    if (placeholder && iframe) {
      placeholder.style.display = 'none';
      iframe.src = GOOGLE_SHEET_EMBED_URL;
      iframe.style.display = 'block';
    }
  }
});
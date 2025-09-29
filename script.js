// Supabase init
const supabaseUrl = "https://iqseolitspnpivflsxbu.supabase.co";
const supabaseKey = "sb_publishable_KPlWlksn2us07U2d_FjqjQ_HdiY39IA";
const db = supabase.createClient(supabaseUrl, supabaseKey);

let teamData = [];
let currentMemberName = null;


function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) {
    type === "error" ? alert(message) : console.log(message);
    return;
  }
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.className = "toast hidden";
  }, 3000);
}


async function loadTeamJson() {
  const candidates = ["./data/team.json", "/data/team.json"];
  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: "no-cache" });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("team.json fetch failed:", url, e);
    }
  }
  throw new Error("team.json not found");
}

loadTeamJson()
  .then((data) => {
    teamData = data || [];
    renderTeam(teamData);
    setupFilters();
  })
  .catch((err) => {
    console.error("Failed to load team.json", err);
    showToast("⚠️ Could not load team data.", "error");
    renderTeam([]);
  });


function renderTeam(list) {
  const grid = document.getElementById("team-grid");
  if (!grid) return;
  grid.innerHTML = "";

  list.forEach((member) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-head">
        <img src="${member.avatar_url}" alt="${member.name}" />
        <div>
          <div class="name">${member.name}</div>
          <div class="meta">${member.role_title} · ${member.department}</div>
        </div>
      </div>
      <div class="socials">
        ${member.links?.twitter ? `<a href="${member.links.twitter}" target="_blank" rel="noopener"><i class="fab fa-twitter"></i></a>` : ""}
        ${member.links?.github ? `<a href="${member.links.github}" target="_blank" rel="noopener"><i class="fab fa-github"></i></a>` : ""}
      </div>
      <p class="story">${member.story || ""}</p>
      <button class="msg-btn" data-member-name="${member.name}">
        <i class="fa-regular fa-comment-dots"></i> Leave a Message
      </button>
      <button class="view-btn" data-member-name="${member.name}">
        <i class="fa-solid fa-inbox"></i> View Messages
      </button>
    `;
    grid.appendChild(card);
  });
}


const gridEl = document.getElementById("team-grid");
if (gridEl) {
  gridEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".msg-btn, .view-btn");
    if (!btn) return;
    const name = btn.dataset.memberName;
    if (!name) return;

    if (btn.classList.contains("msg-btn")) {
      openMessageForm(name);
    } else {
      openViewMessages(name);
    }
  });
}


function openMessageForm(memberName) {
  currentMemberName = memberName;
  const titleEl = document.getElementById("modal-title");
  const modal = document.getElementById("message-modal");
  if (!modal || !titleEl) return;
  titleEl.innerText = `Leave a message for ${memberName}`;
  modal.classList.remove("hidden");
}

const closeModalBtn = document.getElementById("closeModal");
if (closeModalBtn) {
  closeModalBtn.addEventListener("click", () => {
    const modal = document.getElementById("message-modal");
    if (modal) modal.classList.add("hidden");
  });
}

const sendBtn = document.getElementById("sendMessage");
if (sendBtn) {
  sendBtn.addEventListener("click", async () => {
    const userInput = document.getElementById("username");
    const msgInput = document.getElementById("message");
    if (!userInput || !msgInput) return;

    const user_name = userInput.value.trim();
    const content = msgInput.value.trim();

    if (!user_name || !content) {
      showToast("⚠️ Please fill all fields.", "error");
      return;
    }

    try {
      const { error } = await db
        .from("aztec_messages")
        .insert([{ member_name: currentMemberName, user_name, content }]);

      if (error) {
        console.error("Supabase insert error:", error);
        showToast("❌ Error saving message.", "error");
      } else {
        showToast("✅ Message sent!", "success");
        const modal = document.getElementById("message-modal");
        if (modal) modal.classList.add("hidden");
        userInput.value = "";
        msgInput.value = "";
      }
    } catch (e) {
      console.error(e);
      showToast("❌ Network error. Try again.", "error");
    }
  });
}


function openViewMessages(memberName) {
  currentMemberName = memberName;

  const titleEl = document.getElementById("view-modal-title");
  const modal = document.getElementById("view-messages-modal");
  const list = document.getElementById("messages-list");
  if (!titleEl || !modal || !list) return;

  titleEl.innerText = `Messages for ${memberName}`;
  list.innerHTML = "<p>Loading...</p>";

  modal.classList.add("show");

  db.from("aztec_messages")
    .select("*")
    .eq("member_name", memberName)
    .order("created_at", { ascending: false })
    .then(({ data, error }) => {
      if (error) {
        console.error(error);
        list.innerHTML = "<p>❌ Failed to load messages.</p>";
        return;
      }

      if (!data || data.length === 0) {
        list.innerHTML = "<p>No messages yet.</p>";
        return;
      }

      list.innerHTML = "";
      data.forEach((msg) => list.appendChild(buildMessageItem(msg)));
      list.scrollTop = 0; 
    })
    .catch((e) => {
      console.error(e);
      list.innerHTML = "<p>❌ Failed to load messages.</p>";
    });
}

function buildMessageItem(msg) {
  const item = document.createElement("div");
  item.className = "message-item";

  const header = document.createElement("div");
  header.className = "message-header";

  const user = document.createElement("span");
  user.className = "message-user";
  user.textContent = msg.user_name || "Anonymous";

  const date = document.createElement("span");
  date.className = "message-date";
  const d = new Date(msg.created_at);
  date.textContent = `commented on ${d.toLocaleDateString()}`;

  header.appendChild(user);
  header.appendChild(document.createTextNode(" • "));
  header.appendChild(date);

  const content = document.createElement("div");
  content.className = "message-content";
  content.textContent = msg.content || "";

  item.appendChild(header);
  item.appendChild(content);

  return item;
}

const closeViewBtn = document.getElementById("closeViewModal");
if (closeViewBtn) {
  closeViewBtn.addEventListener("click", () => {
    const modal = document.getElementById("view-messages-modal");
    if (modal) modal.classList.remove("show");
  });
}


function setupFilters() {
  const filterButtons = document.querySelectorAll(".filters button");
  if (!filterButtons || filterButtons.length === 0) return;

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.getAttribute("data-filter");
      if (filter === "all") renderTeam(teamData);
      else renderTeam(teamData.filter((m) => m.department === filter));
    });
  });
}


function animateStats() {
  const counters = document.querySelectorAll(".count");
  counters.forEach((counter) => {
    counter.innerText = "0";
    const update = () => {
      const target = +counter.getAttribute("data-target");
      const current = +counter.innerText;
      const increment = Math.max(1, Math.floor(target / 200));
      if (current < target) {
        counter.innerText = `${Math.min(target, current + increment)}`;
        setTimeout(update, 15);
      } else {
        counter.innerText = target;
      }
    };
    update();
  });
}

const statsSection = document.getElementById("stats");
let statsStarted = false;
if (statsSection) {
  window.addEventListener("scroll", () => {
    if (!statsStarted && statsSection.getBoundingClientRect().top < window.innerHeight) {
      animateStats();
      statsStarted = true;
    }
  });
}


const musicToggle = document.getElementById("music-toggle");
const audio = document.getElementById("bg-music");
let musicStarted = false;
let musicPlaying = false;

if (audio) {
  document.body.addEventListener(
    "click",
    () => {
      if (!musicStarted) {
        audio.muted = false;
        audio
          .play()
          .then(() => {
            musicStarted = true;
            musicPlaying = true;
            if (musicToggle) musicToggle.textContent = "🎵 Music On";
          })
          .catch((err) => console.warn("Autoplay blocked:", err));
      }
    },
    { once: true }
  );
}

if (musicToggle && audio) {
  musicToggle.addEventListener("click", (e) => {
    e.stopPropagation();    if (!musicPlaying) {
      audio.muted = false;
      audio.play().then(() => {
        musicPlaying = true;
        musicStarted = true;
        musicToggle.textContent = "🎵 Music On";
      });
    } else {
      audio.pause();
      musicPlaying = false;
      musicToggle.textContent = "🎵 Music Off";
    }
  });
}
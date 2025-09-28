// Supabase init
const supabaseUrl = "https://iqseolitspnpivflsxbu.supabase.co";
const supabaseKey = "sb_publishable_KPlWlksn2us07U2d_FjqjQ_HdiY39IA";
const db = supabase.createClient(supabaseUrl, supabaseKey);

let teamData = [];
let currentMemberName = null;

/* Load JSON */
fetch("data/team.json")
  .then((r) => r.json())
  .then((data) => {
    teamData = data;
    renderTeam(teamData);
    setupFilters();
  });

/* Render team */
function renderTeam(list) {
  const grid = document.getElementById("team-grid");
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
        ${member.links.twitter ? `<a href="${member.links.twitter}" target="_blank"><i class="fab fa-twitter"></i></a>` : ""}
        ${member.links.github ? `<a href="${member.links.github}" target="_blank"><i class="fab fa-github"></i></a>` : ""}
      </div>
      <p class="story">${member.story}</p>
      <button class="msg-btn" data-member-name="${member.name}">
        <i class="fa-regular fa-comment-dots"></i> Leave a Message
      </button>
      <button class="view-btn" data-member-name="${member.name}">
        <i class="fa-solid fa-inbox"></i> View Messages
      </button>
    `;
    grid.appendChild(card);
  });

  // attach events
  document.querySelectorAll(".msg-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      openMessageForm(btn.dataset.memberName)
    );
  });

  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      openViewMessages(btn.dataset.memberName)
    );
  });
}

/* Open message modal */
function openMessageForm(memberName) {
  currentMemberName = memberName;
  document.getElementById("modal-title").innerText = `Leave a message for ${memberName}`;
  document.getElementById("message-modal").classList.remove("hidden");
}

/* Close modal */
document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("message-modal").classList.add("hidden");
});

/* Send message */
document.getElementById("sendMessage").addEventListener("click", async () => {
  const user_name = document.getElementById("username").value.trim();
  const content = document.getElementById("message").value.trim();

  if (!user_name || !content) {
    alert("Please fill all fields.");
    return;
  }

  console.log("Sending message to Supabase...");

  const { error } = await db.from("aztec_messages").insert([
    { member_name: currentMemberName, user_name, content },
  ]);

  if (error) {
    console.error("Supabase insert error:", error);
    alert("❌ Error saving message. Check console.");
  } else {
    alert("✅ Message sent!");
    document.getElementById("message-modal").classList.add("hidden");
    document.getElementById("username").value = "";
    document.getElementById("message").value = "";
  }
});

/* Open view messages */
function openViewMessages(memberName) {
  currentMemberName = memberName;
  document.getElementById("view-modal-title").innerText = `Messages for ${memberName}`;
  const list = document.getElementById("messages-list");
  list.innerHTML = "<p>Loading...</p>";

  document.getElementById("view-messages-modal").classList.remove("hidden");

  // Fetch messages by member_name
  db.from("aztec_messages")
    .select("*")
    .eq("member_name", memberName)
    .order("created_at", { ascending: false })
    .then(({ data, error }) => {
      if (error) {
        list.innerHTML = "<p>❌ Failed to load messages.</p>";
        console.error(error);
        return;
      }

      if (!data || data.length === 0) {
        list.innerHTML = "<p>No messages yet.</p>";
        return;
      }

      list.innerHTML = "";
      data.forEach(msg => {
        const item = document.createElement("div");
        item.className = "message-item";
        item.innerHTML = `
          <div class="message-header">
            <strong class="message-user">${msg.user_name}</strong> commented on ${new Date(msg.created_at).toLocaleDateString()}
          </div>
          <div class="message-content">${msg.content}</div>
        `;
        list.appendChild(item);
      });
    });
}

// Close messages modal
document.getElementById("closeViewModal").addEventListener("click", () => {
  document.getElementById("view-messages-modal").classList.add("hidden");
});

/* Filters */
function setupFilters() {
  document.querySelectorAll(".filters button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filters button").forEach((b) =>
        b.classList.remove("active")
      );
      btn.classList.add("active");
      const filter = btn.getAttribute("data-filter");
      if (filter === "all") renderTeam(teamData);
      else renderTeam(teamData.filter((m) => m.department === filter));
    });
  });
}

/* Stats animation */
function animateStats() {
  const counters = document.querySelectorAll(".count");
  counters.forEach((counter) => {
    counter.innerText = "0";
    const update = () => {
      const target = +counter.getAttribute("data-target");
      const current = +counter.innerText;
      const increment = target / 200;
      if (current < target) {
        counter.innerText = `${Math.ceil(current + increment)}`;
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
window.addEventListener("scroll", () => {
  if (!statsStarted && statsSection.getBoundingClientRect().top < window.innerHeight) {
    animateStats();
    statsStarted = true;
  }
});

// Music toggle
const musicToggle = document.getElementById('music-toggle');
const audio = document.getElementById('bg-music'); // use the <audio> element
let musicPlaying = false;

// Ensure it starts muted
audio.muted = true;
audio.pause();

musicToggle.addEventListener('click', () => {
  if (!musicPlaying) {
    audio.muted = false;   // unmute
    audio.play().catch(err => console.error("Playback failed:", err));
    musicPlaying = true;
    musicToggle.textContent = '🎵 Music On';
  } else {
    audio.pause();
    musicPlaying = false;
    musicToggle.textContent = '🎵 Music Off';
  }
});



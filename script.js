
const supabaseUrl = "https://iqseolitspnpivflsxbu.supabase.co";
const supabaseKey = "sb_publishable_KPlWlksn2us07U2d_FjqjQ_HdiY39IA";
const db = supabase.createClient(supabaseUrl, supabaseKey);

let teamData = [];
let currentMemberId = null;
let currentMemberName = null;


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
      <button class="msg-btn" data-member-id="${member.id}" data-member-name="${member.name}">
        <i class="fa-regular fa-comment-dots"></i> Leave a Message
      </button>
      <button class="view-btn" data-member-id="${member.id}" data-member-name="${member.name}">
        <i class="fa-solid fa-inbox"></i> View Messages
      </button>
    `;
    grid.appendChild(card);
  });

  // Correct event bindings
  document.querySelectorAll(".msg-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      openMessageForm(btn.dataset.memberId, btn.dataset.memberName)
    );
  });

  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      openMessages(btn.dataset.memberId, btn.dataset.memberName) // ✅ FIX
    );
  });
}


function openMessages(memberId, memberName) {
  currentMemberId = memberId;
  document.getElementById("view-modal-title").innerText = `Messages for ${memberName}`;
  const list = document.getElementById("messages-list");
  list.innerHTML = "<p>Loading...</p>";

  document.getElementById("view-messages-modal").classList.remove("hidden");

  db.from("aztec_messages")
    .select("*")
    .eq("member_id", memberId) // ✅ fetch only for the clicked member
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
      data.forEach((msg) => {
        const item = document.createElement("div");
        item.className = "message-item";
        item.innerHTML = `
          <div class="message-header">
            <strong class="message-user">${msg.user_name}</strong>
            <span class="message-time">commented on ${new Date(msg.created_at).toLocaleDateString()}</span>
          </div>
          <div class="message-content">${msg.content}</div>
        `;
        list.appendChild(item);
      });
    });
}

document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("message-modal").classList.add("hidden");
});


document.getElementById("sendMessage").addEventListener("click", async () => {
  const user_name = document.getElementById("username").value.trim();
  const content = document.getElementById("message").value.trim();

  if (!user_name || !content) {
    alert("Please fill all fields.");
    return;
  }

  console.log("Sending message to Supabase...");

  const { error } = await db.from("aztec_messages").insert([
    { member_id: currentMemberId, user_name, content },
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


function openMessages(memberId, memberName) {
  currentMemberId = memberId;
  document.getElementById("view-modal-title").innerText = `Messages for ${memberName}`;
  const list = document.getElementById("messages-list");
  list.innerHTML = "<p>Loading...</p>";

  document.getElementById("view-messages-modal").classList.remove("hidden");

  
  db.from("aztec_messages")
    .select("*")
    .eq("member_id", memberId)
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
  const date = new Date(msg.created_at).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric"
  });
  item.innerHTML = `
    <div class="message-header">
      <span class="message-user">${msg.user_name}</span> commented on ${date}
    </div>
    <div class="message-content">${msg.content}</div>
  `;
  list.appendChild(item);
});

    });
}


document.getElementById("closeViewModal").addEventListener("click", () => {
  document.getElementById("view-messages-modal").classList.add("hidden");
});


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

function openViewMessages(memberId, memberName) {
  currentMemberId = memberId;
  document.getElementById("view-modal-title").innerText = `Messages for ${memberName}`;
  const list = document.getElementById("messages-list");
  list.innerHTML = "<p>Loading...</p>";

  document.getElementById("view-messages-modal").classList.remove("hidden");
  document.body.classList.add("modal-open"); // 


}

document.getElementById("closeViewModal").addEventListener("click", () => {
  document.getElementById("view-messages-modal").classList.add("hidden");
  document.body.classList.remove("modal-open"); // 
});


const bgMusic = document.getElementById("bg-music");
const musicToggle = document.getElementById("music-toggle");


document.addEventListener("click", () => {
  if (bgMusic.muted) {
    bgMusic.muted = false;
    bgMusic.play();
    musicToggle.innerHTML = "🔊 Music On";
  }
}, { once: true });


musicToggle.addEventListener("click", () => {
  if (bgMusic.muted || bgMusic.paused) {
    bgMusic.muted = false;
    bgMusic.play();
    musicToggle.innerHTML = "🔊 Music On";
  } else {
    bgMusic.muted = true;
    musicToggle.innerHTML = "🔇 Music Off";
  }
});

let teamData = [];

/* Load JSON then render */
fetch('data/team.json')
  .then(r => r.json())
  .then(data => { teamData = data; renderTeam(teamData); setupFilters(); });

/* Render big cards */
function renderTeam(list){
  const grid = document.getElementById('team-grid');
  grid.innerHTML = '';

  list.forEach(member => {
    const card = document.createElement('div');
    card.className = 'card';
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
    `;
    grid.appendChild(card);
  });
}

/* Filters (no search) */
function setupFilters(){
  document.querySelectorAll('.filters button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filters button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      if (filter === 'all') renderTeam(teamData);
      else renderTeam(teamData.filter(m => m.department === filter));
    });
  });
}


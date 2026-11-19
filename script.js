/* =====================================
   CLIMORA - WEBSITE FUNCTIONALITY
   ===================================== */

// Browser storage keys
const CAMPAIGN_KEY = "climora_campaigns";
const JOINED_KEY = "climora_joined";
const PROFILE_KEY = "climora_profile";

// Sample campaigns
const defaultCampaigns = [
  {
    id: "C001",
    title: "Green Neighbourhood Drive",
    category: "Tree Planting",
    description: "Plant native saplings and make our neighbourhood greener.",
    date: "2026-12-05",
    location: "Belagavi, Karnataka",
    goal: 40,
    joined: 18,
    progress: 45,
    status: "Upcoming",
    icon: "🌳",
    trees: 0
  },
  {
    id: "C002",
    title: "Clean Lake, Healthy Community",
    category: "Clean-up",
    description: "Help clean the lake surroundings and protect local nature.",
    date: "2026-12-12",
    location: "Local Lake",
    goal: 30,
    joined: 12,
    progress: 40,
    status: "Upcoming",
    icon: "♻️",
    trees: 0
  },
  {
    id: "C003",
    title: "Climate Awareness Week",
    category: "Awareness",
    description: "Spread awareness about climate change and sustainable living.",
    date: "2026-12-18",
    location: "College Campus",
    goal: 50,
    joined: 21,
    progress: 35,
    status: "Upcoming",
    icon: "💡",
    trees: 0
  }
];

// Load saved campaigns
function loadData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    console.error("Storage error:", error);
    return fallback;
  }
}

function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    showToast("Could not save data in this browser.");
  }
}

let campaigns = loadData(CAMPAIGN_KEY, null);

if (!Array.isArray(campaigns)) {
  campaigns = defaultCampaigns;
  saveData(CAMPAIGN_KEY, campaigns);
}

let joinedCampaigns = loadData(JOINED_KEY, []);
let selectedCategory = "All";

// HTML safety
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

// Select elements
const campaignGrid = document.getElementById("campaignGrid");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");
const campaignModal = document.getElementById("campaignModal");
const profileModal = document.getElementById("profileModal");
const campaignForm = document.getElementById("campaignForm");
const profileForm = document.getElementById("profileForm");

// Notification
let toastTimer;

function showToast(message) {
  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Date format
function formatDate(value) {
  if (!value) return "Date not set";

  const date = new Date(value + "T00:00:00");

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

// Category image
function getImageClass(category) {
  if (category === "Tree Planting") return "tree";
  if (category === "Clean-up") return "clean";
  if (category === "Energy") return "energy";
  return "awareness";
}

// Category icon
function getIcon(category) {
  const icons = {
    "Tree Planting": "🌳",
    "Clean-up": "♻️",
    "Awareness": "💡",
    "Energy": "☀️"
  };

  return icons[category] || "🌱";
}

// Render campaign cards
function displayCampaigns() {

  const searchText = searchInput.value
    .trim()
    .toLowerCase();

  const filteredCampaigns = campaigns.filter(item => {

    const matchesCategory =
      selectedCategory === "All" ||
      item.category === selectedCategory;

    const searchContent = (
      item.title + " " +
      item.category + " " +
      item.location + " " +
      item.description
    ).toLowerCase();

    const matchesSearch =
      searchContent.includes(searchText);

    return matchesCategory && matchesSearch;
  });

  campaignGrid.innerHTML = filteredCampaigns.map(item => {

    const joined = joinedCampaigns.includes(item.id);

    const progress = Math.max(
      0,
      Math.min(100, Number(item.progress) || 0)
    );

    return `
      <article class="campaign-card">

        <div class="card-image ${getImageClass(item.category)}">

          <span class="category-label">
            ${escapeHTML(item.category)}
          </span>

        </div>

        <div class="card-body">

          <h3>${escapeHTML(item.title)}</h3>

          <p>${escapeHTML(item.description)}</p>

          <div class="card-info">
            <span>📍 ${escapeHTML(item.location)}</span>
            <span>📅 ${formatDate(item.date)}</span>
          </div>

          <div class="progress-info">
            <span>${escapeHTML(item.status || "Upcoming")}</span>
            <strong>${progress}%</strong>
          </div>

          <div class="progress-track">
            <div
              class="progress-fill"
              style="width:${progress}%">
            </div>
          </div>

          <div class="card-footer">

            <span class="volunteer-count">
              👥 ${Number(item.joined) || 0}
              / ${Number(item.goal) || 0}
            </span>

            <button
              class="join-btn"
              data-join="${escapeHTML(item.id)}"
              ${joined ? "disabled" : ""}
            >
              ${joined ? "✓ Joined" : "Join Campaign"}
            </button>

          </div>

        </div>
      </article>
    `;
  }).join("");

  campaignGrid.classList.toggle(
    "hidden",
    filteredCampaigns.length === 0
  );

  emptyState.classList.toggle(
    "hidden",
    filteredCampaigns.length !== 0
  );

  updateStatistics();
}

// Dashboard statistics
function updateStatistics() {

  const volunteers = campaigns.reduce(
    (sum, item) => sum + (Number(item.joined) || 0),
    0
  );

  const trees = campaigns.reduce(
    (sum, item) => sum + (Number(item.trees) || 0),
    0
  );

  const completed = campaigns.filter(
    item => item.status === "Completed"
  ).length;

  document.getElementById("totalCampaigns").textContent =
    campaigns.length;

  document.getElementById("totalVolunteers").textContent =
    volunteers;

  document.getElementById("totalTrees").textContent =
    trees;

  document.getElementById("completedCampaigns").textContent =
    completed;
}

// Open campaign modal
function openCampaignModal() {
  campaignModal.showModal();
}

document.getElementById("createBtn")
  .addEventListener("click", openCampaignModal);

document.getElementById("heroCreateBtn")
  .addEventListener("click", openCampaignModal);

document.getElementById("sectionCreateBtn")
  .addEventListener("click", openCampaignModal);

document.getElementById("bottomCreateBtn")
  .addEventListener("click", openCampaignModal);

// Close modals
document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => {
    button.closest("dialog").close();
  });
});

// Click outside modal to close
[campaignModal, profileModal].forEach(modal => {
  modal.addEventListener("click", event => {
    if (event.target === modal) {
      modal.close();
    }
  });
});

// Create campaign
campaignForm.addEventListener("submit", event => {

  event.preventDefault();

  const form = new FormData(campaignForm);

  const category = String(form.get("category"));

  const newCampaign = {
    id: "C" + Date.now(),

    title: String(form.get("title")).trim(),

    category: category,

    description:
      String(form.get("description")).trim(),

    date: String(form.get("date")),

    location:
      String(form.get("location")).trim(),

    goal: Number(form.get("goal")),

    joined: 0,

    progress: 0,

    status: "Upcoming",

    icon: getIcon(category),

    trees: 0
  };

  if (
    !newCampaign.title ||
    !newCampaign.description ||
    !newCampaign.location ||
    !newCampaign.date ||
    !newCampaign.goal ||
    newCampaign.goal < 1
  ) {
    showToast("Please complete all fields correctly.");
    return;
  }

  campaigns.unshift(newCampaign);

  saveData(CAMPAIGN_KEY, campaigns);

  campaignForm.reset();

  campaignModal.close();

  selectedCategory = "All";
  searchInput.value = "";

  document.querySelectorAll(".filter").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.filter === "All"
    );
  });

  displayCampaigns();

  showToast("Your campaign was created successfully!");

  document.getElementById("campaigns")
    .scrollIntoView({ behavior: "smooth" });
});

// Join campaign
campaignGrid.addEventListener("click", event => {

  const button = event.target.closest("[data-join]");

  if (!button) return;

  const campaignId = button.dataset.join;

  if (joinedCampaigns.includes(campaignId)) {
    return;
  }

  const campaign = campaigns.find(
    item => item.id === campaignId
  );

  if (!campaign) return;

  campaign.joined =
    (Number(campaign.joined) || 0) + 1;

  joinedCampaigns.push(campaignId);

  saveData(CAMPAIGN_KEY, campaigns);
  saveData(JOINED_KEY, joinedCampaigns);

  displayCampaigns();

  showToast(
    "You successfully joined " + campaign.title + "!"
  );
});

// Category filters
document.getElementById("filters")
  .addEventListener("click", event => {

    const button = event.target.closest("[data-filter]");

    if (!button) return;

    selectedCategory = button.dataset.filter;

    document.querySelectorAll(".filter").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    displayCampaigns();
  });

// Search campaigns
searchInput.addEventListener("input", displayCampaigns);

// Profile demo
document.getElementById("loginBtn")
  .addEventListener("click", () => {

    const profile = loadData(PROFILE_KEY, null);

    if (profile && profile.name) {
      showToast("Welcome back, " + profile.name + "!");
      return;
    }

    profileModal.showModal();
  });

// Save demo profile
profileForm.addEventListener("submit", event => {

  event.preventDefault();

  const form = new FormData(profileForm);

  const name = String(form.get("name")).trim();

  if (!name) return;

  saveData(PROFILE_KEY, { name: name });

  profileModal.close();

  profileForm.reset();

  showToast("Welcome to Climora, " + name + "!");
});

// Dark mode
document.getElementById("themeToggle")
  .addEventListener("click", () => {

    document.body.classList.toggle("dark");

    const dark =
      document.body.classList.contains("dark");

    saveData("climora_theme", dark);

    showToast(
      dark ? "Dark mode enabled." : "Light mode enabled."
    );
  });

// Restore theme
if (loadData("climora_theme", false)) {
  document.body.classList.add("dark");
}

// Mobile menu
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {

  const open = navLinks.classList.toggle("open");

  menuToggle.textContent = open ? "×" : "☰";

  menuToggle.setAttribute("aria-expanded", String(open));
});

navLinks.querySelectorAll("a").forEach(link => {

  link.addEventListener("click", () => {

    navLinks.classList.remove("open");

    menuToggle.textContent = "☰";

    menuToggle.setAttribute("aria-expanded", "false");
  });
});

// First website load
displayCampaigns();

console.log("CLIMORA website loaded successfully!");
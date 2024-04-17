let entriesData = [];
let selectedEntry = null;

function getVaults(callback) {
  fetch("/vaults")
    .then((response) => response.json())
    .then((data) => {
      const vaults = data.vaults;
      callback(vaults);
    });
}

function getEntries(callback) {
  fetch("/entries")
    .then((response) => response.json())
    .then((data) => {
      const entries = data.entries;
      entriesData = entries;
      callback(entries);
    });
}

function getUserDetails(callback) {
  fetch("/user")
    .then((response) => response.json())
    .then((data) => {
      const user = data.user;
      callback(user.name, user.email);
    });
}

function updateEntriesInfo(entries) {
  const entriesDiv = document.querySelector(".entries");

  entries.forEach((entry, index) => {
    const entryDiv = document.createElement("div");
    const websitePara = document.createElement("p");
    const usernamePara = document.createElement("p");

    entryDiv.classList.add("entry");
    websitePara.classList.add("entry-website");
    usernamePara.classList.add("entry-username");

    entry.website = entry.website.split(".")[0];
    entry.website =
      entry.website.charAt(0).toUpperCase() + entry.website.slice(1);

    websitePara.textContent = "" + entry.website;
    usernamePara.textContent = "" + entry.username;

    entryDiv.appendChild(websitePara);
    entryDiv.appendChild(usernamePara);
    entriesDiv.appendChild(entryDiv);

    entryDiv.dataset.web_id = index;
    entryDiv.dataset.entry_id = entry.entry_id;
  });
}

function updateVaultsInfo(vaults) {
  const vaultList = document.querySelector(".vault-list");

  vaults.forEach((vault) => {
    const vaultItem = document.createElement("li");
    const vaultLink = document.createElement("a");
    const vaultIcon = document.createElement("i");
    const vaultText = document.createElement("span");

    vaultItem.classList.add("vault-item");
    vaultIcon.classList.add("ph", "ph-vault");
    vaultText.classList.add("text");
    vaultText.textContent = "" + vault.vault_name;

    vaultLink.appendChild(vaultIcon);
    vaultLink.appendChild(vaultText);
    vaultItem.appendChild(vaultLink);
    vaultList.appendChild(vaultItem);
  });
}

function updateUserInfo(name, email) {
  document.querySelector(".name").textContent = name;
  document.querySelector(".email").textContent = email;
}

document.addEventListener("DOMContentLoaded", function () {
  getUserDetails(updateUserInfo);
  getVaults(updateVaultsInfo);
  getEntries(updateEntriesInfo);
});

document.querySelector(".entries").addEventListener("click", function (event) {
  const clickedEntry = event.target.closest(".entry");
  if (clickedEntry) {
    document.querySelectorAll(".entry").forEach((entry) => {
      entry.classList.remove("entry-selected");
    });

    clickedEntry.classList.add("entry-selected");

    console.log(entriesData[clickedEntry.dataset.web_id]);
  }
});

document.querySelector(".entries").addEventListener("click", function (event) {
  const clickedEntry = event.target.closest(".entry");
  if (clickedEntry) {
    document.querySelectorAll(".entry").forEach((entry) => {
      entry.classList.remove("entry-selected");
    });

    selectedEntry = entriesData[clickedEntry.dataset.web_id];
    clickedEntry.classList.add("entry-selected");
    const entryInfoElement = document.querySelector(".entry-info-container");
    //update entry info
    document.querySelector("#entry-website").textContent =
      entriesData[clickedEntry.dataset.web_id].website;
    document.querySelector("#entry-username").textContent =
      selectedEntry.username;
    document.querySelector("#entry-title").textContent =
      selectedEntry.website.split(".")[0].charAt(0).toUpperCase() +
      selectedEntry.website.split(".")[0].slice(1);
    entryInfoElement.classList.remove("hidden");
    //console.log(entriesData[clickedEntry.dataset.web_id]);
  }
});

const modal = document.querySelector("#modal");
const openModal = document.querySelector("#new-item-btn");
const closeModal = document.querySelector(".Modal_close");

openModal.addEventListener("click", () => {
  modal.showModal();
});
// lukker modal på samme måde som for at vise modal
closeModal.addEventListener("click", () => {
  modal.close();
});

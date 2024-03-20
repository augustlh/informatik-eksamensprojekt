pro = document.getElementById("Profil");
all = document.getElementById("alle");
fav = document.getElementById("Favoriter");
ny = document.getElementById("Ny");

// variabler for modal
const modal = document.querySelector("#modal");
const openModal = document.querySelector(".Modal_Open");
const closeModal = document.querySelector(".Modal_close");
// sættter lytter der lytter efter klik for at vise modal og genstarter stjerner
openModal.addEventListener("click", () => {
  modal.showModal();
});
// lukker modal på samme måde som for at vise modal
closeModal.addEventListener("click", () => {
  modal.close();
});

function toProfile() {
  pro.style.display = "block";
  all.style.display = "none";
  fav.style.display = "none";
  ny.style.display = "none";
}

function toAll() {
  pro.style.display = "none";
  all.style.display = "block";
  fav.style.display = "none";
  ny.style.display = "none";
}

function toFav() {
  pro.style.display = "none";
  all.style.display = "none";
  fav.style.display = "block";
  ny.style.display = "none";
}

function toNew() {
  pro.style.display = "none";
  all.style.display = "none";
  fav.style.display = "none";
  ny.style.display = "block";
}

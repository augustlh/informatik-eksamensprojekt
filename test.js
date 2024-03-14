pro = document.getElementById("Profil");
all = document.getElementById("alle");
fav = document.getElementById("Favoriter");
ny = document.getElementById("Ny");

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

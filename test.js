const pro = document.getElementById("Profil");

// variabler for modal
const modal = document.querySelector("#modal");
const openModal = document.querySelector(".Modal_Open");
const closeModal = document.querySelector("#Modal_close");
// sættter lytter der lytter efter klik for at vise modal

export { modal };

openModal.addEventListener("click", () => {
  pro.style.display = "none";
  modal.showModal();
});
// lukker modal på samme måde som for at vise modal
closeModal.addEventListener("click", () => {
  modal.close();
});

window.toProfile = function () {
  const pro = document.getElementById("Profil");
  pro.style.display = "block";
};

pro = document.getElementById("Profil");

// variabler for modal
const modal = document.querySelector("#modal");
const openModal = document.querySelector(".Modal_Open");
const closeModal = document.querySelector(".Modal_close");
// sættter lytter der lytter efter klik for at vise modal og genstarter stjerner
openModal.addEventListener("click", () => {
  pro.style.display = "none";
  modal.showModal();
});
// lukker modal på samme måde som for at vise modal
closeModal.addEventListener("click", () => {
  modal.close();
});

function toProfile() {
  pro.style.display = "block";
}

async function loadUserData() {
  try {
    const response = await fetch("user_test.json");
    if (!response.ok) {
      throw new Error("Fandt ikke respons");
    }
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("problem med fetch");
  }
}

function call() {
  loadUserData().then((data) => {
    console.log(data);
  });
  location.replace("hovedside.html");
}

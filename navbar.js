import { fetchData } from "./start.js";
import { modal } from "./test.js";

window.showInfo = function (infoObject) {
  // Assuming you have a <div> with id="sjov" to display the information
  let infoHtml = "";
  for (const key in infoObject) {
    if (infoObject.hasOwnProperty(key)) {
      infoHtml += `<p id="tekst">${key}: ${infoObject[key]}</p>`;
      //infoHtml += `<br>`;
    }
  }
  document.getElementById("sjov").innerHTML = infoHtml;
};

function generateNavbar(data) {
  data.forEach((item) => {
    const button = document.createElement("button");
    button.textContent = item.username;
    button.setAttribute("id", "sites");
    button.onclick = function () {
      showInfo({
        username: item.username,
        website: item.website,
        password: item.password,
      });
    };
    document.getElementById("navbar").appendChild(button);
    document.getElementById("navbar").appendChild(document.createElement("br"));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fetchData().then((data) => {
    // Generate and update the navbar here
    generateNavbar(data);
    console.log(data);
    modal.close();
  });
});

document.getElementById("myForm").addEventListener("submit", function (event) {
  event.preventDefault();
  const formData = new FormData(event.target);

  const data = Object.fromEntries(formData.entries());

  console.log(data);
});

/*
document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer
    .invoke("get-user", "august@gov.kr")
    .then((data) => {
      // Generate and update the navbar here
      generateNavbar(data);
      console.log(data);
    })
    .catch((error) => {
      console.error("Failed to get user:", error);
    });
});

window.Electron.getUser("august@gov.kr")
  .then((user) => {
    console.log(user);
  })
  .catch((error) => {
    console.error("Failed to get user:", error);
  });
  */

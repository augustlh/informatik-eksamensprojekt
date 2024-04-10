import { fetchData } from "./start.js";

function generateNavbar(data) {
  console.log(data);
  let navbarHtml = "<ul>";
  data.forEach((item) => {
    navbarHtml += `<li><a href="${item.website}">${
      (item.username, item.website)
    }</a></li>`;
  });
  navbarHtml += "</ul>";
  return navbarHtml;
}

fetchData().then((data) => {
  // Generate and update the navbar here
  const navbarHtml = generateNavbar(data);
  document.getElementById("navbar").innerHTML = navbarHtml;
  console.log(data);
});

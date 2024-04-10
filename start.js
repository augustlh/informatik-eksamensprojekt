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

export const fetchData = () => loadUserData();

document.addEventListener("DOMContentLoaded", (event) => {
  const loginForm = document.getElementById("loginForm");
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    location.replace("hovedside.html");
  });
});

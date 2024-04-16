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

import { loginUser } from "./database.js";

// In your renderer process
const hash = window.electronCrypto.createHash("sha256");
hash.update("some data");
console.log(hash.digest("hex"));

document
  .getElementById("loginForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
      const user = await loginUser(email, password);
      if (user) {
        // Login successful, redirect to the main page or perform other actions
        console.log("Login successful for user:", user.email);
        // For example, redirect to the main page
        // window.location.href = 'hovedside.html';
      } else {
        // Login failed, display an error message
        console.error("Login failed. Please check your email and password.");
      }
    } catch (error) {
      console.error("An error occurred during login:", error);
    }
  });

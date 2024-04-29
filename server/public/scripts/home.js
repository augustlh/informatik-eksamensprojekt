let entriesData = [];
let selectedEntry = null;

// Get the vaults
function getVaults(callback){
    // Fetch the vaults from the server
    fetch('/vaults').then(response => response.json()).then(data => {
        const vaults = data.vaults;
        callback(vaults);
    });
}

// Validate the password
async function validatePassword(password) {
    let result = false;
    // Send the password to the server for validation
    await fetch('/validate-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
    }).then(response => response.json()).then(data => {
        result = data.success;
    });
    return result;
}

// Decrypt an entry
async function decryptEntry(entry){
    let masterpassword = "";
    // Get the masterpassword
    await fetch('/get-masterpassword', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json()).then(data => {
        masterpassword = data.masterpassword;
    });

    // Validate the masterpassword
    const ev = await validatePassword(masterpassword);

    // Decrypt the entry
    if(ev){
        fetch('/decrypt-entry', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ entry, masterpassword })
        }).then(response => response.json()).then(data => {
            if(data.success){
                    document.querySelector('#entry-password').textContent =  data.password;
            } else {
                console.log("Failed to decrypt entry");
            }
        });
    }else{
        alert("Wrong password");
    
    }
}

// Delete an entry
function deleteEntry(entry){
    //Ask for confirmation
    if(!confirm("Are you sure you want to delete this entry?")) return;

    // Send data to the server
    fetch('/delete-entry', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ entry })
    }).then(response => response.json()).then(data => {
        if(data.success){
            console.log("Entry deleted");
            alert("Entry deleted with username: " + entry.username + " and website: " + entry.website);
            window.location.reload();
        } else {
            console.log("Failed to delete entry");
        }
    });
}

// Edit an entry, not implemented
function editEntry(entry){
}

// Get the entries
function getEntries(callback){
    fetch('/entries')
        .then(response => response.json())
        .then(data => {
            const entries = data.entries;
            entriesData = entries;
            callback(entries);
        });
}

// Get the user details
function getUserDetails(callback){
    fetch('/user')
        .then(response => response.json())
        .then(data => {
            const user = data.user;
            callback(user.name, user.email);
        });
}

// Update the entries info
function updateEntriesInfo(entries){
    const entriesDiv = document.querySelector('.entries');

    entries.forEach((entry, index) => {
        const entryDiv = document.createElement('div');
        const websitePara = document.createElement('p');
        const usernamePara = document.createElement('p');

        entryDiv.classList.add('entry');
        websitePara.classList.add('entry-website');
        usernamePara.classList.add('entry-username');

        let website = entry.website.split('.')[0];
        website = website.charAt(0).toUpperCase() + website.slice(1);

        websitePara.textContent = "" + website;
        usernamePara.textContent = "" + entry.username;

        entryDiv.appendChild(websitePara);
        entryDiv.appendChild(usernamePara);
        entriesDiv.appendChild(entryDiv);

        entryDiv.dataset.web_id = index
        entryDiv.dataset.entry_id = entry.entry_id;
    });
}

// Update the vaults info
function updateVaultsInfo(vaults){
    const vaultList = document.querySelector('.vault-list');

    vaults.forEach(vault => {
        // Create the vault item
        const vaultItem = document.createElement('li');
        const vaultLink = document.createElement('a');
        const vaultIcon = document.createElement('i');
        const vaultText = document.createElement('span');

        // Add classes and text content
        vaultItem.classList.add('vault-item');
        vaultIcon.classList.add('ph', 'ph-vault');
        vaultText.classList.add('text');
        vaultText.textContent = "" + vault.vault_name;
        
        // Append the elements
        vaultLink.appendChild(vaultIcon);
        vaultLink.appendChild(vaultText);
        vaultItem.appendChild(vaultLink);
        vaultList.appendChild(vaultItem);
    });
}

// Update the user info
function updateUserInfo(name, email) {
    document.querySelector('.name').textContent = name;
    document.querySelector('.email').textContent = email;
}

// Event listener for the vaults
document.addEventListener('DOMContentLoaded', function(){
    // Get the user details, vaults and entries when the page loads
    getUserDetails(updateUserInfo);
    getVaults(updateVaultsInfo);
    getEntries(updateEntriesInfo);

    var entryInfoElement = document.querySelector('.entry-info-container');
    if (!selectedEntry) {
        entryInfoElement.classList.add('hidden');
    }
    
});

// Event listener for the entries
document.querySelector('.entries').addEventListener('click', function(event) {
    const clickedEntry = event.target.closest('.entry');
    if (clickedEntry) {
        // Remove the selected class from all entries
        document.querySelectorAll('.entry').forEach(entry => {
            entry.classList.remove('entry-selected');
        });


        // Remove the selected class from all entries
        selectedEntry = entriesData[clickedEntry.dataset.web_id];
        clickedEntry.classList.add('entry-selected');
        const entryInfoElement = document.querySelector('.entry-info-container');
        //update entry info
        document.querySelector('#entry-website').textContent =  entriesData[clickedEntry.dataset.web_id].website;
        document.querySelector('#entry-username').textContent = selectedEntry.username;
        document.querySelector('#entry-title').textContent = selectedEntry.website.split('.')[0].charAt(0).toUpperCase() + selectedEntry.website.split('.')[0].slice(1);
        document.querySelector('#entry-password').textContent = "••••••••••";
        entryInfoElement.classList.remove('hidden');
    }
});

document.querySelector('#decrypt-entry-btn').addEventListener('click', function(){
    //const masterpassword = document.querySelector('#masterpassword').value;
    decryptEntry(selectedEntry);
});

document.querySelector('#delete-entry-btn').addEventListener('click', function(){
    deleteEntry(selectedEntry);
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

function checkPasswordAndUser(email, password){
    // Checks if the password is atleast 15 characters long
    if(password.length < 15){
        return false;
    }

    //Check if password contains the username
    if(password.includes(email)){
        return false;
    }

    //checks if password contains atleast 1 uppercase letter
    let hasUpperCase = /[A-Z]/.test(password);
    if(!hasUpperCase){
        return false;
    }

    //checks if password contains atleast 1 lowercase letter
    let hasLowerCase = /[a-z]/.test(password);
    if(!hasLowerCase){
        return false;
    }

    //checks if password contains atleast 1 number
    let hasNumber = /\d/.test(password);
    if(!hasNumber){
        return false;
    }

    return true
    
}

// Generates a random password
function generatePassword(length) {
    const charset = "abcdefghijklmnopqrstuvwxyzæøåABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ÆØÅ*!@#$%^&()_-+=<>?/{}[]|~";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
}


// Event listener for the form
document.querySelector('#myForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting normally
    // Extract form data
    const website = document.querySelector('#wname').value;
    const username = document.querySelector('#usname').value;
    const url = document.querySelector('#uname').value;
    let password = document.querySelector('#pword').value;

    //check if website, username and url is empty
    if(website === "" || username === "" || url === ""){
        alert("Please fill out required fields");
        return;
    }

    let choice = false;

    //check if user has set their own password and check if its strong
    if(document.getElementById("self-make").checked){
        if (password === "") {
            alert("Password cannot be empty");
            return;
        }

        if(password.length > 30){
            alert("Password cannot be longer than 30 characters");
            return;
        }

        if(!checkPasswordAndUser(username, password)){
            //if password is not strong enough, we ask the user if they want to generate a password or keep the current one. Aftrwards we check if the password is empty
            choice = confirm("Entered password is weak. Press Okay to keep your password or Cancel to get a safe auto-generated password");
            if(!choice){
                password = generatePassword(30);
            }
        }
    }

    //if password is an empty string, we make a new password
    if(password === ""){
        password = generatePassword(30);
    }

    // Send data to the server
    fetch('/create-entry', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ website, username, url, password })
    }).then(response => response.json()).then(data => {
        if (data.success) {
            modal.close(); // Close the modal
            window.location.reload(); // Reload the page to see the new entry
        } else {
            alert("Failed to create entry");
        }
    }).catch(error => {
        console.error('Error:', error);
    });
   
});

// Event listener for the form
document.getElementById("self-make").addEventListener('change',function(){
    var passwordField = document.getElementById('passwordField');
    if (this.checked){
        passwordField.style.display = 'block';
    } else {
        passwordField.style.display = 'none'
    }
})

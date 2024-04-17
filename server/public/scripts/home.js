let entriesData = [];
let selectedEntry = null;

function getVaults(callback){
    fetch('/vaults').then(response => response.json()).then(data => {
        const vaults = data.vaults;
        callback(vaults);
    });
}

async function validatePassword(password) {
    let result = false;
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

async function decryptEntry(entry, masterpassword){
    const ev = await validatePassword(masterpassword);

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

function deleteEntry(entry){
    //Ask for confirmation
    if(!confirm("Are you sure you want to delete this entry?")) return;

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

function editEntry(entry){
}

function getEntries(callback){
    fetch('/entries')
        .then(response => response.json())
        .then(data => {
            const entries = data.entries;
            entriesData = entries;
            callback(entries);
        });
}

function getUserDetails(callback){
    fetch('/user')
        .then(response => response.json())
        .then(data => {
            const user = data.user;
            callback(user.name, user.email);
        });
}

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

function updateVaultsInfo(vaults){
    const vaultList = document.querySelector('.vault-list');

    vaults.forEach(vault => {
        const vaultItem = document.createElement('li');
        const vaultLink = document.createElement('a');
        const vaultIcon = document.createElement('i');
        const vaultText = document.createElement('span');

        vaultItem.classList.add('vault-item');
        vaultIcon.classList.add('ph', 'ph-vault');
        vaultText.classList.add('text');
        vaultText.textContent = "" + vault.vault_name;

        vaultLink.appendChild(vaultIcon);
        vaultLink.appendChild(vaultText);
        vaultItem.appendChild(vaultLink);
        vaultList.appendChild(vaultItem);
    });
}

function updateUserInfo(name, email) {
    document.querySelector('.name').textContent = name;
    document.querySelector('.email').textContent = email;
}

document.addEventListener('DOMContentLoaded', function(){
    getUserDetails(updateUserInfo);
    getVaults(updateVaultsInfo);
    getEntries(updateEntriesInfo);

    var entryInfoElement = document.querySelector('.entry-info-container');
    if (!selectedEntry) {
        entryInfoElement.classList.add('hidden');
    }
    
});

document.querySelector('.entries').addEventListener('click', function(event) {
    const clickedEntry = event.target.closest('.entry');
    if (clickedEntry) {
        document.querySelectorAll('.entry').forEach(entry => {
            entry.classList.remove('entry-selected');
        });
        
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
    const masterpassword = document.querySelector('#masterpassword').value;
    decryptEntry(selectedEntry, masterpassword);
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

document.querySelector('#myForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting normally
    // Extract form data
    const website = document.querySelector('#wname').value;
    const username = document.querySelector('#usname').value;
    const url = document.querySelector('#uname').value;
    const password = document.querySelector('#pword').value;
    console.log(typeof password)
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
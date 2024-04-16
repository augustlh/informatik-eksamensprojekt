function getVaults(){
    fetch('/vaults').then(response => response.json()).then(data => {
        const vaults = data.vaults;
    });
}

function getEntries(){
    fetch('/entries').then(response => response.json()).then(data => {
        const entries = data.entries;
    });
}
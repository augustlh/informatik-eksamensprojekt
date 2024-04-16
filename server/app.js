import express from 'express';
import cookieParser from 'cookie-parser';

import { getUserVaults, loginUser, getVaultEntries, createUser } from './database.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

function checkCookie(req, res, next) {
    const userID = req.cookies && req.cookies.user_id;
    if (userID) {
        next();
    } else {
        res.redirect('/');
    }
}

app.get('/', (req, res, next) => {
    const userID = req.cookies && req.cookies.user_id;
    if (userID) {
        res.redirect('/home');
    } else {
        res.sendFile(join(__dirname, 'public', 'index.html'));
    }
});

app.get('/home', checkCookie, async (req, res) => {
    // let vaults = await getUserVaults(req.cookies.user_id);
    // let entries = await getVaultEntries(vaults[0]);
    // res.json({entries})
    res.sendFile(join(__dirname, 'public', 'home.html'));

    // console.log(req.cookies.user_id)
    // console.log(vaults)
});

// Define route to get entries
app.get('/entries', checkCookie, async (req, res) => {
    const userID = req.cookies.user_id;
    try {
        const vaults = await getUserVaults(userID);
        const entries = await getVaultEntries(vaults[0]); // Assuming you're getting entries from the first vault for now
        res.json({ entries });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve entries' });
    }
});

app.get('/signup', (req, res) => {
    if (req.cookies.user_id) {
        res.redirect('/home');
    } else{
        res.sendFile(join(__dirname, 'public', 'signup.html'));
    }
});

app.post("/create-vault", checkCookie, async (req, res) => {
    console.log(req.body);
});

app.post("/create-entry", checkCookie, async (req, res) => {
    console.log(req.body);
});

app.post("/delete-entry", checkCookie, async (req, res) => {
    console.log(req.body);
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await loginUser(email, password);

    if (user) {
        res.cookie('user_id', user.id, { httpOnly: true, expires: 0 });
        res.redirect('/home');
    } else {
        res.status(401).send('Invalid email or password');
    }
});

app.post("/signup", async (req, res) => {
    const {email, password } = req.body;
    const user = await createUser("Test", email, password);

    if (user) {
        res.cookie('user_id', user.id, { httpOnly: true, expires: 0 });
        res.redirect('/home');
    } else {
        res.status(400).send('User already exists');
    }
});

app.post("/logout", (req, res) => {
    res.clearCookie('user_id');    
    res.redirect('/');
});

app.use((req, res, next) => {
    res.status(404)
    res.send('<h1> 404: File Not Found </h1>')
});

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500)
    res.send('<h1> 500: Internal Server Error </h1>')
});

app.listen(3000, () => {
    console.log("App listening on port 3000")
})

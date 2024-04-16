import express from 'express';
import cookieParser from 'cookie-parser';
import { getUserVaults, loginUser, getVaultEntries} from './database.js';

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
    res.sendFile(join(__dirname, 'public', 'home.html'));
    let vaults = await getUserVaults(req.cookies.user_id);
    let entries = await getVaultEntries(vaults[0]);
    console.log(vaults);
    console.log(entries);
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
    console.log(req.body); 
    const { email, password } = req.body;
    const user = await loginUser(email, password);

    if (user) {
        res.cookie('user_id', user.id, { httpOnly: true, expires: 0 });
        res.redirect('/home');
    } else {
        res.send('Invalid email or password');
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
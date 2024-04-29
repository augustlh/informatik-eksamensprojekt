//Imports module dependencies
import express from 'express';
import cookieParser from 'cookie-parser';

import { getUserVaults, loginUser, getVaultEntries, createUser, getUserById, isPasswordCorrect, decryptEntry, deleteEntry, createEntry} from './src/database.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

//Defines constants to get filename and directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//Creates the Express application
const app = express();

//Configures the Express application
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware function to disable caching by setting 'Cache-Control' header to 'no-store'.
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
})

// Middleware function to serve static css files from the public directory
app.use('/stylesheets', (req, res, next) => {
    const cssPath = join(__dirname, 'public', 'stylesheets', req.path);
    fs.readFile(cssPath, 'utf8', (err, data) => {
        if (err) {
            next(err);
            return;
        }
        res.type('text/css').send(data);
    });
});

// Middleware function to serve static files js from the public directory
app.use('/scripts', (req, res, next) => {
    const jsPath = join(__dirname, 'public', 'scripts', req.path);
    fs.readFile(jsPath, 'utf8', (err, data) => {
        if (err) {
            next(err);
            return;
        }
        res.type('application/javascript').send(data);
    });
});

app.use('/images', (req, res, next) => {
    const imagePath = join(__dirname, 'public', 'images', req.path);
    fs.readFile(imagePath, (err, data) => {
        if (err) {
            next(err);
            return;
        }
        res.type('image').send(data);
    });
});

/**
 * Middleware function to check if the user has a cookie with a user_id.
 * If the user has a cookie, the request is passed to the next middleware function in the stack.
 * If the user does not have a cookie, the user is redirected to the root page. 
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {function} next - The next middleware function in the stack.
 */
function checkCookie(req, res, next) {
    // Checks if the user has a cookie with a user_id
    const userID = req.cookies && req.cookies.user_id;
    // If the user has a cookie, the request is passed to the next middleware function in the stack
    if (userID) {
        next();
    } else {
        // If the user does not have a cookie, the user is redirected to the root page
        res.redirect('/');
    }
}

// Route handler for the root page
app.get('/', (req, res, next) => {
    // Checks if the user has a cookie with a user_id
    const userID = req.cookies && req.cookies.user_id;
    // If the user has a cookie, the user is redirected to the home page
    if (userID) {
        res.redirect('/home');
    } else {
        // If the user does not have a cookie, the user is served the index.html file
        res.sendFile(join(__dirname, 'public', 'views', 'index.html'));
    }
});

// Route handler for the home page
app.get('/home', checkCookie, async (req, res) => {
    // Serves the home.html file
    res.sendFile(join(__dirname, 'public', 'views', 'home.html'));
});


// Route handler to get entries
app.get('/entries', checkCookie, async (req, res) => {
    // Gets the user_id from the cookie
    const userID = req.cookies.user_id;
    try {
        //
        const vaults = await getUserVaults(userID);
        // Gets the entries from the first vault. In the future, the user will be able to have multiple vaults.
        const entries = await getVaultEntries(vaults[0]);
        // Sends the entries as a JSON response
        res.json({ entries });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve entries' });
    }
});

app.get('/get-masterpassword', (req, res) => {
    res.json({ masterpassword: req.cookies.masterpassword });
});

// Route handler to get vaults
app.get('/vaults', checkCookie, async (req, res) => {
    // Gets the user_id from the cookie
    const userID = req.cookies.user_id;
    try {
        // Gets the vaults for the user and sends them as a JSON response
        const vaults = await getUserVaults(userID);
        res.json({ vaults });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve vaults' });
    }
});

app.get('/user', checkCookie, async (req, res) => {
    // Gets the user_id from the cookie
    const userID = req.cookies.user_id;
    try {
        // Gets the user details and sends them as a JSON response
        const user = await getUserById(userID);
        res.json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve user details' });
    }
});

// Route handler to get signup page
app.get('/signup', (req, res) => {
    // Checks if the user has a cookie with a user_id and redirects to the home page if the user has a cookie
    if (req.cookies.user_id) {
        //creates a cookie with the masterpassword
        res.cookie('masterpassword', password, { httpOnly: true, expires: 0 })
        res.redirect('/home');
    } else{
        // Serves the signup.html file
        res.sendFile(join(__dirname, 'public', 'views', 'signup.html'));
    }
});


// Route handler to create a vault
app.post("/create-vault", checkCookie, async (req, res) => {
    console.log(req.body);
});

// Route handler to create an entry
app.post("/create-entry", checkCookie, async (req, res) => {
    const { website, username, url, password } = req.body;
    const userID = req.cookies.user_id;
    const user = await getUserById(userID);
    const vaults = await getUserVaults(userID);
    const vault = vaults[0]; // Assuming the first vault for now

    const result = await createEntry(vault, url, username, password, req.cookies.masterpassword);

    if (result) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// Route handler to delete an entry
app.post("/delete-entry", checkCookie, async (req, res) => {
    await deleteEntry(req.body.entry);
    res.json({ success: true });
});


// Route handler to decrypt an entry
app.post("/decrypt-entry", checkCookie, async (req, res) => {
    const entry = req.body.entry;
    const masterpassword = req.body.masterpassword;

    const decrypted = await decryptEntry(entry, masterpassword);

    if (decrypted) {
        res.json({ success: true, password: decrypted });
    } else {
        res.json({ success: false });
    }
});


// Route handler to validate password
app.post("/validate-password", checkCookie, async (req, res) => {
    const userID = req.cookies.user_id;
    const user = await getUserById(userID);
    const password = req.body.password;

    const result = await isPasswordCorrect(user.email, password);

    if (result) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// Route handler to login
app.post("/login", async (req, res) => {
    // Gets the email and password from the request body
    const { email, password } = req.body;

    // Calls the loginUser function with the email and password
    const user = await loginUser(email, password);

    if (user) {
        // If the user is successfully logged in, a cookie with the user_id is set and the user is redirected to the home page
        res.cookie('user_id', user.id, { httpOnly: true, expires: 0 });
        res.cookie('masterpassword', password, { httpOnly: true, expires: 0 })
        res.redirect('/home');
    } else {
        // res.status(401).send('Invalid email or password');
        //it should just say there was an error
        //make a html alert but stay on the same page
        res.status(400).send('Invalid email or password');
    }
});

// Function to check if the password is valid
function checkPasswordAndUser(email, password){
    // Checks if the password is atleast 15 characters long
    if(password.length < 15){
        return false;
    }

    //Makes sure the password doesnt contain user sensitive information
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

// Route handler to signup
app.post("/signup", async (req, res) => {
    // Gets the email and password from the request body
    const {email, password } = req.body;

    //checks if the password is valid
    if(!checkPasswordAndUser(email, password)){
        res.status(400).send('Password is not strong enough. Ensure it is atleast 15 characters long and contains atleast 1 uppercase letter, 1 lowercase letter and 1 number. It should also not contain any information about you.');
        return;
    }

    if (password.length > 30) {
        res.status(400).send('Password is too long. Maximum length is 30 characters.');
        return;
    }

    // Calls the createUser function with the email and password
    const user = await createUser("Test", email, password);

    if (user) {
        // If the user is successfully created, a cookie with the user_id is set and the user is redirected to the home page
        //res.cookie('user_id', user.id, { httpOnly: true, expires: 0 });
        res.redirect('/');
    } else {
        res.status(400).send('User already exists');
    }
});

// Route handler to logout
app.post("/logout", (req, res) => {
    //Deletes the cookie with the user_id and redirects to the root page
    res.clearCookie('user_id');
    res.clearCookie('masterpassword)')
    res.redirect('/');
});

// Route handler to handle 404 errors
app.use((req, res, next) => {
    res.status(404)
    res.send('<h1> 404: File Not Found </h1>')
});

// Route handler to handle 500 errors
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500)
    res.send('<h1> 500: Internal Server Error </h1>')
});

// Starts the Express server
app.listen(3000, () => {
    console.log("App listening on port 3000")
})


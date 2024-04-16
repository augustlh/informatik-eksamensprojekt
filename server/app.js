//Imports module dependencies
import express from 'express';
import cookieParser from 'cookie-parser';

import { getUserVaults, loginUser, getVaultEntries, createUser } from './database.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

//Defines constants to get filename and directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//Creates the Express application
const app = express();

//Configures the Express application
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware function to disable caching by setting 'Cache-Control' header to 'no-store'.
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
})

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
        res.sendFile(join(__dirname, 'public', 'index.html'));
    }
});

// Route handler for the home page
app.get('/home', checkCookie, async (req, res) => {
    // Serves the home.html file
    res.sendFile(join(__dirname, 'public', 'home.html'));
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

// Route handler to get signup page
app.get('/signup', (req, res) => {
    // Checks if the user has a cookie with a user_id and redirects to the home page if the user has a cookie
    if (req.cookies.user_id) {
        res.redirect('/home');
    } else{
        // Serves the signup.html file
        res.sendFile(join(__dirname, 'public', 'signup.html'));
    }
});


// Route handler to create a vault
app.post("/create-vault", checkCookie, async (req, res) => {
    console.log(req.body);
});

// Route handler to create an entry
app.post("/create-entry", checkCookie, async (req, res) => {
    console.log(req.body);
});

// Route handler to delete an entry
app.post("/delete-entry", checkCookie, async (req, res) => {
    console.log(req.body);
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
        res.redirect('/home');
    } else {
        res.status(401).send('Invalid email or password');
    }
});

// Route handler to signup
app.post("/signup", async (req, res) => {
    // Gets the email and password from the request body
    const {email, password } = req.body;

    // Calls the createUser function with the email and password
    const user = await createUser("Test", email, password);

    if (user) {
        // If the user is successfully created, a cookie with the user_id is set and the user is redirected to the home page
        res.cookie('user_id', user.id, { httpOnly: true, expires: 0 });
        res.redirect('/home');
    } else {
        res.status(400).send('User already exists');
    }
});

// Route handler to logout
app.post("/logout", (req, res) => {
    //Deletes the cookie with the user_id and redirects to the root page
    res.clearCookie('user_id');    
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

// imports
import express from "express";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcrypt"; 
import jwt from "jsonwebtoken";
import { User } from "./models/user.js";

const app = express();

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/authapp', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// Express settings
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
    res.render("index"); 
});

app.get("/signup", (req, res) => {
    const errorMessage = req.query.error || null;
    res.render("signup", { error: errorMessage });
});

app.post('/create', async (req, res) => {
    const { username, email, age, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.redirect(`/signup?error=User already exists with this email.`);
        }

        bcrypt.genSalt(10, (err, salt) => {
            if (err) return res.status(500).send("Error occurred while generating salt.");

            bcrypt.hash(password, salt, async (err, hash) => {
                if (err) return res.status(500).send("Error occurred while hashing the password.");

                const newUser = new User({ username, email, age, password: hash });
                await newUser.save();

                let token = jwt.sign({ email }, "abhi");
                res.cookie("token", token);
                res.redirect("/login"); 
            });
        });
    } catch (error) {
        console.error("Error creating user:", error);
        return res.redirect(`/signup?error=Failed to create user. Please try again.`);
    }
});

app.get("/login", (req, res) => {
    res.render("login"); 
});

app.post("/login", async function(req, res) {
    try {
        let user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(400).send("User not found or something went wrong");
        }

        bcrypt.compare(req.body.password, user.password, function(err, result) {
            if (err) {
                console.error("Error comparing passwords:", err);
                return res.status(500).send("Error occurred during authentication");
            }

            if (result) {
                return res.redirect("/");
            } else {

                return res.status(400).send("Incorrect password");
            }
        });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).send("Server error");
    }
});

app.get("/logout", (req, res) => {
    res.render('logout');
});
app.post("/logout", (req, res) => {
    // Clear the cookie by setting it with an empty value and a past expiration date
    res.cookie("token", "", { expires: new Date(0), httpOnly: true });
    
    // Redirect to the home page or login page
    res.redirect("/");
});


// Start the server
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

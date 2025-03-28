
const express = require("express");
const axios = require("axios");
require("dotenv").config();
const db = require("./config/db");
const session = require("express-session");
const bodyParser = require("body-parser");
//const { loginUser, getUserProfile, signupUser } = require("./scripts/authController"); // Destructure the functions from auth.js
const app = express();
const PORT = 3022;

//ejs View Engine
app.set("view engine", "ejs");

//Serve Static Files (CSS, Images, JS)
app.use(express.static("public"));

//Middleware for Form Data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

//Session Middleware for User Authentication
app.use(session({
    secret: "secret_key",
    resave: false,
    saveUninitialized: true
}));

//Middleware to Pass User Info to Views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

const base_url = "https://api.themoviedb.org/3";

//Home Route - Fetch Movie Genres & Popular Movies
app.get("/", async (req, res) => {
    try {
        const [genresResponse, moviesResponse] = await Promise.all([
            axios.get(`${base_url}/genre/movie/list`, { 
                params: { api_key: process.env.API_KEY } }),
            axios.get(`${base_url}/movie/popular`, { 
                params: { api_key: process.env.API_KEY } })
        ]);

        const movie_genres = genresResponse.data.genres;
        const popular_movies = moviesResponse.data.results;

        res.render("home", { movie_genres, popular_movies });
    } catch (error) {
        console.error("ERROR fetching movie data:", error.message);
        res.status(500).send("Error fetching movie data");
    }
});

//fetch movies using genre id
app.get("/genre/:id", async (req, res) => {
    const genreId = req.params.id;

    try {
        //Fetch the genre list to get the genre name
        const genresResponse = await axios.get(`${base_url}/genre/movie/list`, {
            params: { api_key: process.env.API_KEY }
        });

        const genres = genresResponse.data.genres;
        const genre = genres.find(g => g.id == genreId)?.name || "Unknown Genre"; // Get genre name

        //Fetch movies for the selected genre
        const response = await axios.get(`${base_url}/discover/movie`, {
            params: { api_key: process.env.API_KEY, with_genres: genreId },
        });

        const movies = response.data.results;

        //Pass both the genre name & movie list to `genre.ejs`
        res.render("genre", { genre, movies });
    } catch (error) {
        console.error("ERROR fetching movies by genre:", error.message);
        res.status(500).send("Error fetching movies for this genre");
    }
});

// Search Route - Live Suggestions
app.get("/search", async (req, res) => {
    const query = req.query.query;

    if (!query) {
        return res.json([]);
    }

    try {
        const response = await axios.get(`${base_url}/search/movie`, {
            params: { api_key: process.env.API_KEY, query }
        });

        res.json(response.data.results.slice(0, 5)); // Send top 5 results
    } catch (error) {
        console.error("Error fetching search results:", error.message);
        res.status(500).json([]);
    }
});

//sign up using firebase
app.get("/signup", (req, res) => {
    res.render("login");  // Renders the signup page (auth.ejs)
}).post("/signup", async (req, res) => { //post
    const { firstName, lastName, dob, username, email, password } = req.body;
    
    console.log("Signup request body:", req.body); // Debugging log
    
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        await signupUser(firstName, lastName, dob, username, email, password);
        res.redirect("/login");
    } catch (error) {
        console.error("Error signing up:", error);
        res.status(500).json({ error: error.message });
    }
});

//login using firebase
app.get("/login", (req, res) => {
    res.render("login");  // Renders the login.ejs view
}).post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Call loginUser to handle Firebase login and get user data from MySQL
      const user = await loginUser(email, password);
  
      // Store user session and redirect to home
      req.session.user = { 
        username: user.username, 
        firebase_uid: user.firebase_uid
     };

      res.redirect("/");
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).send("Error logging in: " + error.message);
    }
  });
  
app.get("/profile", (req, res) => {
    const firebaseUid = req.session.user.firebaseUid;

    getUserProfile(firebaseUid, (err, user) => {
        if (err) {
            return res.status(500).send("Error fetching profile");
        }
        res.render("profile", { user });
    });
});

// User Logout
app.get("/logout", (req, res) => {
    const firebase_uid = req.session.user.firebase_uid;

    const sql = `UPDATE users SET lastLogin = NOW() WHERE firebase_uid = ?`;

    db.query(sql, [firebase_uid], (err, result) => {
        if (err) {
            console.error("Error updating lastLogin:", err);
            return res.status(500).send("Internal Server Error");
        }
        
        console.log(result);

        //Destroy session after updating lastLogin
        req.session.destroy(() => {
            res.redirect("/");
        });
    });
});

// Movie Details Page with Reviews
app.get("/movie/:id", async (req, res) => {
    const movieId = req.params.id;

    try {
        const response = await axios.get(`${base_url}/movie/${movieId}`, {
            params: { api_key: process.env.API_KEY }
        });

        const movie = response.data;

        // Fetch Reviews from MySQL
        db.query("SELECT * FROM reviews WHERE movieID = ?", [movieId], (err, reviews) => {
            if (err) {
                console.error("Error fetching reviews:", err);
                return res.status(500).send("Error fetching reviews");
            }

            //return json in test mode
            if (process.env.NODE_ENV === "test") {
                return res.json({ movie, reviews });
            }

            res.render("movie", { movie, reviews });
        });

    } catch (error) {
        console.error("ERROR fetching movie details:", error.message);
        res.status(500).send("Error fetching movie details");
    }
});

//Submit a Review
app.post("/review", (req, res) => {
    if (!req.session.user) {
        return res.status(401).send("You must be logged in to write a review");
    }

    const { movieID, text, rating } = req.body;
    const username = req.session.user.username;

    db.query("INSERT INTO reviews (username, movieID, text, rating) VALUES (?, ?, ?, ?)", 
        [username, movieID, text, rating], 
        (err, result) => {
            if (err) {
                console.error("Error submitting review:", err);
                return res.status(500).send("Error submitting review");
            }
            res.redirect(`/movie/${movieID}`);
        }
    );
});

app.post("/edit-review", (req,res) =>{
    const {  movieID, reviewId, text, e_rating} = req.body;

    const sql = `UPDATE reviews SET text = ?, rating = ? WHERE reviewId = ? `;
    db.query(sql, [text,e_rating,reviewId], (err, result) => {
        if (err) {
            console.error("Error updating review:", err);
            return res.status(500).send("Error updating review");
        }
        console.log(result);
        console.log(reviewId, text, e_rating);
        console.log("reqparams:", req.body);
        res.redirect(`/movie/${movieID}`);
    });

})

app.get("/rating/:review_Id/:username", async (req,res) => {
    const { review_Id, username } = req.params;
    let type = "none";

    //checks existing like
    const existing = await db.promise().query(
        `SELECT type FROM likes WHERE username = ? AND reviewId = ?`,
        [username, review_Id]
    );
    console.log("existingggggg");

    if(existing[0].length > 0){
        type = existing[0][0].type;
    }

    //checks like/dislike counts
    const counts = await db.promise().query(
        `SELECT 
            SUM(type = 'like') AS totalLikes, 
            SUM(type = 'dislike') AS totalDislikes
        FROM likes WHERE reviewId = ?`,
        [review_Id]
    );

    console.log(counts);

    res.json({
        totalLikes: counts[0][0].totalLikes || 0,
        totalDislikes: counts[0][0].totalDislikes || 0,
        userAction: type
    });
})

app.post("/rating/:review_Id/:type/:username", async (req,res) => {
    const { review_Id, type, username } = req.params;

    console.log(review_Id,type,username);

    try {
        //checks existing like/dislike
        const existing = await db.promise().query(
            `SELECT type FROM likes WHERE username = ? AND reviewId = ?`,
            [username, review_Id]
        );
        console.log(existing);

        if (existing[0].length > 0) {
            //console.log(existing[0][0].type);
            //console.log(type);
            if (existing[0][0].type === type) {
                // if user toggles off action, it removes type
                await db.promise().query(
                    "DELETE FROM likes WHERE username = ? AND reviewId = ?",
                    [username, review_Id]
                );
                console.log("removed");
            } else {
                // if user switches , update the action
                await db.promise().query(
                    "UPDATE likes SET type = ? WHERE username = ? AND reviewId = ?",
                    [type, username, review_Id]
                );
                console.log("swapped");
            }
        } else {
            // if no existing record, insert a new like/dislike
            await db.promise().query(
                "INSERT INTO likes (username, reviewId, type) VALUES (?, ?, ?)",
                [username, review_Id, type]
            );
            console.log("inserted");
        }
    } catch (error) {
        res.status(500).json({ error: "Database error", details: error });
    }
})

//Start Server
if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

app.get("/session-data", (req, res) => {
    console.log("Session Data:", req.session);
    res.send(req.session);
});

module.exports = app;
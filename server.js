// Import express
const express = require("express");
const db = require("./config/connection");
const Comment = require("./models/Comment");

const { engine } = require("express-handlebars");

const session = require("express-session");

// Import our view_routes
const view_routes = require("./controllers/view_routes");
const user_routes = require("./controllers/user_routes");
const post_routes = require("./controllers/post_routes");

// Create the port number and prepare for heroku with the process.env.PORT value
const PORT = process.env.PORT || 3333;

// Create the server app
const app = express();

// Open the static channel for our browser assets - ie. express.static on the public folder
app.use(express.static("./public"));

// Allow json to be sent from the client
// app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.engine(".hbs", engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");

// Middlewear to log user out after 15 minutes of inactivity
// ----------------------------------------------------
const SESSION_TIMEOUT = 15 * 60 * 1000;

function sessionTimeOut(req, res, next) {
  if (req.session && req.session.user) {
    req.session.lastActivity = Date.now();
    if (req.session.lastActivity < Date.now() - SESSION_TIMEOUT) {
      req.session.destroy((err) => {
        if (err) {
          console.log("Error destroying session:", err);
        }
      });
    }
  }
  next();
}
// ----------------------------------------------------

// Load session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: SESSION_TIMEOUT,
    },
  })
);

// Load our view routes at the root level '/'
app.use("/", [view_routes, post_routes]);
// /auth/register
app.use("/auth", user_routes);

app.use(sessionTimeOut);

// Sync and create tables
// { force: false }
db.sync({ force: true }).then(() => {
  // Start the server and log the port that it started on
  app.listen(PORT, () => console.log("Server is running on port", PORT));
});

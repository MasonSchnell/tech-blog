const router = require("express").Router();

const User = require("../models/User");
const Post = require("../models/Post");

// Block a route if a user is not logged in
function isAuthenticated(req, res, next) {
    if (!req.session.user_id) {
        return res.redirect("/login");
    }

    next();
}

// Attach user data to the request if they are logged in
async function authenticate(req, res, next) {
    const user_id = req.session.user_id;

    if (user_id) {
        const user = await User.findByPk(req.session.user_id);

        req.user = user;
    }

    next();
}

// Make a post
router.post("/post", isAuthenticated, authenticate, async (req, res) => {
    try {
        const post = await Post.create(req.body);

        await req.user.addPost(post);

        req.session.title = post.title;

        res.redirect("/");
    } catch (error) {
        req.session.errors = error.errors.map((errObj) => errObj.message);
        res.render("post_form", { errors: req.session.errors });
    }
});

module.exports = router;

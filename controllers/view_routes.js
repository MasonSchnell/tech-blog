// Create an express router instance object
const router = require("express").Router();
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

// Block an auth page if user is already logged in
function isLoggedIn(req, res, next) {
    if (req.session.user_id) {
        return res.redirect("/");
    }

    next();
}

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
        const user = await User.findByPk(req.session.user_id, {
            attributes: ["id", "email"],
        });

        req.user = user.get({ plain: true });
    }

    next();
}

// Add one test GET route at root - localhost:3333/
router.get("/", authenticate, async (req, res) => {
    const posts = await Post.findAll({
        include: {
            model: User,
            as: "author",
        },
    });

    res.render("landing", {
        user: req.user,
        posts: posts.map((c) => c.get({ plain: true })),
    });
});

router.get("/postView/:id", authenticate, async (req, res) => {
    const postId = req.params.id;
    let commentUser;

    const post = await Post.findByPk(postId);
    const user = await User.findByPk(post.dataValues.author_id);
    const comment = await Comment.findAll({
        where: {
            post_id: postId,
        },
    });

    if (comment.length > 0) {
        comment.forEach(async function (commentItem) {
            const commentCreatedAt = commentItem.dataValues.createdAt;
            commentItem.dataValues.createdAt = formatDate(commentCreatedAt);
            commentUser = await User.findByPk(commentItem.dataValues.user_id);
            commentItem.dataValues.user_id = commentUser.dataValues.email;
            await commentItem.save();
        });
    }

    const createdAt = post.dataValues.createdAt;

    post.dataValues.createdAt = formatDate(createdAt);

    res.render("postView", { post, user, comment });

    req.session.errors = [];
});

router.get("/updatePost/:id", authenticate, async (req, res) => {
    const postId = req.params.id;

    const post = await Post.findByPk(postId);

    res.render("updatePost", { post });

    req.session.errors = [];
});

function formatDate(date) {
    const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
    });
    return formattedDate;
}

// GET route to show the register form
router.get("/register", isLoggedIn, authenticate, (req, res) => {
    // Render the register form template
    res.render("register_form", {
        errors: req.session.errors,
        user: req.user,
    });

    req.session.errors = [];
});

router.get("/dashboard", isAuthenticated, authenticate, async (req, res) => {
    // Render the register form template
    let userPosts;
    let postDate;
    let user;
    try {
        const loggedInUserId = req.user.id;
        user = await User.findByPk(loggedInUserId, {
            include: [
                {
                    model: Post,
                    as: "posts",
                },
            ],
        });
        userPosts = user.posts;
        userPosts.reverse();

        formattedDates = [];
        userPosts.forEach((post) => {
            const createdAt = post.dataValues.createdAt;

            const formattedDate = createdAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
            });
            post.dataValues.createdAt = formattedDate;
        });

        postDate = user.posts.date;
    } catch (error) {
        console.log("An error occurred:", error);
    }

    res.render("dashboard", { userPosts, user, formattedDates });

    req.session.errors = [];
});

// GET route to show the login form
router.get("/login", isLoggedIn, authenticate, (req, res) => {
    // Render the register form template
    res.render("login_form", {
        errors: req.session.errors,
        user: req.user,
    });

    req.session.errors = [];
});

// Show Post page
router.get("/post", isAuthenticated, authenticate, (req, res) => {
    res.render("post_form", {
        user: req.user,
    });

    req.session.errors = [];
});

// Export the router
module.exports = router;

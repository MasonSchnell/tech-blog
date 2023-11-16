const router = require("express").Router();

const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

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

    res.redirect("/dashboard");
  } catch (error) {
    req.session.errors = error.errors.map((errObj) => errObj.message);
    res.render("post_form", { errors: req.session.errors });
  }
});

router.post(
  "/updatePost/:id",
  isAuthenticated,
  authenticate,
  async (req, res) => {
    try {
      const post = await Post.findByPk(req.params.id);

      post.setDataValue("title", req.body.titleUpdate);
      post.setDataValue("text", req.body.textUpdate);
      await post.save();

      res.redirect("/dashboard");
    } catch (error) {
      req.session.errors = error.errors.map((errObj) => errObj.message);
      res.render("updatePost", { errors: req.session.errors });
    }
  }
);

router.post(
  "/postView/:id",
  isAuthenticated,
  authenticate,
  async (req, res) => {
    let userPostId;
    try {
      const userPostId = req.params.id;

      const newComment = req.body.comment;

      const val = {
        text: newComment,
      };

      const comment = await Comment.create(val);
      // comment.dataValues.user_id = req.session.user_id;
      comment.setDataValue("user_id", req.session.user_id);
      await comment.save();

      const userPost = await Post.findByPk(userPostId);

      if (userPost) {
        await userPost.addComment(comment);
      } else {
        console.log(error);
      }

      res.redirect(`/postView/${userPostId}`);
    } catch (error) {
      const validationErrors = error.errors.map((errObj) => errObj.message);
      req.session.errors = validationErrors;
      res.render(`/postView/${userPostId}`, {
        errors: req.session.errors,
      });
    }
  }
);

router.post(
  "/deletePost/:id",
  isAuthenticated,
  authenticate,
  async (req, res) => {
    try {
      const userPostId = req.params.id;
      const userPost = await Post.findByPk(userPostId);
      await userPost.destroy();
      res.render("dashboard");
    } catch (error) {
      const validationErrors = error.errors.map((errObj) => errObj.message);
      req.session.errors = validationErrors;
      res.render("dashboard", { errors: req.session.errors });
    }
  }
);

module.exports = router;

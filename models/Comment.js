const { Model, DataTypes } = require("sequelize");
const db = require("../config/connection");

const Post = require("./Post");
const User = require("./User");

class Comment extends Model {}

Comment.init(
    {
        text: {
            type: DataTypes.STRING,
            validate: {
                len: {
                    args: 3,
                    msg: "Your message must be at least 3 characters in length.",
                },
            },
        },
    },
    {
        modelName: "user_comments",
        freezeTableName: true,
        sequelize: db,
        tableName: "user_comments",
    }
);

Post.hasMany(Comment, { as: "comments", foreignKey: "post_id" });
// Comment.belongsTo(Post, { as: "commentor", foreignKey: "post_id" });
Comment.belongsTo(User, { as: "commentor", foreignKey: "user_id" });

module.exports = Comment;

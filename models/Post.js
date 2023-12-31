const { Model, DataTypes } = require("sequelize");
const db = require("../config/connection");

const dayjs = require("dayjs");

class Post extends Model {}

Post.init(
    {
        title: {
            type: DataTypes.STRING,
            validate: {
                len: {
                    args: 3,
                    msg: "Your title must be at least 3 characters in length.",
                },
            },
        },
        text: {
            type: DataTypes.STRING,
            validate: {
                len: {
                    args: 3,
                    msg: "Your message must be at least 3 characters in length.",
                },
            },
        },
        date: {
            type: DataTypes.VIRTUAL,
            get() {
                return dayjs(this.createdAt).format("MM/DD/YYYY hh:mma");
            },
        },
    },
    {
        modelName: "user_posts",
        freezeTableName: true,
        sequelize: db,
    }
);

module.exports = Post;

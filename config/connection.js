// Import the Sequelize constructor from sequelize
const { Sequelize } = require("sequelize");
require("dotenv").config();

const isProd = process.env.PORT;
// Create a new connection instance, using option 3 from the docs
const sequelize = isProd ? new Sequelize(process.env.JAWSDB_URL): new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        host: "localhost",
        dialect: "mysql",
        // Turn off SQL logging in the terminal
        logging: false,
    }
);

// Export the connection object
module.exports = sequelize;

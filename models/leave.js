const Sequelize = require("sequelize");

const sequelize = require("../utils/database");

const Leave = sequelize.define("leave", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  date: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  reason: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  status: {
    type: Sequelize.ENUM("Accepted", "Declined", "Applied"),
    defaultValue: "Applied",
  },
});
module.exports = Leave;

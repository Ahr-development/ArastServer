const { DataTypes } = require("sequelize");

module.exports = model;

function model(sequelize) {
  const attributes = {
    Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    Name: { type: DataTypes.STRING(30), allowNull: false },
    Email: { type: DataTypes.STRING(30), allowNull: false },
  };

  const options = {
    freezeTableName: true,
    // don't add the timestamp attributes (updatedAt, createdAt)
    timestamps: false,
  };
  return sequelize.define("Person", attributes, options);
}
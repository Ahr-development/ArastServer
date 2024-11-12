



const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Authenticates = sequelize.define('Authenticates', {
    Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    AuthenticateCode: {
      type: DataTypes.STRING(255), // Adjust max length as needed
      allowNull: true,
    },
    AuthDate: {
      type: DataTypes.DATE, // Use DATE for datetime2 without time component
      allowNull: true,
    },
    BrowserName: {
      type: DataTypes.STRING(255), // Adjust max length as needed
      allowNull: true,
    },
    RoleId: {
      type: DataTypes.INTEGER,
    },
    IsValid: {
      type: DataTypes.BOOLEAN,
    },
    AuthCodeServer: {
      type: DataTypes.STRING(255), // Adjust max length as needed
      allowNull: true,
    },
    UUID: {
      type: DataTypes.STRING(255), // Adjust max length as needed
      allowNull: true,
    },
  }, {
    // Prevent Sequelize from pluralizing the table name (optional)
    freezeTableName: true,
    // Disable automatic timestamps (optional)
    timestamps: false,
  });

  return Authenticates;
};



const { DataTypes } = require("sequelize");

module.exports = AssetsCategory;

function AssetsCategory(sequelize) {
  const attributes = {
    Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },

    CategoryPersianName: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    CategoryEnglishName: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    CategoryArabicName: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    CategoryDescription: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    CategoryImage: {
        type: DataTypes.STRING,
        allowNull: true,
    }
  };

  const options = {
    freezeTableName: true,
    // don't add the timestamp attributes (updatedAt, createdAt)
    timestamps: false,
  };
  return sequelize.define("AssetsCategory", attributes, options);
}
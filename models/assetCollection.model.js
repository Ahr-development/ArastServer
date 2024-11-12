

const { DataTypes } = require("sequelize");

module.exports = AssetCollection;

function AssetCollection(sequelize) {
    const attributes = {
        Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        CategoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        SubCategoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        StoreId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        PersianName: {
            type: DataTypes.STRING, // Adjust if length limit is known
            allowNull: true,
        },
        ColorUsing: {
            type: DataTypes.STRING,
            allowNull: true,
            // Adjust if length limit is known
        },
        Description: {
            type: DataTypes.STRING,
            allowNull: true,
            // Adjust if length limit is known
        },
        KeyWord: {
            type: DataTypes.STRING,         
            allowNull: true,
            // Adjust if length limit is known
        },
    };

    const options = {
        freezeTableName: true,
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
    };
    return sequelize.define("AssetCollection", attributes, options);
}


const { DataTypes } = require("sequelize");

module.exports = Assets;

function Assets(sequelize) {
    const attributes = {
        Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        TypeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        CategoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        SubCategoryId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        CollectionId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        AssetId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        StoreId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        PersianName: {
            type: DataTypes.STRING, // Adjust if length limit is known
            allowNull: true,
        },
        EnglishName: {
            type: DataTypes.STRING, // Adjust if length limit is known
            allowNull: true,
        },
        ArabicName: {
            type: DataTypes.STRING, // Adjust if length limit is known
            allowNull: true,
        },
        Description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        PriceIRR: {
            type: DataTypes.INTEGER,
        },
        PriceUSD: {
            type: DataTypes.INTEGER,
        },
        UsingNumber: {
            type: DataTypes.INTEGER,
        },
        StarCounter: {
            type: DataTypes.INTEGER,
        },
        ColorUsing: {
            type: DataTypes.STRING,
            allowNull: true,
            // Adjust if length limit is known
        },
        AssetsFileName: {
            type: DataTypes.STRING,
            allowNull: true,
            // Adjust if length limit is known
        },
        AssetsStaticFile: {
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
    return sequelize.define("Assets", attributes, options);
}
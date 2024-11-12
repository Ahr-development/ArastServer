
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Font = sequelize.define('Font', {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        StoreId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        FontName: {
            type: DataTypes.STRING, // یا از نوع DataTypes.TEXT برای nvarchar(MAX)
            allowNull: false
        },
        FontType: {
            type: DataTypes.STRING, // یا از نوع DataTypes.TEXT برای nvarchar(MAX)
            allowNull: false
        },
        FontFormat: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        FontFileName: {
            type: DataTypes.STRING, // یا از نوع DataTypes.TEXT برای nvarchar(MAX)
            allowNull: false
        },
        FontStaticFileName: {
            type: DataTypes.STRING, // یا از نوع DataTypes.TEXT برای nvarchar(MAX)
            allowNull: true
        },
        FontParentId: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        // Prevent Sequelize from pluralizing the table name (optional)
        freezeTableName: true,
        // Disable automatic timestamps (optional)
        timestamps: false,
    });

    return Font;
};

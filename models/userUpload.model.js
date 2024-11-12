


const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const UserUpload = sequelize.define('UserUpload', {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        FileId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        UserId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        FileName: {
            type: DataTypes.STRING, // یا از نوع DataTypes.TEXT برای nvarchar(MAX)
            allowNull: false
        },
        FileCompressed: {
            type: DataTypes.STRING, // یا از نوع DataTypes.TEXT برای nvarchar(MAX)
            allowNull: false
        },
        MainFile: {
            type: DataTypes.STRING, // یا از نوع DataTypes.TEXT برای nvarchar(MAX)
            allowNull: false
        },
        UploadDateTime: {
            type: DataTypes.STRING, // یا از نوع DataTypes.TEXT برای nvarchar(MAX)
            allowNull: true
        },

    }, {
        // Prevent Sequelize from pluralizing the table name (optional)
        freezeTableName: true,
        // Disable automatic timestamps (optional)
        timestamps: false,
    });

    return UserUpload;
};

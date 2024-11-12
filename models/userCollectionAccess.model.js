


const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const UserCollectionAccess = sequelize.define('UserCollectionAccess', {
        Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        UserId: {
            type: DataTypes.INTEGER,
        },
        StoreId: {
            type: DataTypes.INTEGER,
        },
        CollectionId: {
            type: DataTypes.INTEGER,
        },
        CollectionAccess: {
            type: DataTypes.BOOLEAN,
        },
    }, {
        // Prevent Sequelize from pluralizing the table name (optional)
        freezeTableName: true,
        // Disable automatic timestamps (optional)
        timestamps: false,
    });

    return UserCollectionAccess;
};

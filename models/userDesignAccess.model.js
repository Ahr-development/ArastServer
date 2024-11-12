





const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const UserDesignAccess = sequelize.define('UserDesignAccess', {
        Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        UserId: {
            type: DataTypes.INTEGER,
        },
        DesignId: {
            type: DataTypes.INTEGER,
        },
        CollectionId: {
            type: DataTypes.INTEGER,
        },
        AccessStatus: {
            type: DataTypes.BOOLEAN,
        },
    }, {
        // Prevent Sequelize from pluralizing the table name (optional)
        freezeTableName: true,
        // Disable automatic timestamps (optional)
        timestamps: false,
    });

    return UserDesignAccess;
};

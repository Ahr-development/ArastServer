








const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const UserDesignInit = sequelize.define('UserDesignInit', {
        Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        DesignId: {
            type: DataTypes.INTEGER,
        },
        UserId: {
            type: DataTypes.INTEGER,
        },
        CanvasFileJson: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        // Prevent Sequelize from pluralizing the table name (optional)
        freezeTableName: true,
        // Disable automatic timestamps (optional)
        timestamps: false,
    });

    return UserDesignInit;
};

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('image', {
    cloudinaryID: {
      primaryKey: true,
      type: DataTypes.UUID,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
    },
    projectId: {
      type: DataTypes.UUID,
      references: {
        model: 'projects', // 'projects' refers to table name
        key: 'id', // 'id' refers to column name in projects table
      }
    },
    main: {
      type: DataTypes.BOOLEAN,
    },
  }, {
    freezeTableName: true,
    timestamps: false,
  });
};

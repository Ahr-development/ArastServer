
const db = require("../config/db");





const NewUserUpload = async (FileId, UserId, FileName, FileCompressed, MainFile, UploadDateTime) => {
    const upload = await db.UserUpload.create({
        FileId,
        UserId,
        FileName,
        FileCompressed,
        MainFile,
        UploadDateTime,  
    });
  
    return upload;
  };
  


  const getAuthenticateUserUploadsByPageCount = async (page, UserId) => {
    const uploads = await db.UserUpload.findAll({
      where: {
        UserId : UserId, 
      },
      order: [['Id', 'ASC']],
      offset: (page - 1) * 5,
      limit: 30,
    });
    return uploads;
  };
  


  const findUserUploadById = async (id) => {
    return await db.UserUpload.findByPk(id);
  };

module.exports = {
    NewUserUpload,
    getAuthenticateUserUploadsByPageCount,
    findUserUploadById
};
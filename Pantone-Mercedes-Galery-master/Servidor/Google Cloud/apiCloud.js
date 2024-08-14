const {Storage} = require("@google-cloud/storage");
require("dotenv").config();
const fs = require('fs');
const path = require('path');
const projectId = "xxxx";
const keyFilename = "xxxx";
const storage = new Storage({projectId, keyFilename});
const bucketName = "xxxx";
const bucket = storage.bucket(bucketName);



async function uploadFile(bucketName, file, fileOutputName) {
    try{
        const ret = await bucket.upload(file, {
            destination: fileOutputName
        });
        return ret;
    }
    catch(err){
        console.log(err);
    }
}

async function getFiles(fileName) {
    try {
        const file = await bucket.file(fileName);
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '03-17-2025' 
        });
        return url;
    } catch (err) {
        console.log("Error en la API de GOOGLE CLOUD "+err); 
    }
}

async function  saveImage (file){
    try{
         await uploadFile(process.env.BUCKET_NAME,file.path, file.originalname);
        return;
    }
    catch(err){
        console.log(err);
    }
}
async function deleteFile(fileName) {
    try {
        const file = bucket.file(fileName);
        const [exists] = await file.exists();
        if (exists) {
            await file.delete();
        } 
    } catch (err) {
        console.error("Error deleting file:", err);
    }
}




module.exports = {
    getFiles,
    saveImage,
    deleteFile
}
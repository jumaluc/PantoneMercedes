const {Storage} = require("@google-cloud/storage");
require("dotenv").config();
const fs = require('fs');
const path = require('path');
const projectId = "pantone-web";
const keyFilename = "C:/Users/jmcar/OneDrive/Escritorio/Proyectos/PantoneWeb/Pantone-Mercedes-Galery-master/Servidor/Google Cloud/pantone-web-74dbcee1cb11.json";
const storage = new Storage({projectId, keyFilename});
const bucketName = "pantone-almacen-imagenes";
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
async function uploadFileWebp(aa, buffer, fileOutputName){
    try{
        const file = bucket.file(fileOutputName);
        const stream = file.createWriteStream({
            metadata: {
                contentType: 'image/webp'
            }
        });
        stream.end(buffer);

        return new Promise((resolve, reject) => {
            stream.on('finish', ()=> resolve(`File upload succesfully`)  );
            stream.on('error', reject);
        })

    }
    catch(err){
        console.log(err);
        throw err;
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
         await uploadFileWebp(process.env.BUCKET_NAME,file.buffer, file.originalname);
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
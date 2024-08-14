const fs = require('fs');
const { google } = require('googleapis');
const apikeys = require("");
const fetch = require('node-fetch');
const stream = require('stream');


const SCOPE = ['https://www.googleapis.com/auth/drive.file'];

async function authorize() {
    const jwtClient = new google.auth.JWT(
        apikeys.client_email,
        null,
        apikeys.private_key,
        SCOPE
    );
    await jwtClient.authorize();
    return jwtClient;
}
async function createFolder(authClient, folderName) {
    const drive = google.drive({ version: 'v3', auth: authClient });
    console.log("d")
    const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: ['xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'] 
    };

    try {
        const file = await drive.files.create({
            resource: fileMetadata,
            fields: 'id'
        });
        console.log('Folder Id:', file.data.id);
        return file.data.id;
    } catch (err) {
        console.error('Error creating folder:', err);
    }
}

async function uploadFileDrive(authClient, folderId,  signedUrl, fileName) {
    const drive = google.drive({ version: 'v3', auth: authClient });

    console.log("e")
    const response = await fetch(signedUrl);
    if (!response.ok) throw new Error(`Failed to fetch ${signedUrl}: ${response.statusText}`);
    
    const passthroughStream = new stream.PassThrough();
    response.body.pipe(passthroughStream);

    const fileMetadata = {
        name: fileName,
        parents: [folderId]
    };

    const media = {
        mimeType: response.headers.get('content-type'),
        body: passthroughStream,
    };

    try {
        const uploadedFile = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id'
        });
    } catch (err) {
        console.error('Error uploading file:', err);
    }
}
//authorize().then(uploadFile).catch(console.error);

module.exports = { authorize, createFolder, uploadFileDrive };

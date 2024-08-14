const express = require('express');
const multer = require('multer');
const app = express();
const path = require('path');
const  {authorize, createFolder, uploadFileDrive, processUrls} = require("./GoogleDriveApi/apiDrive.js");
const {ImagenesControlador} = require("./controlador/imagenes-controlador.js");
const cors = require('cors');
const fs = require('fs');


app.use(express.json());
app.use(cors());
app.use(cors({ origin: '*' })); 

const upload = multer({
    dest: 'uploads/'
}); 



app.get("/home/clientes", ImagenesControlador.obtenerClientes);

app.get('/api/clientes/:id', ImagenesControlador.obtenerTodasLasImagenes);

app.post("/api/agregarCliente", upload.array("fotos",500), ImagenesControlador.agregarCliente);

//app.post("/:id", upload.array("imagenes", 100), ImagenesControlador.subirImagenes);

app.delete("/api/clientes/borrar/:id", ImagenesControlador.borrarCliente);

app.patch("/api/clientes/fotos/:id", upload.array("files",500), ImagenesControlador.actualizarImagenesCliente);


app.post("/enviarFotos", async (req, res)=>{

    console.log("a")
    const {urls} = req.body;
    const nombreCompleto = req.query.nombre;

    try{
        const authClient = await authorize();
        const folderId = await createFolder(authClient, nombreCompleto);
        const uploadPromises = urls.map((url, index) => {
            const fileName = `imagen_${index}.jpg`; 
            return uploadFileDrive(authClient, folderId, url, fileName);
        });
        await Promise.all(uploadPromises);

        res.json({message: "Fotos subidas correctamente"});

        console.log("Fotos subidas a google drive correctamente");
    }
    catch(err){
        res.status(500).json({message: "Error al subir las fotos"});
    }

})

function borrarArchivosEnUploads() {
    const directory = path.join(__dirname, 'uploads');

    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.unlink(path.join(directory, file), (err) => {
                if (err) throw err;
                console.log(`Archivo eliminado: ${file}`);
            });
        }
    });
}

setInterval(borrarArchivosEnUploads, 3600000); 




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
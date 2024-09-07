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

const upload = multer({ storage : multer.memoryStorage() });



app.get("/home/clientes", ImagenesControlador.obtenerClientes);

app.get('/api/clientes/:id', ImagenesControlador.obtenerTodasLasImagenes);

app.post("/api/agregarCliente", upload.array("fotos",500), ImagenesControlador.agregarCliente);

//app.post("/:id", upload.array("imagenes", 100), ImagenesControlador.subirImagenes);

app.delete("/api/clientes/borrar/:id", ImagenesControlador.borrarCliente);

app.patch("/api/clientes/fotos/:id", upload.array("fotos",500), ImagenesControlador.actualizarImagenesCliente);


app.post("/enviarFotos", ImagenesControlador.enviarFotos)





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
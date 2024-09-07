const { allowedNodeEnvironmentFlags } = require("node:process");
const {ImagenesModelo} = require("../modelo/imagenes-modelo.js");
const {funcionGenerarSchema, funcionGenerarSchemaFotos} = require("../validaciones.js");
const path = require('node:path');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const { buffer } = require("stream/consumers");


async function convertirAWebp(foto) {
    const uniqueId = uuidv4();
    const nombre = uniqueId + ".webp";

    const bufferImg = await sharp(foto.buffer)
        .webp({ quality: 75 })  
        .toBuffer();

    const newSize = bufferImg.length;
    return {
        ...foto,
        originalname: nombre,
        mimetype: 'image/webp',  
        buffer: bufferImg,
        size : newSize
    };
}
class ImagenesControlador{

    static async agregarCliente(req, res){

        const datosCompletos = {
            ...req.body,
            fotos: req.files.map(file => ({
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                buffer: file.buffer
            }))
        };
        const cliente =   funcionGenerarSchema(datosCompletos);
        if(cliente.success === false){
            console.log("error > ", cliente.error.errors);
        }

        const fotoPrincipal = req.body.fotoPrincipal;

        const indexFotoPrincipal = cliente.data.fotos.findIndex(foto => foto.originalname === fotoPrincipal);

        const fotosWEBP = await Promise.all(cliente.data.fotos.map(async (foto) => {
            const webp = await convertirAWebp(foto);
            return webp;
        }));

        let fotoPrincipalUnica = 0;
        if(indexFotoPrincipal !== -1){
            fotoPrincipalUnica = fotosWEBP[indexFotoPrincipal].originalname;
        }
        if(cliente.success === false){
            res.status(400).json(cliente.error.errors);
            return;
        }
        const posibleID = await ImagenesModelo.verificarExistenciaCliente(cliente.data.nombre, cliente.data.apellido);

        let id = -1;
        if(posibleID === undefined){
             id = await ImagenesModelo.agregarCliente(cliente.data.nombre, cliente.data.apellido, fotoPrincipalUnica);
             await ImagenesModelo.subirImagenes(fotosWEBP, id);


        }
        else{
            await ImagenesModelo.subirImagenes(fotosWEBP, posibleID);

        }
        if(id === undefined){
            res.status(500).json("Error al agregar el cliente");
            return;
        }

        res.json("Cliente agregado correctamente");

    }

    static async obtenerTodasLasImagenes(req, res){
        const imagenes = await ImagenesModelo.obtenerTodasLasImagenes(req.params.id);
        
        if(imagenes.length === 0){
            res.status(404).json("No se encontraron imágenes");
            return;
        }
        res.json(imagenes); 
    };

    static async subirImagenes(req, res){
        //verificar que sean imagenes
        
        const files = req.files;
        ImagenesModelo.subirImagenes(files);
        console.log("Imagenes subidas")
        res.send("Imagenes subidas");
    };


    static async obtenerClientes(req, res){
        try{
            const clientes = await ImagenesModelo.obtenerClientes();
            res.json(clientes);
        }
        catch(err){
            console.error("Error en el controlador" + err);
        }
    }


    static async borrarCliente(req, res){
        const id = req.params.id;
        console.log("ID > ",id)
        await ImagenesModelo.borrarCliente(id);
        res.send("Cliente borrado correctamente");
    }
    static async actualizarImagenesCliente(req, res){

        console.log("Files > ", req.files.length);
        

        const fotos = req.files.map(file => ({
            originalname: file.originalname,
            mimetype: file.mimetype,
            buffer : file.buffer,
            size: file.size
        }));

        const fotosValidadas = funcionGenerarSchemaFotos({fotos});

        const fotosWEBP = await Promise.all(fotosValidadas.data.fotos.map(async (foto) => {
            const webp = await convertirAWebp(foto);
            return webp;
        }));

        if(fotosValidadas.success === false){
            res.status(400).send(fotosValidadas.error.errors);
            return;
        }
        const id = req.params.id;
        console.log("id  ", id);
        await ImagenesModelo.actualizarImagenesCliente(id, fotosWEBP);
        res.json("Imagenes actualizadas correctamente");
    }
    
    static async enviarFotos(req, res){
        const {urls} = req.body;
        const nombreCompleto = req.query.nombre;
        console.log("urls > ", urls);
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
    }

}



module.exports = {ImagenesControlador};
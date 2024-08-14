const {ImagenesModelo} = require("../modelo/imagenes-modelo.js");
const {funcionGenerarSchema, funcionGenerarSchemaFotos} = require("../validaciones.js");
const path = require('node:path');
const { v4: uuidv4 } = require('uuid');


class ImagenesControlador{

    static async agregarCliente(req, res){


        const datosCompletos = {
            ...req.body,
            fotos: req.files.map(file => ({
                originalname: file.originalname,
                mimetype: file.mimetype,
                path: file.path,
                size: file.size
            }))
        };

        const cliente =   funcionGenerarSchema(datosCompletos);


        const fotoPrincipal = req.body.fotoPrincipal;

        const indexFotoPrincipal = cliente.data.fotos.findIndex(foto => foto.originalname === fotoPrincipal);

        const fotosUnicas = cliente.data.fotos.map(foto => {

            const uniqueId = uuidv4();
            const ext = path.extname(foto.originalname);
            const nombre = uniqueId + ext;
            return {
                ...foto,
                originalname: nombre
            }
        });

        const fotoPrincipalUnica = fotosUnicas[indexFotoPrincipal].originalname;

        if(cliente.success === false){
            res.status(400).json(cliente.error.errors);
            return;
        }
        const id = await ImagenesModelo.agregarCliente(cliente.data.nombre, cliente.data.apellido, fotoPrincipalUnica);

        if(id === undefined){
            res.status(500).json("Error al agregar el cliente");
            return;
        }

        await ImagenesModelo.subirImagenes(fotosUnicas, id);
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


        const fotos = req.files.map(file => ({
            originalname: file.originalname,
            mimetype: file.mimetype,
            path : file.path,
            size: file.size
        }));

        const fotosValidadas = funcionGenerarSchemaFotos({fotos});

        console.log("fotosValidadas", fotosValidadas   );

        if(fotosValidadas.success === false){
            res.status(400).send(fotosValidadas.error.errors);
            return;
        }
        const id = req.params.id;
        console.log("id  ", id);
        await ImagenesModelo.actualizarImagenesCliente(id, fotosValidadas.data.fotos);
        res.json("Imagenes actualizadas correctamente");
    }

}



module.exports = {ImagenesControlador};
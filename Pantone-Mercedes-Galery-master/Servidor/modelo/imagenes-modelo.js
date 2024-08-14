const {deleteFile ,getFiles, saveImage} = require("../Google Cloud/apiCloud.js");
const mysql = require("mysql2/promise");

const config = {
    host: "127.0.0.1",
    user:"jumaluc",
    port: 3306,
    password: "Obi1301wan#1",
    database: "PantoneDB"
}
let connection;
(async () => {
    connection = await mysql.createConnection(config);
})();

class ImagenesModelo{

    static async agregarCliente(nombre, apellido, fotoPrincipal){
        //VERIFICAR QUE NO HAYAN 2 CLIENTES CON EL MISMO NOMBRE

        try{

            await connection.query("INSERT INTO clientes (nombre, apellido, fotoPrincipal) VALUES (?, ?, ?)", [nombre, apellido, fotoPrincipal]);
            const [result] = await connection.query("SELECT id FROM clientes WHERE nombre = ? AND apellido = ?", [nombre, apellido]);
            const id = result[0].id;
            return id;
        }
        catch(err){
            console.error("Error al acceder a la base de datos" + err);
        }
    }



    static async obtenerTodasLasImagenes(id = 1) {
        try {
            const [result] = await connection.query("SELECT nombreImg FROM imagenes WHERE id_cliente = ?", [id]);
            const urls = await Promise.all(
                result.map(async (file) => {
                    const url = await getFiles(file.nombreImg);
                    return url;
                })
            );
            return urls; 
        } catch (err) {
            console.error(err);
        }
    }
    static async subirImagenes(files, id){

        await Promise.all(
            files.map(async (file) => {
                await saveImage(file); 
                await connection.query("INSERT INTO imagenes (nombreImg, id_cliente) VALUES (?, ?)", [file.originalname, id]);
               
            }
        )
        );
    
        return "Imagenes subidas";
    }
    static async obtenerClientes(){
        try{
            const [clientes] = await connection.query("SELECT * FROM clientes");
            const clientesConImagenes = await Promise.all(
                clientes.map(async (cliente) => {
                    return {
                        ...cliente,
                        fotoPrincipal: await getFiles(cliente.fotoPrincipal)
                    }
                }
            ))
            return clientesConImagenes;
        }
        catch(err){
            console.error("Error al acceder a la base de datos" + err);
        }
    }
    static async borrarCliente(id){
        try{
            const [imagenes] =await connection.query("SELECT * FROM imagenes WHERE id_cliente = ?", [id]);

            await Promise.all(
                imagenes.map(async (imagen) => {
                    await deleteFile(imagen.nombreImg);
                })
            )
            
            await connection.query("DELETE FROM imagenes WHERE id_cliente = ?", [id]);
            await connection.query("DELETE FROM clientes WHERE id = ?", [id]);
        }
        catch(err){
            console.error("Error al acceder a la base de datos" + err);
        }
    }

    static async actualizarImagenesCliente(id, fotos){

        try{

            await Promise.all(
                fotos.map(async (file) => {

                    await saveImage(file);
                    await connection.query("INSERT INTO imagenes (nombreImg, id_cliente) VALUES (?,?)", [file.originalname, id]);
                }
            )
            )
            return 
        }
        catch(err){
            console.error("Error al acceder a la base de datos" + err);

            }
}
}

module.exports = {ImagenesModelo};
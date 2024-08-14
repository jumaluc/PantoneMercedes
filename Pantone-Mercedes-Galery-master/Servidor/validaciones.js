const zod = require('zod');


const extencionesImgValidas = ["jpg", "jpeg", "png"];

const schema = zod.object({
    nombre: zod.string().min(3).max(50),
    apellido: zod.string(),
    fotos: zod.array(zod.object({
        originalname: zod.string().refine((value) => {
            const ext = value.split(".").pop();
            return extencionesImgValidas.includes(ext);
        }, {message: "Extensión de archivo no válida"}),
        mimetype: zod.string(),
        path : zod.string(),
        size: zod.number()
    }))
});


const schemaFotos = zod.object({


    fotos: zod.array(zod.object({
        originalname: zod.string().refine((value) => {
            const ext = value.split(".").pop();
            return extencionesImgValidas.includes(ext);
        }, {message: "Extensión de archivo no válida"}),
        mimetype: zod.string(),
        path : zod.string(),
        size: zod.number()
    }))

})

const funcionGenerarSchemaFotos = (objeto) => {
    return schemaFotos.safeParse(objeto);
}


const funcionGenerarSchema = (objeto) => {
    return schema.safeParse(objeto);
}







module.exports = {funcionGenerarSchema, funcionGenerarSchemaFotos};




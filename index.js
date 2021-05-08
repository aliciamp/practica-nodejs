// Importamos los módulos necesarios
const http          = require('http')
const MongoClient   = require('mongodb').MongoClient;
const querystring   = require('querystring');

// Definimos la Base de Datos MongoDB
const url           = 'mongodb://localhost:27017';
const dbName        = 'nodejs-mongo';
const client        = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

// Creamos el servidor
const server = http.createServer( ( req , res )=>{
    const { headers, method, url , data } = req;
    
    let a       = {}
    let resultados;
    let body    = [];
    
    if (method == "POST") {

        //Generamos los mensajes de error así como la concatenación y el final
        req.on('error', (err) => {
            console.error(err);
        })
        .on('data', chunk => {
            body.push(chunk)
        })
        .on('end', () => {
            body = Buffer.concat(body).toString();
            a = querystring.parse(body);
        })

        client.connect().then(async () => {
            const db = client.db(dbName);
            const collection = db.collection('contactos');
            const insertResult = await collection.insertOne(a);
            resultados = await collection.find({}).toArray();   
        }).then( async ()=>{
            
            res.writeHead( 200 , {'Content-type' : 'text/html'})
            res.write('<html><body><p>Estos son tus contactos en la base de datos:</p>');
                //Listamos todos los contactos
                for (let i = 0; i < resultados.length; i++) {
                    res.write(`<li> ${resultados[i].name}  ${resultados[i].phone} </li>`);
                }
            res.write('</body></html>')
            res.end()

        })
        //Mensaje de error
        .catch((error) => {
            res.statusCode = 404;
            console.log("Se ha producido un error con la conexión a la base de datos." + error);
            client.close();
        });


    }else{
        console.log('Método de envío incorrecto. Cancelando la petición.')
        res.end()
    }
})

server.listen(2000 , ()=>{
    console.log('Accede a http://localhost:2000 a través de Postman para añadir contactos')
})
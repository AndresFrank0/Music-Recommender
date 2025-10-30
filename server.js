// Cargar variables de entorno
require('dotenv').config();

const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

// Middleware para servir archivos estáticos (nuestro frontend)
app.use(express.static('public'));
app.use(express.json());

// Configuración de la conexión a MongoDB
const uri = process.env.MONGO_URI; // Usaremos una variable de entorno para la URI
const client = new MongoClient(uri);

let db;

// Conectar a la base de datos al iniciar el servidor
async function connectDB() {
  try {
    await client.connect();
    db = client.db('sample_mflix'); // Nombre de nuestra base de datos
    console.log("Conectado exitosamente a MongoDB Atlas");
  } catch (error) {
    console.error("No se pudo conectar a la base de datos", error);
    process.exit(1);
  }
}

// --- API Endpoints ---

// Endpoint para obtener todas las canciones
app.get('/api/songs', async (req, res) => {
  const songs = await db.collection('songs').find().toArray();
  res.json(songs);
});

// Endpoint para obtener recomendaciones
// Lógica simple: recibe el género de una canción y devuelve otras del mismo género.
app.get('/api/recommendations/:genre', async (req, res) => {
    const genre = req.params.genre;
    const recommendations = await db.collection('songs')
      .find({ genre: genre })
      .limit(5) // Limitar a 5 recomendaciones
      .toArray();
    res.json(recommendations);
});


// Iniciar el servidor y conectar a la BD
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
  connectDB();

});

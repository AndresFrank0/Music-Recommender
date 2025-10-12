# Music-Recommender

Este proyecto es una aplicación web simple que ofrece recomendaciones de música, desarrollada como parte de la asignatura "Tópicos Especiales para la Gestión de Datos" de la Universidad Católica Andrés Bello (UCAB). 

El objetivo es demostrar el uso de una base de datos NoSQL (MongoDB) para gestionar datos semiestructurados y potenciar un sistema de recomendaciones personalizadas. 

# 📜 Descripción General
La aplicación presenta un catálogo de canciones. Cuando un usuario hace clic en una canción, el sistema utiliza un algoritmo de filtrado basado en contenido para sugerir otras canciones del mismo género. Este enfoque demuestra una implementación básica pero funcional de un sistema de recomendación, cumpliendo con los requisitos del proyecto. 



# ✨ Características
Catálogo de Canciones: Visualiza una lista de canciones obtenida directamente desde la base de datos NoSQL.


Recomendaciones Simples: Obtiene recomendaciones instantáneas basadas en el género de la canción seleccionada. 

Arquitectura Cliente-Servidor: El frontend (cliente) se comunica con un backend (servidor) a través de una API RESTful.


Interfaz Limpia: Una interfaz de usuario básica y fácil de usar construida con HTML, CSS y JavaScript. 

# 🛠️ Stack Tecnológico
Backend: Node.js con el framework Express.js.


Base de Datos: MongoDB (a través del servicio en la nube MongoDB Atlas). 


Frontend: HTML5, CSS3 y JavaScript (Vanilla).

Dependencias: express, mongodb, dotenv.

# 🚀 Puesta en Marcha
Sigue estos pasos para configurar y ejecutar el proyecto en tu máquina local.

1. Prerrequisitos
Asegúrate de tener instalado lo siguiente:

Node.js (que incluye npm).

Una cuenta gratuita de MongoDB Atlas.

2. Clonar el Repositorio
Bash

git clone https://github.com/tu-usuario/nombre-del-repositorio.git
cd nombre-del-repositorio
3. Instalar Dependencias
Ejecuta el siguiente comando en la raíz del proyecto para instalar los paquetes de Node.js necesarios:

Bash

npm install
4. Configurar Variables de Entorno
Crea un archivo llamado .env en la raíz del proyecto.

Dentro de este archivo, añade tu cadena de conexión de MongoDB Atlas:

MONGO_URI="mongodb+srv://<username>:<password>@cluster...mongodb.net/musicDB?retryWrites=true&w=majority"
Importante: Reemplaza <username> y <password> con tus credenciales de la base de datos.

Asegúrate de que tu dirección IP actual esté en la lista de acceso de red (Network Access) en MongoDB Atlas.

5. Poblar la Base de Datos
Necesitas cargar los datos iniciales de las canciones en tu base de datos. 

Inicia sesión en MongoDB Atlas y navega a tu clúster.

Ve a "Browse Collections".

Crea una base de datos llamada musicDB y dentro de ella, una colección llamada songs.

En la colección songs, haz clic en "Import JSON" y sube el archivo data/songs.json que se encuentra en este repositorio.

6. Ejecutar el Servidor
Una vez completados los pasos anteriores, inicia el servidor con el siguiente comando:

Bash

node server.js
Verás un mensaje en la consola confirmando que el servidor está escuchando en el puerto 3000 y que la conexión a la base de datos fue exitosa.

# 💻 Uso
Abre tu navegador web y ve a http://localhost:3000.

Verás una lista de canciones a la izquierda.

Haz clic en cualquier canción de la lista.

La sección de la derecha se actualizará para mostrarte una lista de canciones recomendadas del mismo género.

# 📡 API Endpoints
La aplicación expone los siguientes endpoints para ser consumidos por el frontend:

GET /api/songs

Descripción: Obtiene la lista completa de canciones del catálogo.

Respuesta: Un array de objetos, donde cada objeto es una canción.

GET /api/recommendations/:genre


Descripción: Obtiene una lista de hasta 5 canciones que coinciden con el género especificado en la URL. 

Parámetro: :genre (String) - El género musical a buscar.

Respuesta: Un array de objetos de canciones recomendadas.

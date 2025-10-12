document.addEventListener('DOMContentLoaded', () => {
    const songList = document.getElementById('song-list');
    const recommendationList = document.getElementById('recommendation-list');
    const recommendationIntro = document.getElementById('recommendation-intro');

    // Cargar todas las canciones al iniciar
    async function loadSongs() {
        const response = await fetch('/api/songs');
        const songs = await response.json();

        songList.innerHTML = ''; // Limpiar lista
        songs.forEach(song => {
            const li = document.createElement('li');
            li.className = 'song-item';
            li.textContent = `${song.title} - ${song.artist} (${song.genre})`;
            li.dataset.genre = song.genre; // Guardar el género en el elemento
            li.dataset.title = song.title; // Guardar el título
            
            li.addEventListener('click', () => getRecommendations(song.genre, song.title));
            songList.appendChild(li);
        });
    }

    // Obtener y mostrar recomendaciones
    async function getRecommendations(genre, originalTitle) {
        recommendationIntro.textContent = `Porque te gustó "${originalTitle}", quizás te interese:`;
        const response = await fetch(`/api/recommendations/${genre}`);
        const recommendations = await response.json();

        recommendationList.innerHTML = ''; // Limpiar
        recommendations
            .filter(rec => rec.title !== originalTitle) // No recomendar la misma canción
            .forEach(rec => {
                const li = document.createElement('li');
                li.className = 'song-item';
                li.textContent = `${rec.title} - ${rec.artist}`;
                recommendationList.appendChild(li);
            });
    }

    loadSongs();
});
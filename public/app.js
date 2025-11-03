document.addEventListener('DOMContentLoaded', () => {

    // --- 1. ESTADO GLOBAL ---
    // Mantenemos un registro de todas las canciones y listas del usuario
    let allSongs = [];
    let playlist = JSON.parse(localStorage.getItem('playlist') || '[]');
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    // --- 2. DEFINICIÓN DE FUNCIONES GLOBALES ---
    // (Todas las funciones se definen aquí para que estén disponibles en todas las páginas)

    /**
     * Carga todas las canciones desde la API a la variable global 'allSongs'.
     * Solo se ejecuta una vez.
     */
    async function fetchAllSongs() {
        if (allSongs.length > 0) return; // Si ya las tenemos, no hacer nada
        try {
            const response = await fetch('/api/songs');
            allSongs = await response.json();
        } catch (error) {
            console.error('Error fetching songs:', error);
        }
    }

    /**
     * Renderiza una lista de canciones en un elemento <ul> específico.
     * Esta es una función genérica para renderizar listas.
     */
    function renderSongList(songs, targetElement) {
        targetElement.innerHTML = '';
        
        if (!songs || songs.length === 0) {
            targetElement.innerHTML = '<li class="empty-state">No hay canciones para mostrar.</li>';
            return;
        }

        songs.forEach(song => {
            const li = document.createElement('li');
            li.className = 'song-item';
            
            // Revisa si la canción ya es favorita para marcar el botón
            const isFavorite = favorites.some(fav => fav.title === song.title);

            li.innerHTML = `
                <div class="song-content">
                    <div class="song-info">
                        <div class="song-title">${song.title}</div>
                        <div class="song-artist">${song.artist}</div>
                    </div>
                    <div class="song-genre">${song.genre}</div>
                </div>
                <button class="btn-play" aria-label="Obtener recomendaciones">▶</button>
                <button class="btn-favorite ${isFavorite ? 'active' : ''}" aria-label="Agregar a favoritos">♡</button>
            `;
            
            // Listener para RECOMENDAR (llama a la función global)
            li.querySelector('.btn-play').addEventListener('click', (e) => {
                e.stopPropagation();
                getRecommendations(song.genre, song.title);
            });
            
            // Listener para FAVORITO (llama a la función global)
            li.querySelector('.btn-favorite').addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(song, e.target);
                
                // Si estamos en la página de favoritos, re-renderizar la lista
                if (targetElement.id === 'favorites-list') {
                    renderFavoritesPage();
                }
            });
            
            targetElement.appendChild(li);
        });
    }
    
    /**
     * Obtiene y muestra recomendaciones (solo para index.html).
     */
    async function getRecommendations(genre, originalTitle) {
        const recommendationList = document.getElementById('recommendation-list');
        const recommendationIntro = document.getElementById('recommendation-intro');
        if (!recommendationList || !recommendationIntro) return;
    
        recommendationIntro.textContent = `✨ Porque te gustó "${originalTitle}", quizás te interese:`;
        recommendationList.classList.add('loading');
        
        // --- INICIO DE DEPURACIÓN ---
        console.log(`--- Iniciando recomendación para: ${originalTitle} (Género: ${genre}) ---`);
        
        try {
            const response = await fetch(`/api/recommendations/${genre}`);
            const recommendations = await response.json();
            
            console.log("Canciones recibidas del servidor:", recommendations); // <-- ¡LÍNEA CLAVE!
            
            recommendationList.classList.remove('loading');
            recommendationList.innerHTML = '';
    
            const filtered = recommendations.filter(rec => rec.title !== originalTitle);
            
            console.log(`Original: "${originalTitle}"`);
            console.log("Canciones después de filtrar:", filtered); // <-- ¡LÍNEA CLAVE!
    
            if (filtered.length === 0) {
                console.log("¡Filtro resultó en 0 canciones! Mostrando 'No hay recomendaciones'.");
                recommendationList.innerHTML = '<li class="empty-state">No hay más recomendaciones para este género</li>';
                return;
            }
            
            console.log(`Mostrando ${filtered.length} canciones filtradas.`);
            
            filtered.forEach(rec => {
                const li = document.createElement('li');
                li.className = 'song-item recommendation-item';
                // (El resto de tu código para crear el <li>...)
                li.innerHTML = `
                    <div class="song-content">
                        <div class="song-info">
                            <div class="song-title">${rec.title}</div>
                            <div class="song-artist">${rec.artist}</div>
                        </div>
                    </div>
                    <button class="btn-add-playlist" aria-label="Agregar a playlist">+</button>
                `;
                
                li.querySelector('.btn-add-playlist').addEventListener('click', (e) => {
                    e.stopPropagation();
                    addToPlaylist(rec, e.target); // Asegúrate que addToPlaylist esté definida globalmente
                });
                
                recommendationList.appendChild(li);
            });
        } catch (error) {
            console.error('Error FATAL al obtener recomendaciones:', error);
            recommendationList.classList.remove('loading');
            recommendationList.innerHTML = '<li class="error-message">Error al cargar recomendaciones</li>';
        }
    }

    /**
     * Agrega o quita una canción de favoritos y actualiza localStorage.
     */
    function toggleFavorite(song, btn) {
        const isFavorite = favorites.some(fav => fav.title === song.title);
        
        if (isFavorite) {
            favorites = favorites.filter(fav => fav.title !== song.title);
            if (btn) btn.classList.remove('active');
        } else {
            favorites.push(song);
            if (btn) btn.classList.add('active');
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    /**
     * Agrega una canción a la playlist y actualiza localStorage.
     */
    function addToPlaylist(song, btn) {
        playlist.push(song);
        localStorage.setItem('playlist', JSON.stringify(playlist));
        
        if (btn) {
            btn.textContent = '✓';
            setTimeout(() => {
                btn.textContent = '+';
            }, 1500);
        }
    }

    /**
     * Puebla un <select> con los géneros de la lista global de canciones.
     */
    function populateGenreFilter(filterElement) {
        if (filterElement) {
            // new Set() elimina duplicados, .sort() ordena alfabéticamente
            const genres = ['all', ...new Set(allSongs.map(s => s.genre).sort())];
            filterElement.innerHTML = genres.map(g => 
                `<option value="${g}">${g === 'all' ? 'Todos los géneros' : g}</option>`
            ).join('');
        }
    }
    
    /**
     * Lógica específica para renderizar la página de Favoritos.
     */
    function renderFavoritesPage() {
        const favoritesList = document.getElementById('favorites-list');
        if (!favoritesList) return;
        renderSongList(favorites, favoritesList); // Reutilizamos la función de render
        
        const noFavorites = document.getElementById('no-favorites');
        noFavorites.style.display = favorites.length === 0 ? 'block' : 'none';
    }
    
    /**
     * Lógica específica para renderizar la Playlist (en la pág. de Favoritos).
     */
    function renderPlaylistPage() {
        const playlistList = document.getElementById('playlist-list');
        if (!playlistList) return;
        
        playlistList.innerHTML = '';
        
        const noPlaylist = document.getElementById('no-playlist');
        noPlaylist.style.display = playlist.length === 0 ? 'block' : 'none';
        
        playlist.forEach((song, index) => {
            const li = document.createElement('li');
            li.className = 'song-item';
            // Usamos un HTML diferente para la playlist (con botón de quitar)
            li.innerHTML = `
                <div class="song-content">
                    <div class="song-info">
                        <div class="song-title">${song.title}</div>
                        <div class="song-artist">${song.artist}</div>
                    </div>
                </div>
                <button class="btn-remove-playlist" data-index="${index}" aria-label="Quitar de playlist">X</button>
            `;
            
            li.querySelector('.btn-remove-playlist').addEventListener('click', (e) => {
                playlist.splice(index, 1); // Quitar la canción del array
                localStorage.setItem('playlist', JSON.stringify(playlist));
                renderPlaylistPage(); // Re-renderizar la lista
            });
            
            playlistList.appendChild(li);
        });
    }

    // --- 3. LÓGICA DE INICIALIZACIÓN POR PÁGINA ---
    // (Buscamos elementos únicos de cada página para saber dónde estamos)

    const songListElement = document.getElementById('song-list');
    const searchBtnElement = document.getElementById('search-btn');
    const favoritesListElement = document.getElementById('favorites-list');
    const genreCardsElement = document.querySelector('.genre-cards');

    /**
     * PÁGINA: index.html (Catálogo y Recomendaciones)
     */
    if (songListElement && document.getElementById('recommendation-list')) {
        const searchInput = document.getElementById('search-input');
        const genreFilter = document.getElementById('genre-filter');

        // Cargar canciones al inicio
        (async () => {
            await fetchAllSongs();
            renderSongList(allSongs, songListElement);
            populateGenreFilter(genreFilter);
        })();

        // Listener para el input de búsqueda
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = allSongs.filter(song => 
                song.title.toLowerCase().includes(query) || 
                song.artist.toLowerCase().includes(query)
            );
            renderSongList(filtered, songListElement);
        });

        // Listener para el filtro de género
        genreFilter.addEventListener('change', (e) => {
            const genre = e.target.value;
            const filtered = (genre === 'all' || genre === '')
                ? allSongs 
                : allSongs.filter(song => song.genre === genre);
            renderSongList(filtered, songListElement);
        });
    }
    
    /**
     * PÁGINA: favorites.html (Favoritos y Playlist)
     */
    if (favoritesListElement) {
        const clearPlaylistBtn = document.getElementById('clear-playlist');

        renderFavoritesPage();
        renderPlaylistPage();
        
        clearPlaylistBtn.addEventListener('click', () => {
            playlist = [];
            localStorage.setItem('playlist', '[]');
            renderPlaylistPage();
        });
    }
    
    /**
     * PÁGINA: search.html (Búsqueda Avanzada)
     */
    if (searchBtnElement) {
        const advancedSearchInput = document.getElementById('advanced-search');
        const genreSearchFilter = document.getElementById('genre-search');
        const resultsList = document.getElementById('results-list');
        const resultsIntro = document.querySelector('.results-intro');

        // Cargar canciones (para poder filtrar) y poblar filtro de géneros
        (async () => {
            await fetchAllSongs();
            populateGenreFilter(genreSearchFilter);
        })();
        
        searchBtnElement.addEventListener('click', () => {
            const query = advancedSearchInput.value.toLowerCase();
            const genre = genreSearchFilter.value;
            
            let filtered = allSongs;

            if (genre && genre !== 'all' && genre !== '') {
                filtered = filtered.filter(song => song.genre === genre);
            }
            
            if (query) {
                filtered = filtered.filter(song => 
                    song.title.toLowerCase().includes(query) || 
                    song.artist.toLowerCase().includes(query)
                );
            }
            
            renderSongList(filtered, resultsList);
            if(resultsIntro) resultsIntro.style.display = 'none';
        });
    }
    
    /**
     * PÁGINA: genres.html (Explorar por Género)
     */
    if (genreCardsElement) {
        const genreSongsList = document.getElementById('genre-songs-list');
        const genreTitle = document.getElementById('genre-title');
        const noGenreSelected = document.getElementById('no-genre-selected');

        // Cargar canciones para poder filtrar
        (async () => {
            await fetchAllSongs();
        })();
        
        genreCardsElement.addEventListener('click', (e) => {
            const card = e.target.closest('.genre-card');
            if (!card) return;
            
            const genre = card.dataset.genre;
            const genreName = card.querySelector('.genre-name').textContent;
            
            genreTitle.textContent = `Canciones de ${genreName}`;
            noGenreSelected.style.display = 'none';
            
            const filtered = allSongs.filter(song => song.genre.toLowerCase() === genre.toLowerCase());
            renderSongList(filtered, genreSongsList);
        });
    }

});
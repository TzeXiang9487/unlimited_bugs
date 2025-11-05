document.addEventListener('DOMContentLoaded', () => {
  const movieGrid = document.getElementById('movie-grid');
  const modalOverlay = document.getElementById('modalOverlay');
  const closeModal = document.getElementById('closeModal');
  const selectTimeBtn = document.getElementById('selectTimeBtn');
  const dateOptions = document.getElementById('dateOptions');
  const loadingMessage = document.getElementById('movie-loading-message');

  // Modal elements
  const movieTitle = document.getElementById('modalMovieTitle');
  const movieDescription = document.getElementById('modalMovieDescription');
  const movieTrailer = document.getElementById('movieTrailer');

  let allMovies = {}; // Global variable to store fetched movies
  let selectedMovie = null;
  let selectedDate = null;

  // --- NEW: Fetch and Render Movies ---
  async function fetchAndRenderMovies() {
    loadingMessage.textContent = 'Loading movies...';
    loadingMessage.style.display = 'block';
    movieGrid.innerHTML = ''; // Clear existing content (including loading message)

    try {
      const response = await fetch('movie_api.php');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.status === 'success') {
        allMovies = data.movies; // Store globally
        renderMovieGrid(allMovies);
      } else {
        movieGrid.innerHTML = '<p class="error-message">Error loading movies: ' + (data.message || 'Unknown error') + '</p>';
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      movieGrid.innerHTML = '<p class="error-message">Network Error: Could not load movie data.</p>';
    } finally {
      if (loadingMessage) loadingMessage.style.display = 'none';
    }
  }

  function renderMovieGrid(movies) {
    movieGrid.innerHTML = '';
    const movieTitles = Object.keys(movies).sort(); // Sort titles alphabetically

    if (movieTitles.length === 0) {
      movieGrid.innerHTML = '<p>No movies are currently showing.</p>';
      return;
    }

    movieTitles.forEach(title => {
      const movieData = movies[title];
      const card = document.createElement('div');
      card.className = 'movie-card';
      card.dataset.movie = title;
      
      // Use image path from API
      card.innerHTML = `
        <div class="movie-image-container">
          <img src="${movieData.image}" alt="${title}" />
        </div>
        <h3>${title}</h3>
      `;
      movieGrid.appendChild(card);
    });
  }
  // ------------------------------------

  // Generate next 7 days for date selection (REMAINS THE SAME)
  function generateNext7Days() {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const dates = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const dayName = days[date.getDay()];
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      dates.push({
        display: `${dayName}, ${day}/${month}`,
        day: dayName,
        date: `${day}/${month}`,
        value: `${year}-${month}-${day}`
      });
    }
    
    return dates;
  }

  // Initialize date options in modal (REMAINS THE SAME)
  function initializeDateOptions() {
    const dates = generateNext7Days();
    dateOptions.innerHTML = '';
    
    dates.forEach(dateObj => {
      const dateOption = document.createElement('div');
      dateOption.className = 'date-option';
      dateOption.dataset.dateValue = dateObj.value;
      dateOption.innerHTML = `
        <div class="date-day">${dateObj.day}</div>
        <div class="date-date">${dateObj.date}</div>
      `;
      
      dateOption.addEventListener('click', () => {
        dateOptions.querySelectorAll('.date-option').forEach(option => {
          option.classList.remove('selected');
        });
        
        dateOption.classList.add('selected');
        selectedDate = {
          display: dateObj.display,
          value: dateObj.value
        };
        
        checkSelections();
      });
      
      dateOptions.appendChild(dateOption);
    });
  }

  // Open movie modal with animation (UPDATED to use allMovies)
  function openMovieModal(movieTitleText) {
    const movie = allMovies[movieTitleText];
    if (!movie) {
      console.error(`Movie not found: ${movieTitleText}`);
      return;
    }
    
    selectedMovie = {
      title: movieTitleText,
      ...movie
    };
    selectedDate = null;
    
    movieTitle.textContent = movieTitleText;
    movieDescription.textContent = movie.description;
    movieTrailer.src = movie.trailer; // Trailer link from API
    
    dateOptions.querySelectorAll('.date-option').forEach(option => {
      option.classList.remove('selected');
    });
    
    selectTimeBtn.disabled = true;
    
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // Close modal with animation (REMAINS THE SAME)
  function closeMovieModal() {
    modalOverlay.classList.remove('active');
    setTimeout(() => {
      document.body.style.overflow = 'auto';
      movieTrailer.src = ''; 
      selectedMovie = null;
      selectedDate = null;
    }, 300);
  }

  // Check if all selections are made (REMAINS THE SAME)
  function checkSelections() {
    selectTimeBtn.disabled = !(selectedMovie && selectedDate);
  }

  // Select time button - go to time selection page (REMAINS THE SAME)
  function handleSelectTime() {
    if (selectedMovie && selectedDate) {
      const selectionData = {
        movie: selectedMovie,
        date: selectedDate
      };
      
      localStorage.setItem('selectionData', JSON.stringify(selectionData));
      window.location.href = 'time-selection.html';
    }
  }

  // Movie card click event (REMAINS THE SAME)
  movieGrid.addEventListener('click', (e) => {
    const movieCard = e.target.closest('.movie-card');
    if (!movieCard) return;

    const movieTitle = movieCard.dataset.movie;
    console.log(`Clicked movie: ${movieTitle}`);
    openMovieModal(movieTitle);
  });

  // Event listeners (REMAINS THE SAME)
  closeModal.addEventListener('click', closeMovieModal);
  selectTimeBtn.addEventListener('click', handleSelectTime);
  
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeMovieModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeMovieModal();
    }
  });

  // Initial setup
  initializeDateOptions();
  fetchAndRenderMovies(); // START LOADING MOVIES
});

// Auth functions - ALL FEATURES PRESERVED
window.handleAuthAction = function() {
  const user = localStorage.getItem("loggedInUser");
  if (user) {
    localStorage.removeItem("loggedInUser");
    alert("Logged out successfully.");
    location.reload();
  } else {
    window.location.href = "login.html";
  }
}

// Admin function - ALL FEATURES PRESERVED
window.handleAdminAction = function() {
  const user = localStorage.getItem("loggedInUser");
  if (user) {
    window.location.href = "admin.html";
  } else {
    alert("Please login first to access admin panel.");
    window.location.href = "login.html";
  }
}

// Initialize auth button on load - ALL FEATURES PRESERVED
window.onload = function () {
  const authButton = document.getElementById('authButton');
  const user = localStorage.getItem("loggedInUser");

  if (user) {
    authButton.textContent = "Logout";
  } else {
    authButton.textContent = "Sign In";
  }
};
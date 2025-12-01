<!DOCTYPE html>
<html lang="en" class="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pocket Weather</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        blossom: {
                            blue: '#4A7B9D',
                            beige: '#E8DCCA',
                            white: '#F9F7F2',
                            dark: '#2C3E50',
                            accent: '#D4A373'
                        }
                    },
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        display: ['Oswald', 'sans-serif'],
                    }
                }
            }
        }
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Oswald:wght@400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-blossom-beige dark:bg-slate-900 text-blossom-dark dark:text-blossom-white transition-colors duration-300 min-h-screen font-sans">

    <!-- Main Container -->
    <div class="container mx-auto px-4 py-8 max-w-6xl">
        
        <!-- Header -->
        <header class="flex justify-between items-center mb-8">
            <div class="flex items-center gap-3">
                <i class="fa-solid fa-cloud-sun text-4xl text-blossom-blue"></i>
                <h1 class="text-3xl font-display font-bold text-blossom-blue tracking-wide">POCKET WEATHER</h1>
            </div>
            <div class="flex items-center gap-4">
                <button id="unitToggle" class="px-3 py-1 rounded-full border-2 border-blossom-blue text-blossom-blue font-bold hover:bg-blossom-blue hover:text-white transition">
                    °C
                </button>
                <button id="themeToggle" class="w-10 h-10 rounded-full bg-blossom-blue text-white flex items-center justify-center hover:bg-opacity-90 transition">
                    <i class="fa-solid fa-moon"></i>
                </button>
            </div>
        </header>

        <!-- Search & Layout Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <!-- Sidebar / Search -->
            <div class="lg:col-span-4 space-y-6">
                <!-- Search Box -->
                <div class="relative">
                    <input type="text" id="citySearch" placeholder="Search city..." 
                        class="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-2 border-transparent focus:border-blossom-blue outline-none transition shadow-sm">
                    <button id="searchBtn" class="absolute right-2 top-2 p-2 text-blossom-blue hover:text-blossom-dark">
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </button>
                    <!-- Autocomplete Dropdown -->
                    <div id="searchResults" class="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg z-50 hidden overflow-hidden">
                        <!-- Results injected here -->
                    </div>
                </div>

                <!-- Favorites -->
                <div class="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 shadow-sm">
                    <h3 class="font-display text-xl mb-4 text-blossom-blue">Favorites</h3>
                    <ul id="favoritesList" class="space-y-2">
                        <!-- Favorite items injected here -->
                        <li class="text-sm opacity-60 italic">No favorites yet.</li>
                    </ul>
                </div>
            </div>

            <!-- Main Content -->
            <div class="lg:col-span-8 space-y-8">
                
                <!-- Current Weather Card -->
                <div id="currentWeather" class="bg-blossom-blue text-blossom-white rounded-3xl p-8 shadow-lg relative overflow-hidden min-h-[300px] flex flex-col justify-between">
                    <!-- Loading State -->
                    <div class="loading absolute inset-0 flex items-center justify-center bg-blossom-blue z-10 hidden">
                        <i class="fa-solid fa-circle-notch fa-spin text-4xl"></i>
                    </div>

                    <div class="flex justify-between items-start z-0">
                        <div>
                            <h2 id="cityName" class="text-4xl font-display font-bold mb-1">Loading...</h2>
                            <p id="currentDate" class="text-lg opacity-90">--</p>
                        </div>
                        <button id="refreshBtn" class="p-2 hover:rotate-180 transition duration-500">
                            <i class="fa-solid fa-arrows-rotate text-xl"></i>
                        </button>
                    </div>

                    <div class="flex items-center gap-6 my-6">
                        <i id="weatherIcon" class="fa-solid fa-cloud text-6xl"></i>
                        <div>
                            <div class="text-7xl font-bold font-display tracking-tighter" id="currentTemp">--°</div>
                            <div class="text-xl capitalize" id="weatherDesc">--</div>
                        </div>
                    </div>

                    <div class="grid grid-cols-3 gap-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <div class="text-center">
                            <i class="fa-solid fa-wind mb-1 opacity-70"></i>
                            <p class="text-sm opacity-70">Wind</p>
                            <p class="font-bold" id="windSpeed">-- km/h</p>
                        </div>
                        <div class="text-center border-l border-white/20">
                            <i class="fa-solid fa-droplet mb-1 opacity-70"></i>
                            <p class="text-sm opacity-70">Humidity</p>
                            <p class="font-bold" id="humidity">--%</p>
                        </div>
                        <div class="text-center border-l border-white/20">
                            <i class="fa-solid fa-eye mb-1 opacity-70"></i>
                            <p class="text-sm opacity-70">Visibility</p>
                            <p class="font-bold" id="visibility">-- km</p>
                        </div>
                    </div>
                </div>

                <!-- 5 Day Forecast -->
                <div>
                    <h3 class="font-display text-2xl text-blossom-blue mb-4">5-Day Forecast</h3>
                    <div id="forecastGrid" class="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <!-- Forecast Cards injected here -->
                        <!-- Skeleton Loader -->
                        <div class="bg-white/50 h-40 rounded-xl animate-pulse"></div>
                        <div class="bg-white/50 h-40 rounded-xl animate-pulse"></div>
                        <div class="bg-white/50 h-40 rounded-xl animate-pulse"></div>
                        <div class="bg-white/50 h-40 rounded-xl animate-pulse"></div>
                        <div class="bg-white/50 h-40 rounded-xl animate-pulse"></div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <script src="assets/js/app.js"></script>
</body>
</html>

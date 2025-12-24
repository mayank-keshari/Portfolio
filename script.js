/* --- Utility Functions --- */
function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({
    behavior: "smooth"
  });
}

/* Ripple Effect */
document.addEventListener("click", function (e) {
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  ripple.style.left = e.pageX + "px";
  ripple.style.top = e.pageY + "px";
  document.body.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 600);
});

/* --- Weather App Logic --- */

// SETTINGS & CONFIGURATION
const apiKey = "YOUR_OPENWEATHERMAP_API_KEY"; // REPLACE THIS
const baseUrl = "https://api.openweathermap.org/data/2.5/weather";

// DOM Elements
const searchBox = document.querySelector("#city-input");
const searchBtn = document.querySelector("#search-btn");
const unitBtn = document.querySelector("#unit-toggle"); // The new settings button
const weatherIcon = document.querySelector(".weather-icon i");
const bgContainer = document.querySelector("#weather-effect-container");
const body = document.querySelector("body");

// State Management (Defaults)
let currentUnit = localStorage.getItem("weatherUnit") || "metric"; // Load saved unit or default to metric
let lastCity = localStorage.getItem("lastCity") || "New York"; // Load saved city

// Initialize App
window.addEventListener("load", () => {
    updateUnitButtonLabel();
    checkWeather(lastCity);
});

async function checkWeather(city) {
    if (!city) return;

    // Save the city to settings
    localStorage.setItem("lastCity", city);

    // 1. If using real API
    if (apiKey !== "YOUR_OPENWEATHERMAP_API_KEY") {
        try {
            // Dynamically add the unit (metric/imperial)
            const response = await fetch(`${baseUrl}?q=${city}&units=${currentUnit}&appid=${apiKey}`);
            
            if (response.status == 404) {
                alert("City not found!");
                return;
            }
            const data = await response.json();
            updateUI(data);
        } catch (err) {
            console.error(err);
        }
    } else {
        // 2. Mock Data (If no API Key provided)
        mockWeatherData(city);
    }
}

function updateUI(data) {
    document.querySelector(".city").innerHTML = data.name;
    
    // Round temperature
    document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "&deg;";
    
    // Update Humidity
    document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
    
    // Update Wind Speed (Adjust label based on unit)
    const speedUnit = currentUnit === "metric" ? "km/h" : "mph";
    document.querySelector(".wind").innerHTML = data.main.wind.speed + " " + speedUnit;
    
    document.querySelector("#weather-desc").innerHTML = data.weather[0].description;
    document.querySelector("#date-time").innerText = new Date().toDateString();

    // Pass temperature to theme function
    // Note: If using Fahrenheit, we need to approximate the theme logic, 
    // or convert F to C for the logic check.
    let tempInC = currentUnit === "metric" ? data.main.temp : (data.main.temp - 32) * 5/9;
    updateTheme(tempInC, data.weather[0].main.toLowerCase());
}

/* --- Settings Functions --- */

function toggleUnits() {
    // Switch state
    currentUnit = currentUnit === "metric" ? "imperial" : "metric";
    
    // Save to local storage
    localStorage.setItem("weatherUnit", currentUnit);
    
    // Update Button Text
    updateUnitButtonLabel();
    
    // Refresh weather data with new unit
    checkWeather(searchBox.value || lastCity);
}

function updateUnitButtonLabel() {
    if(unitBtn) {
        unitBtn.innerText = currentUnit === "metric" ? "Switch to °F" : "Switch to °C";
    }
}

/* --- Theme & Visuals --- */

function updateTheme(temp, condition) {
    body.className = ""; // Reset class
    bgContainer.innerHTML = ""; // Clear particles

    // Temperature Logic (based on Celsius)
    if (temp <= 5) {
        body.classList.add("cold");
        createSnow();
        weatherIcon.className = "fa-solid fa-snowflake";
    } else if (temp > 5 && temp <= 15) {
        body.classList.add("cool");
        weatherIcon.className = "fa-solid fa-cloud";
    } else if (temp > 15 && temp <= 25) {
        body.classList.add("warm");
        weatherIcon.className = "fa-solid fa-cloud-sun";
    } else {
        body.classList.add("hot");
        weatherIcon.className = "fa-solid fa-sun";
    }

    // Condition Overrides
    if (condition.includes("rain")) {
        body.className = "rainy";
        createRain();
        weatherIcon.className = "fa-solid fa-cloud-showers-heavy";
    }
}

function createSnow() {
    for (let i = 0; i < 50; i++) {
        const flake = document.createElement("div");
        flake.classList.add("snowflake");
        flake.style.left = Math.random() * 100 + "vw";
        flake.style.width = flake.style.height = Math.random() * 5 + 2 + "px";
        flake.style.animationDuration = Math.random() * 3 + 2 + "s";
        bgContainer.appendChild(flake);
    }
}

function createRain() {
    for (let i = 0; i < 100; i++) {
        const drop = document.createElement("div");
        drop.classList.add("rain-drop");
        drop.style.left = Math.random() * 100 + "vw";
        drop.style.animationDuration = Math.random() * 0.5 + 0.4 + "s";
        bgContainer.appendChild(drop);
    }
}

function mockWeatherData(city) {
    // Simulate Temp based on unit
    let temp = Math.floor(Math.random() * 30);
    if (currentUnit === "imperial") {
        temp = (temp * 9/5) + 32; // Convert random mock temp to F
    }

    const mockData = {
        name: city,
        main: { 
            temp: temp, 
            humidity: 50, 
            wind: { speed: 10 } 
        },
        weather: [{ main: "Clouds", description: "demo weather" }]
    };
    updateUI(mockData);
}

/* --- Event Listeners --- */
searchBtn.addEventListener("click", () => checkWeather(searchBox.value));

searchBox.addEventListener("keypress", (e) => { 
    if(e.key === "Enter") checkWeather(searchBox.value) 
});

// Listener for the new settings button
if(unitBtn) {
    unitBtn.addEventListener("click", toggleUnits);
}
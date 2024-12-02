const pollutionScale = [
  {
    scale: [0, 50],
    quality: "Bonne",
    src: "happy",
    background: "linear-gradient(to right, #45B649, #DCE35B)",
  },
  {
    scale: [51, 100],
    quality: "Modérée",
    src: "thinking",
    background: "linear-gradient(to right, #F3F9A7, #CAC531)",
  },
  {
    scale: [101, 150],
    quality: "Mauvaise pour la santé",
    src: "unhealthy",
    background: "linear-gradient(to right, #F16529, #E44D26)",
  },
  {
    scale: [151, 200],
    quality: "Mauvaise",
    src: "bad",
    background: "linear-gradient(to right, #ef473a, #cb2d3e)",
  },
  {
    scale: [201, 300],
    quality: "Très mauvaise",
    src: "mask",
    background: "linear-gradient(to right, #8E54E9, #4776E6)",
  },
  {
    scale: [301, 500],
    quality: "Terrible",
    src: "terrible",
    background: "linear-gradient(to right, #7a2828, #a73737)",
  },
];

const loader = document.querySelector(".loader");
const emojiLogo = document.querySelector(".emoji-logo");
const userInformation = document.querySelector(".user-information");

async function getPollutionDataByCoords(lat, lon) {
  const apiKey = "b218c5b0d5ac2e6368a544b578ad9125";
  const baseUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  try {
    const [pollutionResponse, weatherResponse] = await Promise.all([
      fetch(baseUrl),
      fetch(weatherUrl),
    ]);

    if (!pollutionResponse.ok || !weatherResponse.ok) {
      throw new Error(
        `Erreur ${pollutionResponse.status}: ${pollutionResponse.statusText}`
      );
    }

    const pollutionData = await pollutionResponse.json();
    const weatherData = await weatherResponse.json();

    const aqi = pollutionData.list[0].main.aqi * 20; // Conversion de l'échelle 1-5 à 0-100

    const sortedData = {
      city: weatherData.name || "Localisation actuelle",
      aqius: aqi,
      temperature: Math.round(weatherData.main.temp),
      humidity: weatherData.main.humidity,
      ...pollutionScale.find(
        (object) => aqi >= object.scale[0] && aqi <= object.scale[1]
      ),
    };

    populateUI(sortedData);
  } catch (error) {
    console.error("Erreur détaillée:", error);
    handleError(error);
  }
}

async function getPollutionData(city = null) {
  const apiKey = "b218c5b0d5ac2e6368a544b578ad9125";
  const geocodeUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
    city
  )},FR&limit=1&appid=${apiKey}`;

  try {
    const geocodeResponse = await fetch(geocodeUrl);
    if (!geocodeResponse.ok) {
      throw new Error(
        `Erreur ${geocodeResponse.status}: ${geocodeResponse.statusText}`
      );
    }

    const locationData = await geocodeResponse.json();
    if (!locationData.length) {
      throw new Error("Ville non trouvée");
    }

    const { lat, lon } = locationData[0];
    getPollutionDataByCoords(lat, lon);
  } catch (error) {
    console.error("Erreur détaillée:", error);
    handleError(error);
  }
}

function getLocationAndPollutionData() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
        getPollutionDataByCoords(latitude, longitude);
      },
      (error) => {
        console.error("Erreur de géolocalisation:", error);
        handleError(error);
      }
    );
  } else {
    console.error("La géolocalisation n'est pas supportée par ce navigateur.");
    handleError(new Error("Géolocalisation non supportée"));
  }
}

// Démarrer l'application avec la géolocalisation
getLocationAndPollutionData();
console.log("Le thread principal continue de s'exécuter...");

const cityName = document.querySelector(".city-name");
const pollutionInfo = document.querySelector(".pollution-info");
const pollutionValue = document.querySelector(".pollution-value");
const backgroundLayer = document.querySelector(".background-layer");
const temperature = document.querySelector(".temperature");
const humidity = document.querySelector(".humidity");

function populateUI(data) {
  emojiLogo.src = `ressources/${data.src}.svg`;
  userInformation.textContent = `Vous êtes situé à : ${data.city}`;
  cityName.textContent = data.city;
  pollutionInfo.textContent = data.quality;
  pollutionValue.textContent = data.aqius;
  temperature.textContent = `${data.temperature}°C`;
  humidity.textContent = `${data.humidity}%`;
  backgroundLayer.style.background = data.background;
  loader.classList.remove("active");
  pointerPlacement(data.aqius);
}

const locationPointer = document.querySelector(".location-pointer");

function pointerPlacement(AQIUSValue) {
  const parentWidth = locationPointer.parentElement.scrollWidth;
  locationPointer.style.transform = `translateX(${
    (AQIUSValue / 500) * parentWidth
  }px) rotate(180deg)`;
}

function handleError(error) {
  loader.classList.remove("active");

  // Réinitialiser l'interface
  cityName.textContent = "---";
  pollutionInfo.textContent = "---";
  pollutionValue.textContent = "---";
  temperature.textContent = "---";
  humidity.textContent = "---";
  emojiLogo.src = "ressources/error.svg";
  backgroundLayer.style.background =
    "linear-gradient(45deg, #4ba0d9, #6dd5fa, #fff)";

  if (error.message.includes("Failed to fetch")) {
    userInformation.textContent = "Problème de connexion réseau";
  } else if (error.message.includes("404")) {
    userInformation.textContent = "Ville non trouvée";
  } else {
    userInformation.textContent = "Une erreur est survenue";
  }
}

const searchBtn = document.querySelector("#searchBtn");
const citySearch = document.querySelector("#citySearch");

searchBtn.addEventListener("click", () => {
  const city = citySearch.value.trim();
  if (city) {
    loader.classList.add("active");
    getPollutionData(city);
  }
});

// Ajout de la recherche avec la touche Entrée
citySearch.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const city = citySearch.value.trim();
    if (city) {
      loader.classList.add("active");
      getPollutionData(city);
    }
  }
});
//

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
  const apiKey = "354192e64a8c417fbb007fb1d71bfb2f";
  const baseUrl = `https://api.weatherbit.io/v2.0/current/airquality?lat=${lat}&lon=${lon}&key=${apiKey}`;

  try {
    const response = await fetch(baseUrl);

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const responseData = await response.json();

    if (!responseData.data) {
      throw new Error("Données invalides reçues de l'API");
    }

    const data = responseData.data[0];
    const aqi = data.aqi;

    const sortedData = {
      city: responseData.city_name || "Localisation actuelle",
      aqius: aqi,
      temperature: data.temp,
      humidity: data.rh,
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
  const apiKey = "354192e64a8c417fbb007fb1d71bfb2f";
  const baseUrl = `https://api.weatherbit.io/v2.0/current/airquality?city=${encodeURIComponent(
    city
  )},FR&key=${apiKey}`;

  try {
    const response = await fetch(baseUrl);

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const responseData = await response.json();

    if (!responseData.data) {
      throw new Error("Données invalides reçues de l'API");
    }

    const data = responseData.data[0];
    const aqi = data.aqi;

    const sortedData = {
      city: responseData.city_name,
      aqius: aqi,
      temperature: data.temp,
      humidity: data.rh,
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

function getLocationAndPollutionData() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
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

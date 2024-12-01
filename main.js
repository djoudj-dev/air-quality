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

async function getPollutionData(city = null) {
  const baseUrl = "https://api.airvisual.com/v2/";
  const endpoint = city
    ? `city?city=${encodeURIComponent(
        city
      )}&country=FR&state=Ile-de-France&key=60df5a43-9827-4477-af7f-7de59da5d177`
    : `nearest_city?key=60df5a43-9827-4477-af7f-7de59da5d177`;

  try {
    const response = await fetch(baseUrl + endpoint);

    console.log("URL appelée:", baseUrl + endpoint);
    console.log("Statut de la réponse:", response.status);

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log("Données reçues:", responseData);

    if (!responseData.data) {
      throw new Error("Données invalides reçues de l'API");
    }

    const aqius = responseData.data.current.pollution.aqius;

    const sortedData = {
      city: responseData.data.city,
      aqius,
      temperature: responseData.data.current.weather.tp,
      humidity: responseData.data.current.weather.hu,
      ...pollutionScale.find(
        (object) => aqius >= object.scale[0] && aqius <= object.scale[1]
      ),
    };

    console.log("Données triées:", sortedData);
    populateUI(sortedData);
  } catch (error) {
    console.error("Erreur détaillée:", error);
    handleError(error);
  }
}
getPollutionData();
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

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
    ? `city?city=${city}&key=VOTRE_CLE`
    : "nearest_city?key=VOTRE_CLE";

  try {
    const response = await fetch(baseUrl + endpoint);
    console.log(response);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}, ${response.statusText}`);
    }

    console.log(response);

    const responseData = await response.json();
    const aqius = responseData.data.current.pollution.aqius;
    console.log(responseData);

    const sortedData = {
      city: responseData.data.city,
      aqius,
      ...pollutionScale.find(
        (object) => aqius >= object.scale[0] && aqius <= object.scale[1]
      ),
    };
    populateUI(sortedData);
  } catch (error) {
    handleError(error);
  }
}
getPollutionData();
console.log("Le thread principal continue de s'exécuter...");

const cityName = document.querySelector(".city-name");
const pollutionInfo = document.querySelector(".pollution-info");
const pollutionValue = document.querySelector(".pollution-value");
const backgroundLayer = document.querySelector(".background-layer");

function populateUI(data) {
  emojiLogo.src = `ressources/${data.src}.svg`;
  userInformation.textContent = `Vous êtes situé à : ${data.city}`;
  cityName.textContent = data.city;
  pollutionInfo.textContent = data.quality;
  pollutionValue.textContent = data.aqius;
  backgroundLayer.style.background = data.background;
  loader.classList.remove("active");
  pointerPlacement(data.aqius);
}

const locationPointer = document.querySelector(".location-pointer");

function pointerPlacement(AQIUSValue) {
  const parentWidth = locationPointer.parentElement.scrollWidth;
  console.log(parentWidth);
  console.log(AQIUSValue);
  console.log(AQIUSValue / 500);
  locationPointer.style.transform = `translateX(${
    (AQIUSValue / 500) * parentWidth
  }px) rotate(180deg)`;
}

function handleError(error) {
  const errorMessages = {
    network: "Problème de connexion réseau",
    api: "Erreur de l'API",
    location: "Impossible de trouver la ville",
    default: "Une erreur est survenue",
  };

  loader.classList.remove("active");
  userInformation.textContent = error.message || errorMessages.default;

  // Réinitialiser l'interface
  cityName.textContent = "---";
  pollutionInfo.textContent = "---";
  pollutionValue.textContent = "---";
  emojiLogo.src = "ressources/error.svg"; // Ajouter une icône d'erreur
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

const ahora = new Date();
let resultados = [];

// --- datos de ejemplo que habría que recibir aquí
const datosResultadosEjemplo = [
  {
    electrodomestico: "estufa",
    precio_hora: 0.5,
  },
  {
    electrodomestico: "nevera",
    precio_hora: 0.6,
  },
  {
    electrodomestico: "congelador",
    precio_hora: 0.7,
  },
  {
    electrodomestico: "vitroceramica",
    precio_hora: 0.3,
  },
  {
    electrodomestico: "pc",
    precio_hora: 0.4,
  },
  {
    electrodomestico: "tv",
    precio_hora: 0.8,
  },
  {
    electrodomestico: "lavadora",
    precio_hora: 0.9,
  },
  {
    electrodomestico: "microondas",
    precio_hora: 0.2,
  },
  {
    electrodomestico: "lavavajillas",
    precio_hora: 0.7,
  },
  {
    electrodomestico: "horno",
    precio_hora: 0.5,
  },
  {
    electrodomestico: "secadora",
    precio_hora: 0.6,
  },
];

// SI no han pasado más de 5min, recupera los datos de la caché, de lo contrario resultados será falso
resultados = obtenerResultadosCache();
// si resultados es falso, hay que recuperar los datos de la API
if (!resultados) {
  console.log("Solicitando obtención de datos de la API");
  // obtener datos de api
  // ----- esta línea imita la recepción de los datos recibidos de la función que los elabora
  resultados = datosResultadosEjemplo;
  // resultados = obtenerDatosAPI...
  // datos API
  console.log("Almacenando resultados en caché (Local Storage)");
  localStorage.setItem("resultados", JSON.stringify(resultados));
  localStorage.setItem("horaResultados", ahora.getTime());
}

function obtenerResultadosCache() {
  const cache = new Date(parseInt(localStorage.getItem("horaResultados")));
  console.log(
    `Hora de caché de datos: ${cache.getHours()}:${String(
      cache.getMinutes()
    ).padStart(2, "0")}`
  );
  const min5 = 1000 * 60 * 5;

  console.log(`tiempo transcurrido: ${ahora.getTime() - cache.getTime()}`);

  if (ahora.getTime() - cache.getTime() < min5) {
    console.log("Recuperando resultados de caché (localStorage)");
    return JSON.parse(localStorage.getItem("resultados"));
  } else {
    // Ya han pasado más de 5min, solicitar datos de la API
    return false;
  }
}

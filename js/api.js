"use strict";
import { datosElectrodomesticos } from "./electrodomesticos.js";
// console.log(datosElectrodomesticos);
const precioEnWatiosHora = [];

async function obtenerDatos() {
  try {
    const res = await fetch(
      "https://bypass-cors-beta.vercel.app/?url=https://api.preciodelaluz.org/v1/prices/all?zone=PCB"
    );
    const procesado = await res.json();
    // console.log(procesado);

    const resultados = [];

    for (const clave in procesado.data) {
      const hora = clave;
      const precio = procesado.data[clave].price;
      const unidades = procesado.data[clave].units;
      const media = procesado.data[clave]["is-under-avg"];
      resultados.push({ hora, precio, unidades, media });
    }
    // console.log(resultados);

    return resultados;
  } catch (error) {
    console.error("Error al coger los datos de la API", error);
    return null;
  }
}

function obtenerDatos2() {
  return obtenerDatos().then((resultados) => {
    if (resultados) {
      let costeElectrodomestico = {};
      // console.log(resultados);
      let fechaActual = new Date();
      let horaActual = fechaActual.getHours();
      // console.log(horaActual);

      function redondearDecimal(numero, decimales) {
        let factor = Math.pow(10, decimales);
        return Math.round(numero * factor) / factor;
      }

      for (let datos of resultados) {
        const horaToString = parseFloat(datos.hora);
        // console.log(horaToString);
        if (horaActual === horaToString) {
          // console.log(datos.precio);
          for (let objeto of datosElectrodomesticos) {
            const electrodomestico = objeto.electrodomestico;
            const coste = (datos.precio * objeto.consumo) / 1000000;
            precioEnWatiosHora.push({
              electrodomestico: electrodomestico,
              coste: redondearDecimal(coste, 4),
            });
          }
          // console.log(precioEnWatiosHora);
        }
      }

      console.log("precioWatiosHora:");
      console.log(precioEnWatiosHora);

      const precioMax = resultados.sort((a, b) => {
        return b.precio - a.precio;
      });
      const precioMaximo = precioMax[0];
      const precioMinimo = precioMax[precioMax.length - 1];
      // console.log(precioMaximo);
      // console.log(precioMinimo);
      // console.log(precioMax);
      console.log(
        `la hora mas cara es: ${precioMaximo.hora}, la hora mas barata es ${precioMinimo.hora}`
      );
      // const precioHoraMax = [];
      for (let i = 0; i < datosElectrodomesticos.length; i++) {
        const costeMax =
          (datosElectrodomesticos[i].consumo * precioMaximo.precio) / 1000000;

        precioEnWatiosHora[i].max = redondearDecimal(costeMax, 4);
        precioEnWatiosHora[i].hora_max = precioMaximo.hora;

        // const electrodomestico = datos.electrodomestico;
        const costeMin =
          (datosElectrodomesticos[i].consumo * precioMinimo.precio) / 1000000;

        precioEnWatiosHora[i].min = redondearDecimal(costeMin, 4);
        precioEnWatiosHora[i].hora_min = precioMinimo.hora;
      }
      console.log("Precioenwatioshora:");
      console.log(precioEnWatiosHora);

      // console.log(precioHoraMin);
    } else {
      console.log("Hubo un error al obtener los datos.");
    }
    return precioEnWatiosHora;
  });
}

// cache datos

const ahora = new Date();
// let resultados = [];

async function obtenerResultados() {
  let resultados = [];

  resultados = obtenerResultadosCache();
  // console.log(resultados);
  // si resultados es falso, hay que recuperar los datos de la API
  if (!resultados) {
    console.log("Solicitando obtención de datos de la API");
    // obtener datos de api
    // ----- esta línea imita la recepción de los datos recibidos de la función que los elabora
    resultados = await obtenerDatos2();
    // console.log(resultados);
    // datos API
    console.log("Almacenando resultados en caché (Local Storage)");
    localStorage.setItem("resultados", JSON.stringify(resultados));
    localStorage.setItem("horaResultados", ahora.getTime());
  }

  console.log("Obtención definitiva de resultados del Backend:");
  return resultados;
}

function obtenerResultadosCache() {
  const cache = new Date(parseInt(localStorage.getItem("horaResultados")));
  console.log(
    `Hora de caché de datos: ${cache.getHours()}:${String(
      cache.getMinutes()
    ).padStart(2, "0")}`
  );
  const min5 = 1000 * 60 * 5;
  const tiempo = (ahora.getTime() - cache.getTime()) / 60000;

  function redondearDecimal(numero, decimales) {
    let factor = Math.pow(10, decimales);
    return Math.round(numero * factor) / factor;
  }

  console.log(
    `tiempo transcurrido desde última actualización: ${redondearDecimal(
      tiempo,
      2
    )} minutos`
  );

  // si no han pasado más de 5min, se recuperan los datos de la caché(local storage)
  // if (ahora.getTime() - cache.getTime() < min5) {
  //   console.log("Recuperando resultados de caché (localStorage)");
  //   return JSON.parse(localStorage.getItem("resultados"));
  // } else {
  //   // Ya han pasado más de 5min, solicitar datos de la API
  //   return false;
  // }
}

let datosResultados = [];
// Obtención definitiva de resultados del Backend:
obtenerResultados().then((resultados) => {
  datosResultados = resultados;
  console.log(datosResultados);

  const pAct = document.querySelectorAll(".precioAct");
  if (datosResultados && pAct.length === datosResultados.length) {
    pAct.forEach((p, index) => {
      p.textContent = `${datosResultados[index].coste} €/wh`;
    });
  } else {
    console.log("No se pudieron actualizar los precios en los elementos <p>.");
  }

  const pMax = document.querySelectorAll(".precioMax");

  pMax.forEach((p, index) => {
    p.textContent = `${datosResultados[index].max} €/wh de ${datosResultados[index].hora_max}h`;
  });

  const pMin = document.querySelectorAll(".precioMin");
  pMin.forEach((p, index) => {
    p.textContent = `${datosResultados[index].min} €/wh de ${datosResultados[index].hora_min}h`;
  });
});

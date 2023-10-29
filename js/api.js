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
      resultados.push({ hora, precio, unidades });
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

          // const pAct = document.querySelectorAll(".precioAct");
          // console.log(pAct);
          // pAct.forEach((p, index) => {
          //   p.textContent = `${precioEnWatiosHora[index].coste} €/wh`;
          // });
          // console.log(precioEnWatiosHora);
        }
      }

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

  const pAct = document.querySelectorAll(".precioAct");
  if (resultados && pAct.length === resultados.length) {
    pAct.forEach((p, index) => {
      p.textContent = `${resultados[index].coste} €/wh`;
    });
  } else {
    console.log("No se pudieron actualizar los precios en los elementos <p>.");
  }

  console.log("Obtención definitiva de resultados del Backend:");
  return resultados;
}

// Obtención definitiva de resultados del Backend:
obtenerResultados().then((resultados) => console.log(resultados));

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

"use strict";
import { datosElectrodomesticos } from "./electrodomesticos.js";
// console.log(datosElectrodomesticos);

async function obtenerDatos() {
  try {
    const res = await fetch(
      "https://bypass-cors-beta.vercel.app/?url=https://api.preciodelaluz.org/v1/prices/all?zone=PCB"
    );
    const procesado = await res.json();
    console.log(procesado);

    const resultados = [];

    for (const clave in procesado.data) {
      const hora = clave;
      const precio = procesado.data[clave].price;
      const unidades = procesado.data[clave].units;
      resultados.push({ hora, precio, unidades });
    }
    console.log(resultados);

    return resultados;
  } catch (error) {
    console.error("Error al coger los datos de la API", error);
    return null;
  }
}

obtenerDatos().then((resultados) => {
  if (resultados) {
    // console.log(resultados);
    let fechaActual = new Date();
    let horaActual = fechaActual.getHours();
    console.log(horaActual);

    function redondearDecimal(numero, decimales) {
      let factor = Math.pow(10, decimales);
      return Math.round(numero * factor) / factor;
    }

    for (let datos of resultados) {
      const horaToString = parseFloat(datos.hora);
      // console.log(horaToString);
      if (horaActual === horaToString) {
        console.log(datos.precio);
        const precioEnWatiosHora = [];
        for (let objeto of datosElectrodomesticos) {
          const electrodomestico = objeto.electrodomestico;
          const consumo = (datos.precio * objeto.consumo) / 1000000;
          precioEnWatiosHora.push({
            electrodomestico: electrodomestico,
            consumo: redondearDecimal(consumo, 4),
          });
        }
        let estufaHTML = precioEnWatiosHora.find(
          (obj) => obj.electrodomestico === "estufa"
        );
        if (estufaHTML) {
          const pEstufa = document.querySelector(".precioAct");
          pEstufa.textContent = `${estufaHTML.consumo}KWh`;
        }
        console.log(precioEnWatiosHora);
      }
    }

    const precioMax = resultados.sort((a, b) => {
      return b.precio - a.precio;
    });
    const precioMaximo = precioMax[0];
    const precioMinimo = precioMax[precioMax.length - 1];
    console.log(precioMaximo);
    console.log(precioMinimo);
    console.log(precioMax);
  } else {
    console.log("Hubo un error al obtener los datos.");
  }
});

let x = document.querySelectorAll(".precioAct");
console.log(x);

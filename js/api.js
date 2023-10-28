'use strict'

async function obtenerDatos (){
    try{
    const res = await fetch("https://bypass-cors-beta.vercel.app/?url=https://api.preciodelaluz.org/v1/prices/all?zone=PCB");
    const procesado = await res.json();
    console.log(procesado);

    const resultados = [];

    for (const clave in procesado.data) {
        const hora = clave;
        const precio = procesado.data[clave].price;
        resultados.push({ hora, precio });
    }
    console.log(resultados);

    return resultados;

} catch (error){
    console.error("Error al coger los datos de la API", error);
    return null;
}}

obtenerDatos()
 .then(resultados => {
    if (resultados) {
      console.log(resultados);
    } else {
      console.log("Hubo un error al obtener los datos.");
    }
  });







  




   

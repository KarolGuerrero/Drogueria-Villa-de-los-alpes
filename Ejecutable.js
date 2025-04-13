const { spawn } = require("child_process");

console.log("🚀 Iniciando Droguería...");

// Iniciar el backend
const backend = spawn("npm.cmd", ["start"], {
  cwd: "C:\\Users\\crimi\\OneDrive - Universidad Sergio Arboleda\\I.E\\Semestres\\Octavo Semestre\\Dirección y Gestión\\Drogueria-Villa-de-los-alpes\\Drogueria_inventario", // Asegúrate de que esta ruta sea la correcta
  shell: true
});

backend.stdout.on("data", (data) => {
  console.log(`[Backend]: ${data}`);
});
backend.stderr.on("data", (data) => {
  console.error(`[Backend Error]: ${data}`);
});
backend.on("error", (err) => {
  console.error("❌ Error al iniciar el backend:", err);
});

// Iniciar el frontend
const frontend = spawn("npm.cmd", ["run", "serve"], {
  cwd: "C:\\Users\\crimi\\OneDrive - Universidad Sergio Arboleda\\I.E\\Semestres\\Octavo Semestre\\Dirección y Gestión\\Drogueria-Villa-de-los-alpes\\front_drogueria", // Asegúrate de que esta ruta sea la correcta
  shell: true
});

frontend.stdout.on("data", (data) => {
  console.log(`[Frontend]: ${data}`);
});
frontend.stderr.on("data", (data) => {
  console.error(`[Frontend Error]: ${data}`);
});
frontend.on("error", (err) => {
  console.error("❌ Error al iniciar el frontend:", err);
});

// Función para abrir la URL con el navegador
function openBrowser() {
  import("open").then((m) => {
    m.default("http://localhost:8080"); // Ajusta el puerto si es necesario
  }).catch((error) => {
    console.error("❌ Error al abrir el navegador:", error);
  });
}

// Abrir el navegador después de un tiempo
setTimeout(() => {
  openBrowser();
}, 2000);

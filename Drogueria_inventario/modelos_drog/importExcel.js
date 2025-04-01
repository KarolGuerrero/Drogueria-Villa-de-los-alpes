const xlsx = require('xlsx');
const multer = require('multer');
const Productos = require('./productos.js');// Importa el modelo de productos

// Configuración de Multer para cargar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * Función para procesar y guardar datos de Excel en MongoDB
 */
async function importarExcel(buffer) {
    try {
        // Leer el archivo Excel desde el buffer
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0]; // Tomar la primera hoja
        const sheet = workbook.Sheets[sheetName];

        // Convertir los datos a JSON
        const productos = xlsx.utils.sheet_to_json(sheet);

        // Validar y transformar los datos según tu modelo
        const productosProcesados = productos.map(prod => ({
            codigoBarras: prod.codigoBarras,
            descripcion: prod.descripcion,
            cantidadStock: prod.cantidadStock,
            precioCompra: prod.precioCompra,
            precioVenta: prod.precioVenta,
            fechaVencimiento: new Date(prod.fechaVencimiento)
        }));

        // Insertar en MongoDB
        await Productos.insertMany(productosProcesados);
        return { success: true, message: "Productos importados correctamente" };

    } catch (error) {
        console.error("Error al importar Excel:", error);
        return { success: false, message: "Error al procesar el archivo", error };
    }
}

module.exports = { importarExcel, upload };

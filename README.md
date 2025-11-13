Prueba Técnica – César Pausin

Este proyecto fue desarrollado como parte de una prueba técnica para demostrar mis habilidades en desarrollo web moderno utilizando Svelte 5, TypeScript y Vite.
El objetivo principal fue construir una aplicación ligera, modular y de alto rendimiento, aplicando buenas prácticas y una arquitectura escalable.

Tecnologías utilizadas

Svelte 5

TypeScript

Vite

Node.js / npm

HTML5 / CSS3

Git & GitHub

(Agrega aquí otras dependencias relevantes si las usaste, por ejemplo TailwindCSS, SvelteKit, etc.)

Instalación y ejecución local

Clonar el repositorio:

git clone https://github.com/andrespausin/prueba-tecnica-pausin.git


Entrar en el proyecto:

cd prueba-tecnica-pausin


Instalar dependencias:

npm install


Ejecutar el servidor de desarrollo:

npm run dev


Abrir en el navegador:

Normalmente: http://localhost:5173

Generar build de producción

Para compilar los archivos optimizados para producción:

npm run build


El resultado se genera en la carpeta dist/.

Si deseas probar el build localmente:

npx serve dist/

Objetivo del proyecto

Demostrar competencias en:

Desarrollo web con Svelte y TypeScript

Uso eficiente de Vite como bundler

Estructura modular, tipado estático y buenas prácticas

Creación de una interfaz reactiva, optimizada y mantenible

Funcionalidades implementadas

Componentes dinámicos y reutilizables

Comunicación entre componentes con props y stores

Gestión de estado local

Arquitectura modular y escalable

Tipado completo con TypeScript

Estilos limpios y responsivos

Estructura del proyecto
prueba-tecnica-pausin/
├── src/
│   ├── components/
│   ├── routes/
│   ├── stores/
│   ├── App.svelte
│   └── main.ts
├── public/
├── package.json
├── vite.config.ts
└── README.md

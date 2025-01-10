import { defineConfig } from 'vite';

console.log('VITE_OPENWEATHER_API_KEY:', process.env.VITE_OPENWEATHER_API_KEY);  // Debugging line

export default defineConfig({
    base: '/JustWeather/',
    define: {
        'process.env': process.env,
    },    
    build: {
        outDir: 'dist', // Specifies the output directory for the built files
    },
});

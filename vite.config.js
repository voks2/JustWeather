import { defineConfig } from 'vite';

export default defineConfig({
    base: 'JustWeather',
    define: {
        'process.env': process.env,
      },    
    build: {
    outDir: 'dist', // Specifies the output directory for the built files
    
  },
});

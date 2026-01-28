import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import express from 'express'
import * as XLSX from 'xlsx'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'excel-api',
      configureServer(server) {
        server.middlewares.use('/api/excel', (req, res) => {
          // Parse task data aus Query
          const taskData = req.query.data ? JSON.parse(decodeURIComponent(req.query.data as string)) : {};
          
          const ws_data = [];
          if (taskData?.headers) {
            ws_data.push(taskData.headers);
          }
          if (taskData?.rows) {
            taskData.rows.forEach((row: string[]) => ws_data.push(row));
          }

          const ws = XLSX.utils.aoa_to_sheet(ws_data);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Aufgabe');

          const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader('Content-Disposition', 'attachment; filename="aufgabe.xlsx"');
          res.end(Buffer.from(wbout));
        });
      },
    },
  ],
  server: { port: 5173 },
  build: { outDir: 'dist' }
})

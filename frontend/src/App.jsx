import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function App() {
  const [cantidad, setCantidad] = useState(400);
  const [numeroInicial, setNumeroInicial] = useState(1);
  const [estado, setEstado] = useState('');
  const [error, setError] = useState('');

  async function generar(event) {
    event.preventDefault();
    setError('');
    setEstado('Generando PDF...');
    try {
      const response = await fetch('/api/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad: Number(cantidad), numeroInicial: Number(numeroInicial) })
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error((data.errores || ['No se pudo generar el PDF']).join(', '));
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cartones-bingo-GA-${String(numeroInicial).padStart(4, '0')}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setEstado('PDF listo. La descarga comenzó automáticamente.');
    } catch (err) {
      setEstado('');
      setError(err.message);
    }
  }

  return <main className="page">
    <section className="card">
      <p className="eyebrow">Grupo Antonia</p>
      <h1>Bingo Cantado Solidario</h1>
      <p className="intro">Generá cartones listos para imprimir en PDF A4 horizontal, con 4 cartones por hoja.</p>
      <form onSubmit={generar}>
        <label>Cantidad<input type="number" min="1" max="500" required value={cantidad} onChange={(e) => setCantidad(e.target.value)} /></label>
        <label>Número inicial<input type="number" min="1" required value={numeroInicial} onChange={(e) => setNumeroInicial(e.target.value)} /></label>
        <button type="submit" disabled={estado === 'Generando PDF...'}>{estado === 'Generando PDF...' ? 'Generando...' : 'Generar PDF'}</button>
      </form>
      {estado && <p className="status">{estado}</p>}
      {error && <p className="error">{error}</p>}
    </section>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);

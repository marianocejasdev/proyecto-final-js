# Proyecto Final – Simulador Ecommerce (Cejas)

## Descripción
Este proyecto es un **simulador de Ecommerce de suplementos deportivos**, desarrollado como entrega final del curso de JavaScript.  
Permite recorrer un catálogo de productos, agregarlos al carrito, gestionar cantidades y simular el proceso de compra completo mediante un formulario de checkout.

## Funcionalidades principales
- **Catálogo dinámico**: productos cargados desde `products.json` con `fetch` (y *fallback* local en caso de bloqueo).  
- **Interacción en tiempo real**: búsqueda, ordenamiento y filtrado de productos.  
- **Carrito persistente**: agregar, quitar y modificar cantidades, con guardado automático en `localStorage`.  
- **Checkout**: formulario precargado con datos guardados, simulando el flujo de compra.  
- **Notificaciones modernas**:  
  - [SweetAlert2](https://sweetalert2.github.io/) para modales de confirmación y resumen de compra.  
  - [Toastify](https://apvarun.github.io/toastify-js/) para avisos rápidos de agregado/eliminado.  

## Estructura del proyecto

```bash
ProyectoFinal+Cejas/
├─ index.html # Estructura principal
├─ css/styles.css # Estilos y layout
├─ js/app.js # Lógica de negocio
├─ data/products.json# Catálogo de productos
└─ assets/ # Recursos opcionales (imágenes, íconos)
```

## Ejecución
1. **Servidor local (recomendado)**: abrir con *Live Server* de VSCode u otro servidor.  
2. **Acceso directo**: abrir `index.html` en el navegador; si `fetch` está bloqueado, se usa un catálogo embebido como respaldo.

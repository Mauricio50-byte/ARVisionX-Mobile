# Documentación: Implementación del Componente de Realidad Aumentada (AR)

## 1. Introducción

Este documento detalla la implementación del componente de **Realidad Aumentada (AR)** para la **aplicación móvil Android** del proyecto, utilizando la librería **AR.js** con el *framework* **A-Frame**.

**Contexto Inicial:** Se parte de la base de que la estructura del proyecto ya está creada y que los siguientes componentes de la aplicación ya están configurados y funcionales:
*   **Autenticación:** Login y Registro (gestionados con **Firebase Authentication**).
*   **Navegación:** Página de inicio (*Home*) con funcionalidad para la subida de archivos.
*   **Bases de Datos:**
    *   **Supabase:** Configurado para el almacenamiento de *targets* (Image Descriptors) y modelos 3D.
    *   **Firebase Realtime Database:** Configurado para guardar la información de los assets.

El objetivo principal de esta documentación es guiar la creación de un componente único y dinámico capaz de renderizar cualquier modelo 3D asociado a un *target* de imagen, cumpliendo con los requisitos del parcial.

### 1.1. Tecnologías Clave

| Tecnología | Propósito | Estado Actual |
| :--- | :--- | :--- |
| **AR.js** | Librería JavaScript para AR en la web. | Implementación del componente AR. |
| **A-Frame** | *Framework* para construir experiencias de realidad virtual y aumentada. | Utilizado por AR.js para la escena 3D. |
| **Supabase** | Almacenamiento de *targets* de imagen (NFT Descriptors) y modelos 3D. | Configurado (Targets y Models). |
| **Firebase** | Autenticación y Base de Datos en Tiempo Real (Realtime DB) para la información de los assets. | Configurado (Auth y Realtime DB). |

### 1.2. Requisitos del Componente AR

El componente de Realidad Aumentada debe ser **dinámico** y **único** [1]:
*   **Dinamismo:** Un solo componente debe ser capaz de renderizar cualquier clase de *target* (imagen).
*   **Unicidad:** No debe haber más de un componente de Realidad Aumentada en la aplicación.

---

## 2. Configuración de AR.js y A-Frame

La implementación se basa en la funcionalidad de **Image Tracking (NFT)** de AR.js, que permite usar imágenes en lugar de marcadores QR tradicionales, lo cual es esencial para un sistema dinámico.

### 2.1. Inclusión de Librerías

Asegúrate de incluir las librerías de A-Frame y AR.js (con soporte NFT) en el archivo principal de tu componente o página que contendrá la escena AR.

```html
<!-- 1. Importar A-Frame -->
<script src="https://cdn.jsdelivr.net/gh/aframevr/aframe@1c2407b26c61958baa93967b5412487cd94b290b/dist/aframe-master.min.js"></script>

<!-- 2. Importar AR.js con soporte NFT (Image Tracking) -->
<script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar-nft.js"></script>
```

### 2.2. Estructura Base de la Escena AR

La escena AR debe estar contenida en un elemento `<a-scene>` con las configuraciones necesarias para AR.js.

```html
<a-scene
  vr-mode-ui="enabled: false;"
  renderer="logarithmicDepthBuffer: true;"
  embedded
  arjs="trackingMethod: best; sourceType: webcam; debugUIEnabled: false;"
>
  <!-- El componente a-nft se agregará dinámicamente -->
  
  <!-- Cámara estática que se mueve según el dispositivo -->
  <a-entity camera></a-entity>
</a-scene>
```

---

## 3. Implementación del Componente Dinámico

El requisito de **dinamismo** se logra cargando los *targets* y los modelos 3D desde Supabase/Firebase y creando la entidad `<a-nft>` de forma programática.

### 3.1. Flujo de Datos (Supabase y Firebase)

1.  **Firebase Realtime DB:** Almacena la lista de assets disponibles, incluyendo la URL del *target* (los archivos `.fset`, `.fset3`, `.iset` subidos a Supabase Storage) y la URL del modelo 3D asociado (e.g., `.gltf` o `.glb` subido a Supabase Storage).
2.  **Supabase Storage:** Sirve como CDN para los archivos de *target* (Image Descriptors) y los modelos 3D.

### 3.2. Creación Dinámica del `<a-nft>`

El componente debe escuchar los cambios en la base de datos o recibir la información del asset seleccionado para renderizar.

**Pseudocódigo para la lógica del componente (e.g., en React/Vue/Angular o JavaScript puro):**

```javascript
// 1. Obtener la información del asset a renderizar (ejemplo)
const assetData = {
    targetUrl: 'URL_DEL_TARGET_EN_SUPABASE/mi_target', // Sin extensión (.fset, .fset3, .iset)
    modelUrl: 'URL_DEL_MODELO_3D_EN_SUPABASE/mi_modelo.gltf',
    scale: '5 5 5',
    position: '0 0 0' // Posición relativa al target
};

// 2. Crear la entidad a-nft (el ancla del target)
const nftEntity = document.createElement('a-nft');
nftEntity.setAttribute('type', 'nft');
nftEntity.setAttribute('url', assetData.targetUrl);
nftEntity.setAttribute('smooth', 'true');
nftEntity.setAttribute('smoothCount', '10');
nftEntity.setAttribute('smoothTolerance', '.01');
nftEntity.setAttribute('smoothThreshold', '5');

// 3. Crear la entidad del modelo 3D (el contenido a renderizar)
const modelEntity = document.createElement('a-entity');
modelEntity.setAttribute('gltf-model', assetData.modelUrl);
modelEntity.setAttribute('scale', assetData.scale);
modelEntity.setAttribute('position', assetData.position);

// 4. Anidar el modelo 3D al target y añadirlo a la escena
nftEntity.appendChild(modelEntity);
document.querySelector('a-scene').appendChild(nftEntity);

// *Importante*: Si se cambia de target, se debe remover el a-nft anterior antes de crear el nuevo.
```

### 3.3. Creación de Image Descriptors (Targets)

Para que AR.js funcione, cada imagen que se quiera usar como *target* debe ser procesada para generar tres archivos de "Image Descriptors" (`.fset`, `.fset3`, `.iset`).

*   **Herramienta:** Utilizar el [NFT Marker Creator (Web version)]() [2].
*   **Proceso:** Subir la imagen a la herramienta y descargar los tres archivos generados.
*   **Almacenamiento:** Subir estos tres archivos a **Supabase Storage** en una carpeta dedicada (e.g., `targets/mi_target/`). La `targetUrl` en la base de datos debe apuntar a la ubicación de estos archivos sin la extensión.

---

## 4. Mejores Prácticas y Optimización

### 4.1. Optimización de Rendimiento en AR

La Realidad Aumentada en la web puede ser intensiva en recursos. Es crucial seguir estas prácticas:

| Área | Práctica Recomendada | Razón |
| :--- | :--- | :--- |
| **Modelos 3D** | Usar formatos optimizados como **GLTF/GLB** [3]. Reducir el número de polígonos y texturas. | Menor tiempo de carga y mejor rendimiento de renderizado. |
| **Targets (NFT)** | Usar imágenes con alto DPI (300+) y buen contraste [4]. | Mejora la estabilidad y precisión del seguimiento (tracking). |
| **AR.js Smoothing** | Mantener los atributos `smooth`, `smoothCount`, `smoothTolerance` en `a-nft` activados. | Compensa la inestabilidad del seguimiento de la cámara, haciendo el modelo más estable. |
| **Carga de Assets** | Implementar una pantalla de carga (loader) mientras se descargan los modelos 3D y los descriptores de imagen. | Mejora la experiencia del usuario. AR.js ya proporciona un evento `arjs-nft-loaded` para los descriptores. |

### 4.2. **Aclaración Obligatoria: Limpieza de Código**

> **Advertencia de Desarrollo:**
>
> Como parte de las mejores prácticas de desarrollo y para garantizar un código limpio y eficiente, se establece la siguiente directriz:
>
> **Se debe borrar todo el código, estilos y assets que no se estén utilizando** en el proyecto. Esto incluye librerías no utilizadas, código comentado obsoleto, archivos CSS o JavaScript huérfanos, y modelos 3D o imágenes que no se rendericen. La limpieza es fundamental para la optimización del rendimiento y la mantenibilidad del proyecto.

### 4.3. **Mejores Prácticas en Desarrollo AR**

*   **Permisos de Cámara:** Asegurar que la aplicación solicite y maneje correctamente los permisos de la cámara al inicio.
*   **UX/UI:** Proporcionar instrucciones claras al usuario sobre cómo usar la AR (e.g., "Apunte la cámara al target de imagen").
*   **Compatibilidad:** Probar la solución en diferentes dispositivos móviles y navegadores, ya que la compatibilidad de WebAR puede variar.

---

## 5. Referencias

[1] Requisitos del Parcial - Componente de Realidad Aumentada: [https://protective-music-039.notion.site/3er-Corte-hermoso-taller-2b3a66c7640d818f93cfc7f5054fcdc0](https://protective-music-039.notion.site/3er-Corte-hermoso-taller-2b3a66c7640d818f93cfc7f5054fcdc0)
[2] NFT Marker Creator (Web version): [https://ar-js-org.github.io/studio/](https://ar-js-org.github.io/studio/)
[3] A-Frame GLTF Component Documentation: [https://aframe.io/docs/1.5.0/components/gltf-model.html](https://aframe.io/docs/1.5.0/components/gltf-model.html)
[4] AR.js Documentation - Choose good images: [https://ar-js-org.github.io/AR.js-Docs/image-tracking/](https://ar-js-org.github.io/AR.js-Docs/image-tracking/)

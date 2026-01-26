# 🏢 Sistema de Control de Accesos para Condominios

Plataforma web completa para gestionar el acceso de visitantes en condominios, con tres roles diferenciados: Administrador, Vigilante y Residente.

## 🚀 Stack Tecnológico

- **Framework**: Next.js 14+ (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Componentes UI**: Componentes personalizados + Lucide Icons
- **Estado Global**: Zustand con persistencia
- **Validación**: React Hook Form + Zod (preparado)

## 📋 Características Principales

### 👨‍💼 Administrador
- Dashboard con métricas en tiempo real
- Gestión completa de usuarios (Vigilantes y Residentes)
- Vista de visitantes activos en el condominio
- Historial completo de registros de acceso
- Estadísticas y reportes

### 🛡️ Vigilante
- Interfaz optimizada para tablet/móvil con botones grandes
- Registro rápido de entradas y salidas
- Búsqueda de visitantes por placa
- Lista en tiempo real de visitantes activos
- Sistema de búsqueda integrado

### 🏠 Residente
- Generador de códigos de acceso temporales
- Configuración de validez de códigos (2h a 1 semana)
- Historial completo de sus visitas
- Estadísticas personales de visitas
- Vista de códigos activos

## 🔧 Instalación y Uso

### 1. Instalar Dependencias

```bash
cd condominios-app
npm install
```

### 2. Ejecutar el Proyecto

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:3000`

## 🔐 Usuarios de Prueba

### Administrador
- **Email**: `admin@condominio.com`
- **Password**: `admin123`

### Vigilante
- **Email**: `vigilante@condominio.com`
- **Password**: `vigilante123`

### Residente
- **Email**: `residente@condominio.com`
- **Password**: `residente123`

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── admin/             # Páginas del Administrador
│   ├── vigilante/         # Páginas del Vigilante
│   ├── residente/         # Páginas del Residente
│   └── page.tsx           # Página de Login
├── components/
│   ├── layouts/           # Componentes de layout (Sidebar)
│   └── ui/                # Componentes UI reutilizables
├── store/
│   └── useStore.ts        # Estado global con Zustand
├── lib/
│   ├── utils.ts           # Utilidades generales
│   └── mockData.ts        # Datos simulados iniciales
└── types/
    └── index.ts           # Definiciones de tipos TypeScript
```

## 💾 Persistencia de Datos

Los datos se persisten automáticamente en el **localStorage** del navegador mediante Zustand. Esto incluye:

- Usuarios del sistema
- Registros de entrada/salida
- Códigos de acceso generados
- Sesión del usuario actual

**Nota**: Al ser datos en memoria/localStorage, se perderán al limpiar el navegador. Para producción, se recomienda integrar con un backend real.

## 🎨 Características de UX/UI

### Diseño Responsivo
- Adaptado para escritorio, tablet y móvil
- Sidebar colapsable en móvil
- Botones grandes para vigilantes (uso táctil)

### Experiencia Optimizada
- Feedback visual inmediato
- Mensajes de confirmación
- Búsqueda rápida de visitantes
- Formateo automático de placas
- Códigos de acceso copiables con un click

### Accesibilidad
- Colores con buen contraste
- Tamaños de texto legibles
- Iconos descriptivos
- Estados hover y focus claros

## 🔄 Flujo de Trabajo Típico

### 1. Residente genera código
1. Login como residente
2. Ir a "Generar Código"
3. Ingresar nombre del visitante
4. Seleccionar validez
5. Copiar y compartir código

### 2. Vigilante registra entrada
1. Login como vigilante
2. Seleccionar "Registrar Entrada"
3. Ingresar placa del vehículo
4. Ingresar nombre del visitante
5. Seleccionar residente (opcional)
6. Confirmar registro

### 3. Vigilante registra salida
1. Seleccionar "Registrar Salida"
2. Ingresar placa del vehículo
3. (Opcional) Buscar visitante activo
4. Confirmar salida

### 4. Admin monitorea
1. Login como admin
2. Ver dashboard con métricas
3. Revisar visitantes activos
4. Gestionar usuarios del sistema

## 🛠️ Próximas Mejoras Sugeridas

- [ ] Integración con backend (API REST o GraphQL)
- [ ] Validación de códigos de acceso en el registro
- [ ] Notificaciones push para residentes
- [ ] Exportación de reportes (PDF/Excel)
- [ ] Sistema de cámaras/fotos
- [ ] Integración con lectores de placas (OCR)
- [ ] App móvil nativa (React Native)
- [ ] Sistema de multas/penalizaciones
- [ ] Chat entre residentes y vigilancia

## 📝 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter

## 📄 Licencia

Proyecto de demostración para control de accesos en condominios.

---

**Desarrollado con ❤️ usando Next.js 14 y TypeScript**

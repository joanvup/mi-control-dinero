# Mi Control de Dinero

"Mi Control de Dinero" es una aplicación web full-stack de finanzas personales que permite a los usuarios gestionar sus fuentes de dinero, registrar ingresos y gastos, y visualizar su situación financiera a través de un dashboard interactivo.

## Características

-   **Dashboard Principal**: Vista general con saldo total, ingresos, gastos, y gráficos.
-   **Gestión de Fuentes**: Añade y visualiza múltiples fuentes de dinero (bancos, efectivo, etc.).
-   **Registro de Transacciones**: Registra ingresos y gastos de forma sencilla a través de modales.
-   **Transferencias**: Realiza transferencias de dinero entre tus fuentes.
-   **Visualización de Datos**: Gráficos interactivos para ingresos vs. gastos y distribución de gastos por categoría.
-   **API RESTful**: Backend en Flask que sirve datos en formato JSON.
-   **Frontend Moderno**: Interfaz de una sola página (SPA) construida con JavaScript puro y TailwindCSS.
-   **Soporte Dual de Base de Datos**: Funciona con SQLite por defecto y está preparado para MySQL.

## Especificaciones Técnicas

-   **Backend**: Python 3, Flask, Flask-SQLAlchemy, Flask-Cors.
-   **Frontend**: HTML5, TailwindCSS, JavaScript (ES6+), Chart.js.
-   **Base de Datos**: SQLAlchemy ORM (compatible con SQLite y MySQL).

## Configuración y Ejecución

Sigue estos pasos para poner en marcha la aplicación en tu entorno local.

### Prerrequisitos

-   Python 3.8 o superior.
-   `pip` (manejador de paquetes de Python).

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd mi-control-dinero
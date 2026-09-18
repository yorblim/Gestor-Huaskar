# Guía de Contribución a Gestor Huaskar 🤝

¡Gracias por tu interés en contribuir a Gestor Huaskar! Para mantener un código limpio, ordenado y de alta calidad, te pedimos seguir las siguientes pautas.

---

## 🌿 Flujo de Trabajo con Ramas (Git Flow)

1. **Haz un fork** del repositorio o clónalo localmente.
2. Crea una rama descriptiva para tu cambio:
   - Nuevas funcionalidades: `feat/nombre-de-la-funcionalidad`
   - Corrección de errores: `fix/descripcion-del-bug`
   - Refactorizaciones: `refactor/area-a-mejorar`
   - Documentación: `docs/tema-documentado`
3. Asegúrate de basar tu rama en la última versión de `main`.

---

## 📝 Convención de Mensajes de Commit (Conventional Commits)

Utilizamos el estándar [Conventional Commits](https://www.conventionalcommits.org/):

```text
<tipo>(<alcance opcional>): <descripción concisa en imperativo>
```

### Tipos admitidos:
- **`feat`**: Nueva funcionalidad para el usuario.
- **`fix`**: Corrección de un bug.
- **`docs`**: Cambios únicamente en documentación.
- **`style`**: Formato, espacios en blanco, comas faltantes (sin cambios en lógica).
- **`refactor`**: Reestructuración de código sin alterar comportamiento externo.
- **`test`**: Agregar o corregir pruebas existentes.
- **`chore`**: Tareas de mantenimiento, dependencias o tooling.

### Ejemplos:
```text
feat(pos): agregar soporte para descuento por porcentaje en ventas
fix(products): habilitar búsqueda insensible a mayúsculas en postgresql
test(inventory): agregar pruebas de movimientos de lote
```

---

## 🧪 Verificación Antes de Enviar un Pull Request

Antes de enviar tu Pull Request, asegúrate de que todos los siguientes comandos se ejecuten sin errores:

```bash
# 1. Compilación de TypeScript en Backend
npm run build

# 2. Ejecución de toda la suite de pruebas del Backend
npm run test:run

# 3. Linter del Frontend (debe pasar con 0 errores y 0 warnings)
cd frontend
npm run lint

# 4. Compilación de producción del Frontend
npm run build
cd ..
```

---

## 📬 Envío del Pull Request

1. Sube tu rama a tu repositorio remoto:
   ```bash
   git push origin feat/mi-funcionalidad
   ```
2. Abre un **Pull Request** hacia la rama `main`.
3. Completa la plantilla de Pull Request detallando qué cambios hiciste, por qué y cómo los probaste.
4. Espera a que la suite de CI de GitHub Actions (`CI/CD`) pase todas las validaciones en verde.

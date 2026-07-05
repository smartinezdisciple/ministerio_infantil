# Plan: Migración Checkout_Por

## Problema
El controlador `asistenciaControlador.ts` actualiza la columna `Checkout_Por` en la tabla `Asistencia_Ninos`, pero esta columna no existe en la base de datos, causando un error 500 al retirar niños.

## Solución (Opción C)

### 1. Crear archivo de migración
Crear `backend/migracion_v5_10_checkout_por.sql` con:

```sql
ALTER TABLE Asistencia_Ninos
ADD COLUMN IF NOT EXISTS Checkout_Por INT REFERENCES Personal_Sistema(ID_Persona);

CREATE INDEX IF NOT EXISTS idx_asistencia_checkout_por
    ON Asistencia_Ninos (Checkout_Por);

COMMENT ON COLUMN Asistencia_Ninos.Checkout_Por IS
    'ID del staff que procesó el checkout (Personal_Sistema). Se llena automáticamente desde el JWT.';
```

### 2. Ejecutar migración en Railway
Conectarse a la BD de Railway y ejecutar el SQL anterior:

```bash
# Opción A: con Railway CLI
railway connect

# Opción B: con psql directo
psql "$DATABASE_URL" -f migracion_v5_10_checkout_por.sql
```

### 3. Verificar
Probar checkout en la app. Debería funcionar sin error 500.

### 4. Actualizar schema_neon_completo.sql (opcional)
Agregar la columna al schema de referencia local.

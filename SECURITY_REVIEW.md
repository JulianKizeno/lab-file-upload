# Revisión de seguridad — 2026-10-24

Repositorio: `JulianKizeno/lab-file-upload`. Rama: `security/review-2026-10-24`.

## Correcciones

- CWE-321: replace the public session signing secret and harden cookies
- CWE-943: reject object/array credentials and bound bcrypt inputs
- CWE-532: remove password-hash logging and stop after unknown users
- Update vulnerable dependencies: mongoose ^6.13.12, passport ^0.7.0
- Remove committed environment values and add a value-free template; rotate any previously exposed credentials/signing secrets (history retained)

## Auditoría npm después de los cambios

| Proyecto | Críticas | Altas | Moderadas | Bajas | Total |
|---|---:|---:|---:|---:|---:|
| `starter-code` | 0 | 0 | 0 | 0 | 0 |

## Verificación

- Pruebas de regresión de seguridad (`starter-code/security-tests`): correctas.
- Inicialización de servidor (`starter-code`) con APIs reales de las dependencias y conexión de base de datos aislada: correcta.

## Límites y configuración

- La auditoría cubre el árbol npm resuelto, no demuestra ausencia de vulnerabilidades de lógica, infraestructura o servicios externos. No se ha desplegado ni fusionado este cambio.
- Configurar un SESSION_SECRET nuevo de al menos 32 caracteres. En producción las cookies requieren HTTPS; revisar la configuración del proxy de confianza para la topología real.
- Los archivos .env se sustituyen por ejemplos sin valores. Rotar cualquier credencial o secreto publicado previamente; eliminarlo de esta rama no lo borra del historial.

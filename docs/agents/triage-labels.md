# Triage Labels

Las skills hablan en términos de roles canónicos de triage. Este archivo mapea esos roles a los
strings que usa este repo en su tracker local markdown.

## Roles de estado

Se registran en la línea `Status:` de cada issue.

| Rol en mattpocock/skills | Valor de `Status:`  | Significado                                |
| ------------------------ | ------------------- | ------------------------------------------ |
| `needs-triage`           | `needs-triage`      | Falta que el maintainer lo evalúe          |
| `needs-info`             | `needs-info`        | Esperando información del reporter         |
| `ready-for-agent`        | `ready-for-agent`   | Completamente especificado, listo para un agente AFK |
| `ready-for-human`        | `ready-for-human`   | Requiere implementación humana             |
| `wontfix`                | `wontfix`           | No se va a accionar                        |

## Roles de categoría

Se registran en la línea `Type:` de cada issue.

| Rol en mattpocock/skills | Valor de `Type:` | Significado                     |
| ------------------------ | ---------------- | ------------------------------- |
| `bug`                    | `bug`            | Algo está roto                  |
| `enhancement`            | `enhancement`    | Feature nueva o mejora          |

Todo issue triado lleva exactamente un rol de categoría y uno de estado. Si los estados se
contradicen, señalalo y preguntá al maintainer antes de hacer cualquier otra cosa.

## Transiciones

Un issue sin estado pasa primero a `needs-triage`. Desde ahí va a `needs-info`, `ready-for-agent`,
`ready-for-human` o `wontfix`. `needs-info` vuelve a `needs-triage` cuando el reporter responde.
El maintainer puede sobrescribir en cualquier momento; si una transición parece rara, preguntá
antes de aplicarla.

# Domain Docs

Cómo las skills de ingeniería consumen la documentación de dominio de este repo al explorar el
código.

## Antes de explorar, leé esto

- **`GLOSSARY.md`** en la raíz del repo.
- **`docs/adr/`**: los ADRs que toquen el área en la que vas a trabajar.

Si alguno de estos archivos no existe, seguí sin mencionarlo. No marques su ausencia ni sugieras
crearlos de entrada. La skill `domain-modeling` los crea de forma perezosa cuando un término o una
decisión realmente se resuelve.

## Estructura

Repo single-context: un solo glosario y un solo directorio de ADRs, ambos compartidos por
`webapp/` y `backend/`.

```
/
├── GLOSSARY.md
├── docs/
│   ├── adr/            # 0001-slug.md, 0002-slug.md, secuencial
│   ├── agents/         # configuración de las skills
│   ├── planning/       # specs, issues, roadmap, requisitos
│   ├── technical/      # arquitectura, UX, previews
│   └── others/         # material de referencia
├── backend/
└── webapp/
```

Los ADRs usan numeración secuencial `NNNN-slug.md`: el próximo toma el número más alto existente
más uno. No hay ADRs por contexto; todas las decisiones viven en `docs/adr/`.

## Usá el vocabulario del glosario

Cuando tu output nombre un concepto de dominio (en un título de issue, una propuesta de refactor,
una hipótesis, un nombre de test), usá el término tal como está definido en `GLOSSARY.md`. No
derives a sinónimos que el glosario marque en `_Avoid_`.

Si el concepto que necesitás no está en el glosario, eso es una señal: o estás inventando lenguaje
que el proyecto no usa, y conviene reconsiderar, o hay un hueco real, y conviene anotarlo para
`domain-modeling`.

## Marcá conflictos con ADRs

Si tu output contradice un ADR existente, expontalo explícitamente en lugar de pisarlo en silencio:

> _Contradice ADR-0001 (modelo de serie y calendario derivado), pero vale reabrirlo porque…_

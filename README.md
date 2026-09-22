# Lenzooka2

A local-first circuit atlas and bench log for the 1979 Fujinon P14×16.5 broadcast lens. Built independently in **Lenzooka2**; it does not use or modify Lenzooka1.

```sh
npm ci
npm run dev -- --port 5174
```

Open http://127.0.0.1:5174 for the editable bench. The GitHub Pages build is a read-only exhibit at https://wareabouts.github.io/Lenzooka2/.

- `npm test` — net derivation, schema and exporter tests.
- `npm run build` — TypeScript check and static production build.
- `npm run export` — regenerate the register and WireViz connector pairs.

See [the field guide](docs/USAGE.md). The original input package remains in `lenzooka-prompt/`. The original historical register is preserved in `docs/register-original.md`.

# Calculation boundaries

The calculation tools implement hydraulic relationships. They do not look up commercial DN catalogues or normative minima.

- Pipe diameter uses `Q = V · π · D² / 4`. The result is an internal diameter in millimetres, not a nominated DN.
- Flow velocity assumes a full circular section.
- Hazen–Williams uses `hf = 10.67 · L · Q^1.852 / (C^1.852 · D^4.871)` with Q in m³/s, D in m, L in m and hf in m. C is mandatory.
- Manning uses `V = (1/n) · R^(2/3) · S^(1/2)` with `R = D/4` for a full circular pipe. Partial flow is not calculated. n and slope are mandatory.

Do not substitute a remembered roughness, velocity or slope when the user left it out.

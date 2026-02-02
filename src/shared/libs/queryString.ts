export function buildQuery(params: Record<string, any>) {
  const sp = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value == null) return;

    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v == null || v === '') return;
        sp.append(key, String(v));
      });
      return;
    }

    if (value === '') return;
    sp.set(key, String(value));
  });

  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

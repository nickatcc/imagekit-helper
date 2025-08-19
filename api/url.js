import ImageKit from "imagekit";

const ik = new ImageKit({
  urlEndpoint: process.env.IK_URL_ENDPOINT,
  publicKey: process.env.IK_PUBLIC_KEY,
  privateKey: process.env.IK_PRIVATE_KEY,
});

// helper: normalize ?layers=... or body.layers to an array
const toArray = (v) => (Array.isArray(v) ? v.filter(Boolean) : v ? [v] : []);

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      // Example test in browser:
      // /api/url?path=/image%20(7).png&layers=w-400&layers=h-300
      const { path, src, layers, signed, expireSeconds } = req.query || {};
      if (!path && !src) {
        return res.status(200).json({ ok: true, hint: "Add ?path=/your-image.jpg (and optional &layers=w-400)" });
      }
      const layerArray = toArray(layers);
      const transformation = layerArray.map((raw) => ({ raw }));
      const url = ik.url({
        ...(path ? { path } : { src }),
        ...(transformation.length ? { transformation } : {}),
        ...(signed ? { signed: true, expireSeconds: Number(expireSeconds) || 3600 } : {}),
      });
      return res.status(200).json({ ok: true, url });
    }

    // POST JSON:
    // { "path":"/image (7).png", "layers":["w-400","e-grayscale"], "signed":true, "expireSeconds":3600 }
    let { path, src, layers, signed, expireSeconds } = req.body || {};
    const layerArray = toArray(layers);
    const transformation = layerArray.map((raw) => ({ raw }));
    const url = ik.url({
      ...(path ? { path } : { src }),
      ...(transformation.length ? { transformation } : {}),
      ...(signed ? { signed: true, expireSeconds: Number(expireSeconds) || 3600 } : {}),
    });
    return res.status(200).json({ url });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
}

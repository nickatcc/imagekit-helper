import ImageKit from "imagekit";

const ik = new ImageKit({
  urlEndpoint: process.env.IK_URL_ENDPOINT,
  publicKey: process.env.IK_PUBLIC_KEY,
  privateKey: process.env.IK_PRIVATE_KEY,
});

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      // Example test in browser: /api/url?path=/image%20(7).png&layers=w-400
      const { path, src, layers = [] } = req.query || {};
      let arrLayers = Array.isArray(layers) ? layers : layers ? [layers] : [];
      const transformation = arrLayers.map(raw => ({ raw }));

      const url = ik.url({
        ...(path ? { path } : { src }),
        ...(transformation.length ? { transformation } : {}),
        transformationPosition: "query",   // ✅ force ?tr=... style
      });

      return res.status(200).json({ ok: true, url });
    }

    // POST { path OR src, layers:[ "raw,..." ], signed?, expireSeconds? }
    let { path, src, layers = [], signed, expireSeconds } = req.body || {};
    if (!Array.isArray(layers)) layers = [layers];
    const transformation = layers.map(raw => ({ raw }));

    const url = ik.url({
      ...(path ? { path } : { src }),
      ...(transformation.length ? { transformation } : {}),
      transformationPosition: "query",   // ✅ force ?tr=... style
      ...(signed ? { signed: true, expireSeconds: Number(expireSeconds) || 3600 } : {}),
    });

    return res.status(200).json({ ok: true, url });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
}

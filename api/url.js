import ImageKit from "imagekit";

const ik = new ImageKit({
  urlEndpoint: process.env.IK_URL_ENDPOINT,
  publicKey: process.env.IK_PUBLIC_KEY,
  privateKey: process.env.IK_PRIVATE_KEY,
});

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      // Test in browser: /api/url?path=/image%20(7).png
      const { path, src } = req.query || {};
      if (!path && !src) return res.status(200).json({ ok: true, hint: "Add ?path=/your-image.jpg" });
      const url = ik.url({ ...(path ? { path } : { src }) });
      return res.status(200).json({ ok: true, url });
    }

    // POST { path OR src, layers:[ "raw,..." ], signed?, expireSeconds? }
    const { path, src, layers = [], signed, expireSeconds } = req.body || {};
    const transformation = layers.map(raw => ({ raw }));
    const url = ik.url({
      ...(path ? { path } : { src }),
      transformation,
      ...(signed ? { signed: true, expireSeconds: expireSeconds || 3600 } : {}),
    });
    return res.status(200).json({ url });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
}

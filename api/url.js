import ImageKit from "imagekit";

const ik = new ImageKit({
  urlEndpoint: process.env.IK_URL_ENDPOINT,
  publicKey: process.env.IK_PUBLIC_KEY,
  privateKey: process.env.IK_PRIVATE_KEY,
});

export default async function handler(req, res) {
  const { path, layers = [] } = req.body || {};

  const transformation = layers.map(raw => ({ raw }));

  const url = ik.url({
    path,
    transformation,
  });

  res.status(200).json({ url });
}

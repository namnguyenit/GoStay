import 'dotenv/config';
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  { sub: "nhannt", userId: "62c84ae2-ef67-459f-b6af-ef31cd84d799", authorities: ["USER"] },
  "8b6d8b31a89c9225721666e6c86720d2d3ad7c1a82f34934fb58bfaef2c39e0d1bfa98e3b0e1189c4d9a60e0a138c2901c5188f4e24022a106f4776b29f0ef44",
  { expiresIn: '1h' }
);

fetch("http://localhost:5555/api/v1/carts", {
  headers: { "Authorization": "Bearer " + token }
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(err => console.error(err));

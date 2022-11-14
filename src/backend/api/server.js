import express from 'express';
import multer from 'multer';
import cors from 'cors';
import * as IPFS from 'ipfs-core';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const client = await IPFS.create();
const app = express();
app.use(cors());
const port = 3001;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/upload-metadata-to-ipfs', async (req, res) => {
  const result = await client.add(JSON.stringify(req.body));
  res.send({path: result.path, data: req.body});
});

app.post('/upload-to-ipfs', upload.single('file'), async (req, res) => {
  const file = {
    mimetype: req.file.mimetype,
    data: req.file.buffer.toString('base64'),
    originalname: req.file.originalname,
    size: req.file.size
  };
  const result = await client.add(JSON.stringify(file));
  res.json({
    path: result.path,
    data: file
  });
});

app.get('/get-from-ipfs', async (req, res) => {
  const stream = client.cat(req.query.cid);
  const decoder = new TextDecoder()
  let data = ''

  for await (const chunk of stream) {
    // chunks of data are returned as a Uint8Array, convert it back to a string
    data += decoder.decode(chunk, { stream: true })
  }

  res.json({data: JSON.parse(data)});
});

app.get('/get-user-slug', async (req, res) => {
  const id = req.query.id;
  // TODO :: Fetch user slug from DB using id. Return slug, if user has a slug, or return id (public key).
  res.send({ id, slug: 'test'});
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import * as IPFS from 'ipfs-core'; // eslint-disable-line

const storage = multer.memoryStorage();
const upload = multer({ storage });

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
  res.send({ path: result.path, data: req.body });
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
  const decoder = new TextDecoder();
  let data = '';

  for await (const chunk of stream) { // eslint-disable-line
    // TODO @Enes: Handle this eslint error later
    // chunks of data are returned as a Uint8Array, convert it back to a string
    data += decoder.decode(chunk, { stream: true });
  }

  res.json({ data: JSON.parse(data) });
});

app.get('/user/slug', async (req, res) => {
  const { id } = req.query;
  // TODO :: Fetch user slug from DB using id. Return slug, if user has a slug, or return id (public key).
  res.send({ id, slug: 'test' });
});

app.get('/user/id', async (req, res) => {
  const { slug } = req.query;
  // TODO :: Fetch user id from DB using slug. Return id, if that slug belongs to any user, or return 404.
  res.send({ slug, id: '0xabc' });
});

app.get('/user/profile-photo', async (req, res) => {
  const { id } = req.query;
  // TODO :: Fetch user profile photo from DB using id. Return image URL, if exists, else, return a default image.
  res.send({ id, url: 'https://i.etsystatic.com/5805234/r/il/1a38f2/825515703/il_570xN.825515703_19nf.jpg' });
});

app.get('/user/cover-photo', async (req, res) => {
  const { id } = req.query;
  // TODO :: Fetch user cover photo from DB using id. Return image URL, if exists, else, return a default image.
  res.send({ id, url: 'https://media.glassdoor.com/l/1d/0c/e0/81/the-office.jpg' });
});

app.get('/user/name', async (req, res) => {
  const { id } = req.query;
  // TODO :: Fetch user name from DB using id. (it is like a real name, not like credential). Return 404 if the user does not exist.
  res.send({ id, name: 'Michael Scott' });
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

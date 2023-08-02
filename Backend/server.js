const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(bodyParser.json());

mongoose
  .connect('mongodb+srv://cweiser44:bacon@random.w1adibs.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB...'))
  .catch((err) => console.error('Could not connect to MongoDB...', err));

const sightingSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  location: {
    type: String,
    required: true,
    enum: ['Cowell', 'Porter', 'Kresge', 'Stevenson', 'Crown', 'Merrill', 'Oakes', 'Rachel Carson', 'College 9', 'College 10', 'Graduate Student Housing', 'Family Student Housing', 'Other'],
  },
  ip: { type: String, required: true }, // Add IP address field to the Sighting model
});

const Sighting = mongoose.model('Sighting', sightingSchema);

app.get('/api/sightings', async (req, res) => {
    try{
  const sightings = await Sighting.find();
  res.send(sightings);
    } catch(e){
        res.status(500).send("Something went wrong.")
    }
});

const createSightingLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 1, // limit each IP to 1 request per windowMs
  message: 'Too many sightings created from this IP, please try again after 10 minutes',
});

app.post('/api/sightings', createSightingLimiter, async (req, res) => {
    try{
  let sighting = new Sighting({
    timestamp: new Date(),
    location: req.body.location,
    ip: req.ip, // Store client's IP address
  });

  sighting = await sighting.save();

  res.send(sighting);
} catch(e){
    res.status(400).send("Invalid.")
}
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

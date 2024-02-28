const express = require('express');
const cors = require('cors')
const app = express();
const mongoose = require('mongoose');
const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');
const path = require('path');
const { log } = require('console');

mongoose.connect('mongodb+srv://Sylvain:6Mv8xLeGEJXmyCQIAIzl@cluster.nrfdmgy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));


app.use(cors())

app.use(express.json());

app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));


module.exports = app;
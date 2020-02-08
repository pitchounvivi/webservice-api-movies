const express = require('express');
const app = express(); //initilisation de express

const config = require('./config');
const secret = config.Secret;
const PORT = config.Port;

const bodyParser = require('body-parser');

const multer = require('multer');
const upload = multer();

const expressJwt = require('express-jwt');

const mongoose = require('mongoose');
const db = mongoose.connection;





// les requires servent pour la partie backend

const indexController = require('./controllers/indexController');
const movieController = require('./controllers/movieController');
const movieSearchController = require('./controllers/movieSearchController');
const loginController = require('./controllers/loginController');
const userOnlyController = require('./controllers/userOnlyController');




// pour se connecter à la base de donnée
mongoose.connect(config.Uri, { useNewUrlParser: true }); // le lien est celui fourni par mongodb (en passant par connect application)
// passage des paramètres suivants :
// a la place du password j'ai mis mon mot de passe (root)
// le serveur et sa base de donnée : de @ à .net
// paramètres : remplcer test par le nom de ma base de donnée et laisser les autres paramètres


// on écoute l'erreur et la connexion et on transmet un message en fonction du retour
db.on('error', console.error.bind(console, 'Erreur de connexion : aucun accès à la DB')); // bind veut dire lier, donc dans la console backend/terminal on lie l'erreur de la console mongoDb

// on le fait comme ça pour pouvoir y accéder tout de suite dès le lancement de l'appli
// la méthode de connexion
db.once('open', () => {
    console.log('Connection Réussie');
})





// const titre = 'Terminator';
// const year = 1984;
// const myMovie = new Movie({ title: titre, year: year });
// myMovie.save((err, Movie) => { // la fonction est un callback erreur qui oblige à gérer en premier l'erreur
//     if (err) {
//         console.log(err);
//     } else {
//         console.log('Film sauvegardé', Movie);
//     }
// });


//let films = [];

//pour déclarer un template sinon on utilise use à la place de set
app.set('views', './views'); //dans le dossier views il y aura toutes les vues
app.set('view engine', 'ejs'); // on veut que ejs utilise le template view engine

//pour déclarer globalement un maddleware
app.use('/public', express.static('public')); // le premier /public est un mot clé

app.use('/img', express.static('img'));

//pour parser du html
app.use(bodyParser.urlencoded({ extended: false }));


// cette ligne veut dire que on a besoin du secret pour le chemin de toutes les pages listées
// cela peut permettre de limiter l'accès à certaines pages
app.use(expressJwt({ secret: secret }).unless({
    path: [ //pour faire un tableau de toutes les routes qui sont exclus de la navigation avec token
        '/',
        '/login',
        '/movie-search',
        '/movies',
        new RegExp('/movies.*/', 'i'), // le i permet de désactiver la sensibilité à la casse
        '/search',
        '/register',
        new RegExp('/like.*/', 'i'),
        new RegExp('/dislike.*/', 'i'),
        '/neo'
    ]
}));




// //pour afficher la page index.ejs quand on n'utilise pas le compteur redis (sinon il y a conflit sur la page)
// app.get('/', indexController.getIndex);


//pour afficher la page movies.ejs
app.get('/movies', movieController.getMovies);


//en utilisant multer
// c'est comme bobyparser + l'upload des fichiers
app.post('/movies', upload.fields([]), movieController.postMovies); // méthode pour insérer dans la base de donnée => requete post sur /movie, exec postMovie


app.get('/movies/:iddefini', movieController.getMovieById);

// pour gérer la modification de film
app.post('/movies/:iddefini', upload.fields([]), movieController.updateMovie); // upload.fields([]) est nécessaire au middleware multer pour modifier


app.delete('/movies/:iddefini', movieController.deleteMovie);


// champ de formulaire de recherche
app.get('/search', movieController.searchMovie);

// champ de formulaire de recherche
app.post('/search', upload.fields([]), movieController.aggregSearch);


// champ de formulaire de recherche
app.get('/movie-search', movieSearchController.getMovieSearch);


app.get('/login', loginController.getLogin);


app.post('/login', loginController.postLogin);


app.get('/register', loginController.getRegister);


app.post('/register', loginController.postUser);


app.get('/user-only', userOnlyController.getUserOnly);


//pour utiliser une BDD redis
app.get('/', indexController.start);


app.post('/like/:id', movieController.like);

app.post('/dislike/:id', movieController.dislike);


//pour utiliser neo
app.get('/neo', indexController.neo4jMovie);



/* 
//pour afficher la phrase dans l'url
//req et res sont un convention express
app.get('/movies', (req,res)=>{
    res.send('Ici vos prochains films et séries');
});
*/


// //pour la gestion du formulaire
// app.post('/movies', (req,res)=>{
//     // req.body.titre; // il s'agit de l'attribut name dans l'input
//     // req.body.annee;
//     if(!req.body){ // pour sécuriser un peu : on vérifie que la demande est partie du body
//         res.sendStatus(500);

//     }else{
//         console.log(req.body);
//         const newMovie = {
//             title : req.body.titre, //celui du name
//             year : parseInt(req.body.annee),
//             description : req.body.description
//         };

//         films.push(newMovie);
//         console.log(films);
//         res.sendStatus(201);
//     }

// });


/*
//quand on passe un paramètre à express, il faut mettre un :
app.get('/movies/:id/:titre', (req, res) => {
    const id = req.params.id;
    const titre = req.params.titre;

    res.send(`L'id du film est ${id} et le titre : ${titre}.`);
});
*/


/*
app.get('/movies/add', (req,res)=>{
    //res.send(`Votre formulaire d'ajout ici !!!`);
});
*/


/*
//quand on passe un paramètre à express, il faut mettre un :
app.get('/movies/:id', (req,res)=>{
    const id = req.params.id;
    const titre = req.params.titre;

    //pour vérifier que l'id est un nombre
    if(isNaN(id)){
        res.send(`L'id du film n'est pas bon`);
    }else{
    res.send(`L'id du film est ${id}.`);
    }
});
*/


app.listen(PORT, () => {
    console.log(`Ecoutez sur le port ${PORT}`);
});

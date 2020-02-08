// const faker = require('faker');

// const titre = faker.lorem.sentence(3);
// const year = Math.floor(Math.random() * 80) + 1950;

const Movie = require('../models/Movie').Movie;


// pour utiliser une BDD redis
const redis = require('redis');
const config = require('../config');
const redisClient = redis.createClient(config.redisPort, config.redisHost);
const args = ['Notes', 1, 'initFor'];

// pour créer une donnée clé/valeur en redis pour connaitre les films préférés
redisClient.zadd(args, (err, response) => {
    if (err) throw err;
    console.log('added' + response + 'items');
});

//dans la console redis
//zrange Notes 0 -1 permet de vérifier les films enregistré
//zscore Notes "nom exacte de film" permet de connaitre le nombre de like du film concerné




exports.getMovieById = (req, res) => {
    const id2 = req.params.iddefini;//id récupéré à partir de l'url
    const titre = 'Le titre du film qui correspond à l\'id';

    //pour vérifier que l'id est un nombre et que la demande viens du body
    if (/*isNaN(id2) &&*/ !req.body) {
        res.send(`L'id du film n'est pas bon`);
    } else {
        Movie.findById(id2, (err, monFilm) => { //le (err, monfilm) est un callback => c'est un eméthode mongoose
            if (err) {
                console.error(err);
            } else {
                res.render('showMovie', { movie: monFilm }); //on passe l'objet movie contenant monFilm qui correspond au succés du callback
            }
        })
    }
}

exports.getMovies = (req, res) => {

    /*
     // ces lignes permettent de mocker une base de donnée
     films = [
         { title: `Le seigneur des anneaux : La commauté de l'anneau`, year: 2001, description: `le 1` },
         { title: `Le seigneur des anneaux : Les deux tours`, year: 2002, description: `le 2`, },
         { title: `Le seigneur des anneaux : Le retour du roi`, year: 2003, description: `le 3` },
         { title: `A star is born`, year: 2019, description: `un film` }
     ]*/

    // on crée un objet qui récupère les donnée de la base de donnée
    Movie.find((err, movies) => {//si on ne met rien (de plus que le callback, car méthode mongoose) il récupère tout
        if (err) {
            console.error('Pas de films récupéré depuis MongoDB');
        } else {
            /*
            film = Movies; //petite étape pour sécuriser un peu plus , mais attention ça peut poser problème dans le code plus tard
            res.render('movies', {datas: film})
            */

            redisClient.zrange(['Notes', '0', '-1', 'WITHSCORES'], (err, likes) => {
                if (err) {
                    console.log(err);
                } else {
                    res.render('movies', { datas: movies, likes: likes });
                }
            });
        }
    });

    //res.render('movies', { datas: films });
}

exports.postMovies = (req, res) => {
    if (!req.body) {
        return res.statusCode(500);
    } else {
        // const formData = req.body;
        // console.log('formData', formData);
        // const newMovie = {
        //     title: formData.titre,
        //     year: parseInt(formData.annee),
        //     description: formData.description
        // };
        // films.push(newMovie);

        // //pour faire des faker dans la bdd pour des tests par exemple
        // let newMovie = new Movie({
        //     title: titre,
        //     year: year
        // });

        let newMovie = new Movie({
            title: req.body.titre, // on utilise le nom de l'attribut name de l'input
            year: req.body.annee,
            //description: 'description par défaut' // par exemple
            description: req.body.description,
            rank: req.body.note,
            category: req.body.categorie
        });

        newMovie.save((err, saved) => { //permet d'insérer dans la bdd
            if (err) { // par convention l'erreur est toujours gérée en premier
                console.log(err);
            } else {
                console.log(saved);
                res.sendStatus(200);
            }
        })

    }
}


exports.updateMovie = (req, res) => {
    if (!req.body) {
        return res.sendStatus(500);
    }

    const id = req.params.iddefini;

    //tout ceci est une méthode mongoDB pure
    Movie.findByIdAndUpdate(id, {
        $set: {
            title: req.body.titre, // on utilise le nom de l'attribut name de l'input
            year: req.body.annee,
            description: req.body.description,
            rank: req.body.note,
            category: req.body.categorie
        }
    }, { new: true }, (err, movieUpdated) => { // le new: true est une option pour l'obliger à afficher le film avant
        if (err) {
            console.error(err);
            return res.send(`Le film ${req.body.title} n'a pas pu être mis à jour`);
        } else {
            console.log(movieUpdated);
            //res.redirect('/movies'); // pour returner sur la page de liste
            res.redirect(`/movies/${id}`);
        }
    })
}


exports.deleteMovie = (req, res) => {
    const id = req.params.iddefini;

    Movie.findByIdAndDelete(id, (err, movie) => { //on récupère une information stockée dans une variable film
        if (err) {
            console.error(err);
        } else {
            console.log(movie);
            //res.redirect('/movies'); //redirection quand on n'utilise pas axios
            res.sendStatus(200); //axios a besoin du code status
        }
    })
}


exports.searchMovie = (req, res) => {
    res.render('search');
}


exports.aggregSearch = (req, res) => {
    if (!req.body) {
        return res.sendStatus(500);
    } else {
        const value = parseInt(req.body.note);

        Movie.aggregate([// on passe un tableau de paramètre dont chaque paramètre/(recherche) sera un objet json
            {
                $match: { rank: value }// le rank dépend de la value récupérer dans le body
                //$match: { rank: { $gte: value } } // on fait pareil mais on cherche le + grand ou égal
            },
            {
                $project: { title: 1, rank: 1, description: 1 }
            }
        ]).then(function (response) {
            res.send(response);
        }).catch(function (err) {
            console.error(response);
        })

    }
}


exports.like = (req, res) => {
    if (!req) {
        return res.statusCode(500);
    } else {
        Movie.findById(req.params.id, (err, movie) => { // on utilise mongoose pour récupérer le film by id
            if (err) {
                console.log(err);
            } else {
                redisClient.zincrby(['Notes', 1, movie.title]);
                //console.log('ok like');
                res.sendStatus(201); // réponse pour axios (axios utilise sendStatus pour savoir ce qui se passe)
            }
        })
    }
}


exports.dislike = (req, res) => {
    if (!req) {
        return res.statusCode(500);
    } else {
        Movie.findById(req.params.id, (err, movie) => { // on utilise mongoose pour récupérer le film by id
            if (err) {
                console.log(err);
            } else {
                redisClient.zincrby(['Notes', -1, movie.title]);
                //console.log('ok dislike');
                res.sendStatus(201); // réponse pour axios (axios utilise sendStatus pour savoir ce qui se passe)
            }
        })
    }
}

const jwt = require('jsonwebtoken');
const config = require('../config');
const secret = config.Secret;
const User = require('../models/User').User; // pour l'importer le model (exports mongoose model User)


// // juste pour tester tant qu'on a pas de bdd
// const fakeUser = { email: 'test@test.fr', password: 'test' };


exports.getLogin = (req, res) => {
    res.render('login');
}


//MyModel.find({ name: 'john', age: { $gte: 18 }});

exports.postLogin = (req, res) => {
    console.log('Post login :', req.body);//va s'afficher dans le cmder car post

    if (!req.body) {
        res.sendStatus(500); // si code 500, xhr se bloque et arrête
    } else {

        User.find({ email: req.body.email }, (err, user) => {
            if (err) {
                console.log(err);
            } else {
                
                console.log(user[0].email);
                if (user[0].email === req.body.email && user[0].password === req.body.password) {
                    console.log(user[0]);
                    const jwtToken = jwt.sign({   // à la librairie jwt on utilise la méthode sign , on passe le payload dans les {}, jwt lui génère automatiquement le header et la signature
                        email: user[0].email,
                        nom: user[0].name,
                        prenom: user[0].username,
                        age: user[0].age,
                        lastLogin: new Date()
                    }, secret);
                    res.json(jwtToken);   //en faisant ça, on sécurise la donnée
                }
            }
        })





        // quand on faisait les tests on utilisait un fakeUser
        // if (fakeUser.email === req.body.email && fakeUser.password === req.body.password) {
        //     const jwtToken = jwt.sign({   // à la librairie jwt on utilise la méthode sign , on passe le payload dans les {}, jwt lui génère automatiquement le header et la signature
        //         email: req.body.email,
        //         filmPreferer: 'Dark crytal',
        //         salleDeCinema: 'Pathé Lyon 8 ème',
        //         lastLogin: new Date()
        //     }, secret);
        //     res.json(jwtToken);   //en faisant ça, on sécurise la donnée
        // }
    }
}



exports.postUser = (req, res) => {

    if (!req.body) {
        return res.statusCode(500);
    } else {

        let newUser = new User({
            email: req.body.email,
            password: req.body.password,
            role: 'ROLE_USER',
            age: req.body.age,
            name: req.body.name,
            surname: req.body.username
        });

        // la méthode ne change pas car c'est une façon de coder universel
        newUser.save((err, saved) => { //permet d'insérer dans la bdd
            if (err) { // par convention l'erreur est toujours gérée en premier
                console.log(err);
            } else {
                console.log(saved);
                res.sendStatus(200);
            }
        })

    }
}


exports.getRegister = (req, res) => {
    res.render('register');
}

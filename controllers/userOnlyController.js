exports.getUserOnly =  (req, res) => {
    // lorsque le token sera valider express-jwt nous crée un objet user ds notre objet requete
    console.log('req.user : ', req.user);
    res.send(req.user); // res.send permet d'envoyer dans la console du navigateur
};
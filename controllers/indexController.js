// pour utiliser une BDD redis
const redis = require('redis');
const config = require('../config');
const redisClient = redis.createClient(config.redisPort, config.redisHost);

redisClient.set('Visited', '0'); // pour créer une donnée clé/valeur en redis


//pour utiliser cassandra
const cassandra = require('cassandra-driver');
const cassandraClient = new cassandra.Client({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1',
    protocolOptions: { port: 9042 },
    keyspace: 'initdemo'
});

cassandraClient.connect((err, result) => {
    console.log('Coucou Mika');
});

const getAllUsers = 'SELECT * FROM Users';




// pour mongoDB
exports.getIndex = (req, res) => {
    //res.send('Hello World à tous');
    res.render('index');
}


const query = 'SELECT * FROM Users';


exports.start = (req, res) => { // à chaque démarrage 
    redisClient.incr('Visited'); //redis va incrémenter la clé visited

    redisClient.get('Visited', (err, response) => {
        if (err) {
            console.log(err);
        } else {

            cassandraClient.execute(query, [])
                .then(result => res.render('index', { users: result.rows, visited: response }))
                .catch(err => console.log(err));

            //console.log('User avec le nom', result.rows[0].name) // à mettre dans à la place dans le res.render pour tester


            // //pour utiliser cassandra
            // let users = cassandraClient.execute(getAllUsers)
            //     .then(result => result.rows[0])
            //     .catch(err => console.log(err));

            // console.log(users);

            // //pour le compte de visiteur en redis
            // let countVisit = response;

            // res.render('index', { visited: countVisit });
        }
    })
}




//pour utiliser Noe4j
const neo4j = require('neo4j-driver').v1;
const neoDriver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '123456'));
const neoSession = neoDriver.session();


exports.neo4jMovie = (req, res) => {
    neoSession.run('MATCH p=shortestPath((bacon:Person {name:"Kevin Bacon"})-[*]-(meg:Person {name:"Meg Ryan"})) RETURN p')
    .then(
        function (result){
            console.log(result);
            console.log(result.records);
            
            result.records.foreach(function(record){
                console.log(record);
                console.log(record.get(0));
                console.log(record.get(0).properties);
            })
        }
    ).catch((err)=>{
        console.log(err);
    })

}
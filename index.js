const path = require('path');
const crypto = require('crypto');
const express = require('express');
const PouchDB = require('pouchdb');
const { Level } = require('level');
const PouchServer = require('express-pouchdb')
const cors = require('cors')

const argparser = require('./utils/args')
const argv = argparser(process.argv);

const Store = new Level(path.resolve(argv.dir, 'filehost'), { valueEncoding: 'binary' });
const app = express();
const pouchapp = PouchServer(PouchDB);

pouchapp.use(cors({
    origin: "*",
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
    supportsCredentials: true,
    allowedHeaders:["Authorization", "Origin", "Referer"]
}))

pouchapp.listen(argv.db_port, () => console.log(`PouchServer running`))

const REMOTE_SKIM = argv.skim;
const LOCAL_SKIM = 'opm_new';

const localSkim = new PouchDB(LOCAL_SKIM);
const remoteSkim = new PouchDB(REMOTE_SKIM);

localSkim.changes({
    since: 'now',
    live: true
}).on('change', () => console.log('Updated'));


app.get('/:name', (req,res) => {
    let packageName = req.params.name;
    getPackage(packageName).then(package => {
        const versions = Object.keys(package.versions);
        versions.forEach(version => {
            package.versions[version].dist.tarball = `${argv['url']}/tarballs/${package.name}/${version}.tgz`
            package.versions[version].dist.info = `${argv['url']}/${package.name}/${version}`;
        })

        res.send(package);
    }).catch(err => {
        res.status(500).send(err)
    })
    
})

app.get('/tarballs/:name/:version.tgz', (req,res) => {
    let packageName = req.params.name;
    let version = req.params.version;
    let package = getPackage(packageName);
    let id = `${packageName}-${version}`;


    getPackage(packageName).then(package => {
        Store.get(id, {asBuffer: true, valueEncoding: 'binary'}, (err, buf) => {
            if(!err) {
                let hash = crypto.createHash('sha1');
                hash.update(buf);
                if(package.versions[version].dist.shasum !== hash.digest('hex')) {
                    res.status(500).send({
                        error: 'hashes do not match'
                    })
                }else {
                    res.setHeader('Content-Type', 'application/octet-stream')
                    res.setHeader('Content-Length', buf.length);
                    res.send(buf);
                }
            }else {
                let tgzLocation = package.versions[version].dist.tarball;
                axios.get(tgzLocation)
                    .then(content => {
                        res.setHeader('Content-Type', 'application/octet-stream')
                        res.setHeader('Content-Length', content.length);
                        res.send(content);    
                    })
                    .catch(err => {
                        res.status(500).send(err)
                    })
            }
        }) 

        package.versions[version].downloads ? package.versions[version].downloads += 1 : package.versions[version].downloads = 1;
        localSkim.put(package);
    })

    .catch(err => {
        res.status(500).send({
            error: 'Unexpected error'
        })
    })
})
app.get('/tarballs/:user/:package/:version.tgz', (req,res) => {})

app.listen(argv.port, () => console.log(`Server started on port ${argv.port}`))

function getPackage(name) {
    return localSkim.get(name)
        .catch(() => {
            return remoteSkim.get(name)
                .then(package => {
                    delete package['_rev']
                    return localSkim.post(package)
                })
                .then(() => {
                    return localSkim.get(name);
                })
            }).catch(err => {
                console.error('You are offline and package not found locally')
            })
}

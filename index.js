const crypto = require('crypto');
const express = require('express');
const PouchDB = require('pouchdb');
const { Level } = require('level');
const PouchServer = require('express-pouchdb')
const cors = require('cors')

const Store = new Level('filehost', { valueEncoding: 'binary' });
const argparser = require('./args')
const app = express();
const pouchapp = PouchServer(PouchDB);

pouchapp.use(cors({
    origin: "*",
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
    supportsCredentials: true,
    allowedHeaders:["Authorization", "Origin", "Referer"]
}))

// pouchapp.setPouchDB(PouchDB)

pouchapp.listen(6789, () => console.log(`PouchServer running`))

const REMOTE_SKIM = 'https://replicate.npmjs.com';
const LOCAL_SKIM = 'opm_new';

const localSkim = new PouchDB(LOCAL_SKIM);
const remoteSkim = new PouchDB(REMOTE_SKIM);

localSkim.changes({
    since: 'now',
    live: true
}).on('change', () => console.log('Updated'));

const argv = argparser(process.argv);

app.get('/:name', (req,res) => {
    let packageName = req.params.name;
    getPackage(packageName).then(package => {
        const versions = Object.keys(package.versions);
        versions.forEach(version => {
            package.versions[version].dist.tarball = `http://localhost:5500/tarballs/${package.name}/${version}.tgz`
            package.versions[version].dist.info = `http://localhost:5500/${package.name}/${version}`;
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

app.listen(5500, () => console.log(`Server started on port 5500`))

function getPackage(name) {
    return localSkim.get(name)
        .catch(() => {
            return remoteSkim.get(name)
                .then(package => {
                    // console.log(package)
                    delete package['_rev']
                    return localSkim.post(package)
                })
                .then(() => {
                    return localSkim.get(name);
                })
            }).catch(err => console.error(err))
}

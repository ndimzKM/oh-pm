const express = require('express');
const PouchDB = require('pouchdb')

const db = new PouchDB('opm');
const skimRemote = PouchDB('https://replicate.npmjs.com')
// const remoteCouch = 'https://registry.npmjs.com';

db.changes({
    since:'now',
    live: true
}).on('change', () => console.log('Updated!!!'))

// function sync() {
//     db.replicate.from(remoteCouch, {live:false})
// }

function getPackages() {
    db.put({_id:new Date().toISOString(), title:'test'}, (err,result) => {
        if(!err) {
            console.log(result)
        }
    })
    db.allDocs({ include_docs: true, descending:true }, (err, doc) => {
        console.log(doc)
    })
}

// sync() 
// getPackages()
function getPackage(name) {
    skimRemote.get(name).then(doc => {
        console.log(doc.versions['1.0.0'].dist.tarball)
    })
}

getPackage('express')

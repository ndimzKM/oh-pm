const PouchDB = require('pouchdb');

const db = new PouchDB('opm_new');
db.allDocs({ include_docs: true, descending:true }, (err,doc) => {
    if(!err) {
        console.log(doc)
    }
})

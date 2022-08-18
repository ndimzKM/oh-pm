const db = new PouchDB('todos');
const remoteCouch = false;

db.changes({
    since: 'now',
    live: true
}).on('change', () => console.log('May be, updating UI or so'))

// 2 way syncing
const sync = () => {
    let opts = { live:true };
    db.replicate.to(remoteCouch, opts, syncError);
    db.replicate.from(remoteCouch, opts, syncError);
}

const addItem = text => {
    let newItem = {
        _id: new Date().toISOString(),
        title: text,
        completed: false
    };

    db.put(newItem, function callback(res, result) {
        if(!err) {
            console.log('Successfully posted a new item')
        }
    });
}

const showItems = () => {
    db.allDocs({ include_docs: true, descending: true }, (err, doc) => {
        // do stuff with doc
    })
}

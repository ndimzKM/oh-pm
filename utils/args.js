const supportedArgs = [
    '-h', '--help', '-v', '--version', '-p', '--port', '-pp',
    '--pouch-port', '-s', '--skim', '-u', '--url', '-d', '--dir'
];

const args = {
    '-h': ['', 'Display this help message'],
    '-p': [5501, 'port for your local registry'],
    '-pp': [6543, 'port for your pouch db server'],
    '-s': ['https://replicate.npmjs.com', 'remote skim address to sync package info from'],
    '-u': ['http://localhost:5501', 'url to your local registry'],
    '-d': ['./', 'directory to store pouchdb data'],
};

module.exports = function argparser(arglist) {
    arglist = arglist.slice(2)

    if(arglist[0] == '-h' || arglist[0] == '--help')
        displayHelp()

    if(arglist.length % 2 !== 0)
        error('Error: uneven number of arguments');

    for(let i = 0; i < arglist.length; i++) {
        let firstChars = arglist[i].substring(0,2);
        if(firstChars.includes('-')){
            try {
                if(arglist[i+1].substring(0,1).includes('-'))
                    error(`Error: value of ${arglist[i]} cannot contain that symbol`)

                if(!supportedArgs.includes(arglist[i]))
                    error(`Error: ${arglist[i]} is not supported as an argument`)

                args[arglist[i]][0] = arglist[i+1];
            }catch(error) {
                console.error(error);
            }
        }
    } 
    if(arglist.length > 1 && arglist.includes('-v') || arglist.includes('--version'))
        error('Error: you cannot get the version this way')

    return {
        'port': parseInt(args["-p"][0]),
        'db_port': parseInt(args["-pp"][0]),
        'skim': args["-s"][0],
        'url': args["-u"][0],
        'dir': args["-d"][0]
    }
}

function error(msg) {
    console.error(msg)
    process.exit(-1);
}

function displayHelp() {

    console.log("Usage: opm [arguments]");
    console.log('\nOptions:')
    console.log('    -v      get version number of opm')
    console.log('    -h      display this help message')
    console.log('    -p      port for your local registry')
    console.log('    -pp     port for your pouch db server')
    console.log('    -u      url to use for your local registry')
    console.log('    -d      directory to store pouchdb data')

    process.exit(0)
}

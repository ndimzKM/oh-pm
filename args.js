/*
* Arguments to support
* -h, --help
*  -v, --version
*  -p, --port for your local registry
*  -pp, --pouch-port for your pouch db server
*  -s, --skim remote skim to sync package info from
*  -u, --url, url to your local registry
*  -d, --dir where to store pouchdb information
*
*/
const supportedArgs = [
    '-h', '--help', '-v', '--version', '-p', '--port', '-pp',
    '--pouch-port', '-s', '--skim', '-u', '--url', '-d', '--dir'
];

const args = {
    '-h': ['', 'Display this help message'],
    '-p': ['', 'port for your local registry'],
    '-pp': ['', 'port for your pouch db server'],
    '-s': ['', 'remote skim address to sync package info from'],
    '-u': ['', 'url to your local registry'],
    '-d': ['', 'directory to store pouchdb data'],
};

module.exports = function argparser(arglist) {
    arglist = arglist.slice(2)

    if(arglist.length == 0){
        console.error('Error: no arguments passed\n');
        displayHelp();
    }

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

    return args
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

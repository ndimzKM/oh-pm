import { supportedArgs, args, ArgList, ArgKey } from './configs';

export default function argparser(arglist: ArgList) {
    arglist = arglist.slice(2);

    if (arglist[0] == '-h' || arglist[0] == '--help') displayHelp();

    if(arglist[0] == '-v' || arglist[0] == '--version') displayVersion();

    if (arglist.length % 2 !== 0) error('Error: uneven number of arguments');

    for (let i = 0; i < arglist.length; i++) {
        let firstChars = arglist[i].substring(0, 2);
        if (firstChars.includes('-')) {
            try {
                if (arglist[i + 1].substring(0, 1).includes('-'))
                    error(
                        `Error: value of ${arglist[i]} cannot contain that symbol`
                    );

                if (!supportedArgs.includes(arglist[i]))
                    error(
                        `Error: ${arglist[i]} is not supported as an argument`
                    );

                let currentArg: ArgKey = arglist[i];
                args[currentArg] = arglist[i + 1];
            } catch (error) {
                console.error(error);
            }
        }
    }
    if (
        (arglist.length > 1 && arglist.includes('-v')) ||
        arglist.includes('--version')
    )
        error('Error: you cannot get the version this way');

    return {
        port: args['-p'] as number,
        db_port: args['-pp'] as number,
        skim: args['-s'] as string,
        url: args['-u'] as string,
        dir: args['-d'] as string,
    };
}

function error(msg: string) {
    console.error(msg);
    process.exit(-1);
}

function displayHelp() {
    console.log('Usage: opm [arguments]');
    console.log('\nOptions:');
    console.log('    -v      get version number of opm');
    console.log('    -h      display this help message');
    console.log('    -p      port for your local registry');
    console.log('    -pp     port for your pouch db server');
    console.log('    -u      url to use for your local registry');
    console.log('    -d      directory to store pouchdb data');

    process.exit(0);
}

function displayVersion() {
    let pkg = require('../../package.json')
    console.log(pkg.version)

    process.exit(0);
}

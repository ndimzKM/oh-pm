import { resolve } from 'path';
import { createHash } from 'crypto';
import { Level } from 'level';
import { Application, Request, Response } from 'express';

import chalk from 'chalk'
import PouchServer from 'express-pouchdb';
import express from 'express';
import PouchDB from 'pouchdb';
import cors from 'cors';
import axios from 'axios';

import { CorsValues } from './utils/configs';
import argparser from './utils/args';
const argv = argparser(process.argv);

const Store = new Level(resolve(argv.dir, 'filehost'), {
    valueEncoding: 'binary',
});

// Salutations
console.log(`👋 Bienvenue to ${chalk.bold.cyan('oh-pm')}, 'the' offline first package manager\n`);
console.log(`To display help message, run:\n    ${chalk.green(`$ oh-pm --help`)}\n`);
console.log(`Set your registry to oh-pm with:\n    ${chalk.green(`$ npm set registry ${argv.url}`)}\n`);
console.log(`To revert back to original, run:\n    ${chalk.green(`$ npm set registry https://registry.npmjs.com`)}\n`);
console.log(chalk.bold('Activities:'));

const app: Application = express();

const pouchapp = PouchServer(PouchDB);
pouchapp.use(cors(CorsValues));
pouchapp.listen(argv.db_port, () => console.log('- ', chalk.yellow(`PouchServer running on port `), chalk.bold.yellow(argv.db_port)));

const REMOTE_SKIM = argv.skim;
const LOCAL_SKIM = 'opm_new';

const localSkim = new PouchDB(LOCAL_SKIM);
const remoteSkim = new PouchDB(REMOTE_SKIM);

app.get('/:name', (req: Request, res: Response) => {
    let packageName: string = req.params.name;
    getPackage(packageName)
        .then((pkg: any) => {
            const versions = Object.keys(pkg.versions);
            versions.forEach(version => {
                pkg.versions[
                    version
                ].dist.tarball = `${argv['url']}/tarballs/${pkg.name}/${version}.tgz`;
                pkg.versions[
                    version
                ].dist.info = `${argv['url']}/${pkg.name}/${version}`;
            });

            res.send(pkg);
        })
        .catch(err => {
            res.status(500).send(err);
        });
});

app.get('/tarballs/:name/:version.tgz', (req: Request, res: Response) => {
    let packageName: string = req.params.name;
    let version = req.params.version;
    let id = `${packageName}-${version}`;

    getPackage(packageName)
        .then((pkg: any) => {
            Store.get(
                id,
                { keyEncoding: 'buf', valueEncoding: 'binary' },
                (err, buf: any) => {
                    if (!err) {
                        let hash = createHash('sha1');
                        hash.update(buf);
                        if (
                            pkg.versions[version].dist.shasum !==
                            hash.digest('hex')
                        ) {
                            res.status(500).send({
                                error: 'hashes do not match',
                            });
                        } else {
                            res.setHeader(
                                'Content-Type',
                                'application/octet-stream'
                            );
                            res.setHeader('Content-Length', buf.length);
                            res.send(buf);
                        }
                    } else {
                        let tgzLocation = pkg.versions[version].dist.tarball;
                        axios
                            .get(tgzLocation)
                            .then(content => {
                                res.setHeader(
                                    'Content-Type',
                                    'application/octet-stream'
                                );
                                res.setHeader(
                                    'Content-Length',
                                    content.data.length
                                );
                                res.send(content);
                            })
                            .catch(err => {
                                res.status(500).send(err);
                            });
                    }
                }
            );

            pkg.versions[version].downloads
                ? (pkg.versions[version].downloads += 1)
                : (pkg.versions[version].downloads = 1);
            localSkim.put(pkg);
        })

        .catch(() => {
            res.status(500).send({
                error: 'Unexpected error',
            });
        });
});
// app.get('/tarballs/:user/:package/:version.tgz', (req: Request,res:Response) => {})

app.listen(argv.port, () => {
    console.log('-',` ${chalk.yellow(`${chalk.bold.yellow('oh-pm')} server started on port ${chalk.bold.yellow(argv.port)}`)}`)
});

const getPackage = (name: string) => {
    return localSkim
        .get(name)
        .catch(() => {
            return remoteSkim
                .get(name)
                .then((pkg: any) => {
                    delete pkg['_rev'];
                    return localSkim.post(pkg);
                })
                .then(() => {
                    return localSkim.get(name);
                });
        })
        .catch(() => {
            console.log('- ', chalk.red('You are offline and package not found locally'));
        });
};

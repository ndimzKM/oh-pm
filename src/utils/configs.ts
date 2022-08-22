import { CorsOptions } from "cors"

// types
export type ArgList = Array<string>;
export type ArgKey = string | number;
type Args = {
    [key: string]: ArgKey;
    '-p': ArgKey;
    '-pp': ArgKey;
    '-s': ArgKey;
    '-u': ArgKey;
    '-d': ArgKey;
}

// constants
export const CorsValues: CorsOptions = {
    origin: "*",
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
    allowedHeaders:["Authorization", "Origin", "Referer"]
}

export const supportedArgs = [
    '-h', '--help', '-v', '--version', '-p', '--port', '-pp',
    '--pouch-port', '-s', '--skim', '-u', '--url', '-d', '--dir'
];

export const args: Args = {
    '-h': '',
    '-p': 5501,
    '-pp': 6543,
    '-s': 'https://replicate.npmjs.com',
    '-u': 'http://localhost:5501',
    '-d': './',
};


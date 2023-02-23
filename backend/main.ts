import app from './app';
import * as http from 'http';
import * as mongoose from 'mongoose';


const PORT = process.env.PORT || 8080;
const server = http.createServer(app);

server.listen(PORT);

server.on('error', (err) => {
    console.error(err);
});

server.on('listening', async () => {
    console.info(`Listening on a port ${PORT}`);
    console.log("process.env.MONGODB_URI", process.env.MONGODB_URI)
    mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/lightning", {
        useNewUrlParser: true,
        useFindAndModify: false
    });
    mongoose.connection.once('open', () => {
        console.info('Connected to Mongo via Mongoose');
    });
    mongoose.connection.on('error', (err) => {
        console.error('Unable to connect to Mongo via Mongoose', err);
    });
});
const MyConnect = require('..');

const app = MyConnect();

app.use((req, res, next) => {
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello world!')
});

app.listen(3000);
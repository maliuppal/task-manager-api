const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express();
const port = process.env.PORT || 3000;

// app.use((req, res, next) => {

    // res.status(503).send('we are under maintenance')
    // if (req.method === 'GET') {
    //     res.send('GET requests are disabled')
    // } else {
    //     console.log(req.method, req.path)
    //     next()
    // }
    
// })

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log(`Server is up on port: ${port}`);
});
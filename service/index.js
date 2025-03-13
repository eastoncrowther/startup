    const cookieParser = require('cookie-parser');
    const bcrypt = require('bcryptjs');
    const uuid = require('uuid');
    const express = require('express');
    const app = express();

    // Save scores and users in memory
    let users = [];
    let scores = [];

    // The service port
    const port = process.argv.length > 2 ? process.argv[2] : 3000;

    // JSON body parsing
    app.use(express.json());

    // Router for service endpoints
    var apiRouter = express.Router();
    app.use('/api', apiRouter);

    // CreateAuth a new user
    apiRouter.post('/auth/create', async (req, res) => {
    if (await findUser('email', req.body.email)) {
        res.status(409).send({ msg: 'Existing user' });
    } else {
        const user = await createUser(req.body.email, req.body.password);

        setAuthCookie(res, user.token);
        res.send({ email: user.email });
    }
    });

    // GetAuth login an existing user
    apiRouter.post('/auth/login', async (req, res) => {
    const user = await findUser('username', req.body.username);
    if (user) {
        // check passwords
        if (await bcrypt.compare(req.body.password, user.password)) {
            // generate an auth token
            user.token = uuid.v4();
            setAuthCookie(res, user.token);
            res.send({ username: user.username });
            return;
        }
    }
    res.status(401).send({ msg: 'Unauthorized' });
    });

    // DeleteAuth logout a user
    apiRouter.delete('/auth/logout', async (req, res) => {
    const user = await findUser('token', req.cookies[authCookieName]);
    if (user) {
        delete user.token;
    }
    res.clearCookie(authCookieName);
    res.status(204).end();
    });

    // Middleware to verify that the user is authorized to call an endpoint
    const verifyAuth = async (req, res, next) => {
        const user = await findUser('token', req.cookies[authCookieName]);
        if (user) {
            next();
        } else {
            res.status(401).send({ msg: 'Unauthorized' });
        }
    };

    // GetScores
    apiRouter.get('/scores', verifyAuth, (_req, res) => {
        res.send(scores);
    });

    // SubmitScore
    apiRouter.post('/score', verifyAuth, (req, res) => {
        scores = updateScores(req.body);
        res.send(scores);
    });

    // Default error handler
    app.use(function (err, req, res, next) {
        res.status(500).send({ type: err.name, message: err.message });
    });

    // Return the application's default page if the path is unknown
    app.use((_req, res) => {
        res.sendFile('index.html', { root: 'public' });
    });

    // updateScores considers a new score for inclusion in the high scores.
    function updateScores(newScore) {
        let found = false;
        for (const [i, prevScore] of scores.entries()) {
            if (newScore.score > prevScore.score) {
                scores.splice(i, 0, newScore);
                found = true;
                break;
            }
        }

        if (!found) {
            scores.push(newScore);
        }

        if (scores.length > 10) {
            scores.length = 10;
        }

        return scores;
    }

    async function createUser(email, password) {
        const passwordHash = await bcrypt.hash(password, 10);

        const user = {
            usermane: username,
            password: passwordHash,
            token: uuid.v4(),
        };
        users.push(user);

        return user;
    }

    async function findUser(field, value) {
        if (!value) return null;

        return users.find((u) => u[field] === value);
    }

    // setAuthCookie in the HTTP response
    function setAuthCookie(res, authToken) {
        res.cookie(authCookieName, authToken, {
            secure: true,
            httpOnly: true,
            sameSite: 'strict',
        });
    }

    app.listen(port, "0.0.0.0", () => {
        console.log(`Listening on port ${port}`);
    });
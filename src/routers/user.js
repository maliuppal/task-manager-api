const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp')
const { sendWelcomeEmail } = require('../emails/smtp')

const router = new express.Router();

router.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        const token = await user.generateAuthToken();
        sendWelcomeEmail(user.email, user.name);
        res.status(201).send({ token, user });
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post('/users/me', auth, async (req, res) => {
    try {
        res.status(200).send(req.user);
    } catch (error) {
        res.status(400).send(error);
    }
});

const upload = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/gm)) {
            return cb(new Error('Avatar must be an Image.'));
        }

        cb(undefined, true)
        // cb(undefined, false)
    },
});

router.post('/users/me/avatar', auth,
    upload.single('avatar'),
    async (req, res) => {

        const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()

        req.user.avatar = buffer;
        await req.user.save()
        res.send();
    },
    (error, req, res, next) => {
        res.status(400).send({error: error.message})
    }
);

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.set('Content-Type', 'image/png')
        res.send(user.avatar);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCrediential(req.body.email, req.body.password);

        const token = await user.generateAuthToken();

        res.send({ token, user });
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post('/users/logout', async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token !== req.token);
        req.user.save();

        res.send('user logged out!');
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post('/users/logoutAll', async (req, res) => {
    try {
        req.user.tokens = [];
        req.user.save();

        res.send('user logged out from all devices!');
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get('/users', auth, async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).send(users);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get('/users/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const user = await User.findById(_id);
        if (!user) {
            res.status(404).send();
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.patch('/users/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];

    const isValidOperation = updates.every((key) => allowedUpdates.includes(key));
    if (!isValidOperation) {
        return res.status(400).send({ error: 'invalid updates!' });
    }

    const _id = req.params.id;
    try {
        const user = await User.findById(_id);
        if (!user) {
            res.status(404).send();
        }
        updates.forEach((update) => (user[update] = req.body[update]));
        await user.save();
        res.status(200).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete('/users/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const user = await User.findByIdAndDelete(_id);
        if (!user) {
            res.status(404).send();
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;

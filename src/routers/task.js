const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');

const router = new express.Router();

router.get('/tasks', auth, async (req, res) => {
    try {
        let limit = parseInt(req.query.limit) || 10;
        let skip = parseInt(req.query.skip) || 0;
        const filter = { owner: req.user._id };
        const sort = {};
        if (req.query.completed) {
            filter.completed = req.query.completed === 'true';
        }
        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(':');
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
        }
        await req.user.populate({
            path: 'tasks',
            filter,
            options: {
                limit: limit,
                skip: skip
            }
        })
        // const tasks = await Task.find(filter).limit(limit).skip(skip).sort(sort).exec();
        res.status(200).send(req.user.tasks);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOne({ _id, owner: req.user._id });
        if (!task) {
            res.status(404).send();
        }
        res.status(201).send(task);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post('/tasks', auth, async (req, res) => {
    try {
        const task = new Task({
            ...req.body,
            owner: req.user._id,
        });
        await task.save();
        res.status(201).send(task);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];

    const isValidOperation = updates.every((key) => allowedUpdates.includes(key));
    if (!isValidOperation) {
        return res.status(400).send({ error: 'invalid updates!' });
    }

    const _id = req.params.id;
    try {
        const task = await Task.findOne({ _id, owner: req.user._id });
        if (!task) {
            res.status(404).send();
        }
        updates.every((update) => (task[update] = req.body[update]));
        await task.save();

        res.status(200).send(task);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findByIdAndDelete({ _id, owner: req.user._id });
        if (!task) {
            res.status(404).send();
        }
        res.status(200).send(task);
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;

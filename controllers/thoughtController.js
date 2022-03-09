const { Thought, User } = require("../models");

module.exports = {

    getThoughts(req, res) {
        Thought.find()
            .sort({ createdAt: "descending" })
            .then((Thoughts) => res.json(Thoughts))
            .catch((err) => {
                console.log(err);
                res.status(500).json(err);
            });
    },

    getSingleThought(req, res) {
        Thought.findOne({ _id: req.params.thoughtId })
            .then((thought) =>
                !thought
                    ? res.status(404).json({ message: "No thought with this ID" })
                    : res.json(thought)
            )
            .catch((err) => res.status(500).json(err));
    },

    createThought(req, res) {
        Thought.create(req.body)
            .then((thought) => {
                return User.findOneAndUpdate(
                    {
                        _id: req.body.userId,
                    },
                    {
                        $push: { thoughts: thought._id },
                    },
                    {
                        new: true,
                    }
                );
            })
            .then((user) => res.json(user))
            .catch((err) => {
                console.log(err);
                return res.status(500).json(err);
            });
    },

    deleteThought(req, res) {
        Thought.findOneAndDelete({ _id: req.params.thoughtId })
            .then((thought) =>
                !thought
                    ? res.status(404).json({ message: "No thought with that ID" })
                    : User.findOneAndUpdate(
                        {
                            _id: req.body.userId,
                        },
                        {
                            $pull: { thoughts: req.params.thoughtId },
                        },
                        {
                            new: true,
                        }
                    )
            )
            .then(() => res.json({ message: "Thought deleted!" }))
            .catch((err) => res.status(500).json(err));
    },

    updateThought(req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtId },
            { $set: req.body },
            { runValidators: true, new: true }
        )
            .then((thought) =>
                !thought
                    ? res.status(404).json({ message: "No thought found  with this ID" })
                    : res.json(thought)
            )
            .catch((err) => res.status(500).json(err));
    },

    addReaction(req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtId },
            { $addToSet: { reactions: req.body } },
            { runValidators: true, new: true }
        )
            .then((thought) =>
                !thought
                    ? res.status(404).json({ message: "No thought with that id" })
                    : res.json(thought)
            )
            .catch((err) => res.status(500).json(err));
    },

    removeReaction(req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtId },
            { $pull: { reactions: { reactionId: req.params.reactionId } } },
            { runValidators: true, new: true }
        )
            .then((thought) =>
                !thought
                    ? res.status(404).json({ message: "No thought found with that id" })
                    : res.json(thought)
            )
            .catch((err) => res.status(500).json(err));
    },
};
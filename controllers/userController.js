const { User, Thought } = require('../models');

module.exports = {

    getUsers(req, res) {
        User.find()
            .select('-__v')
            .then(async (users) => {
                return res.json(users);
            })
            .catch((err) => {
                console.log(err);
                return res.status(500).json(err);
            });
    },

    getSingleUser(req, res) {
        User.findOne({ _id: req.params.userId })
            .select('-__v')
            .populate('friends')
            .populate('thoughts')
            .then(async (user) =>
                !user
                    ? res.status(404).json({ message: "No user found with this id" })
                    : res.json({
                        user,
                    })
            )
            .catch((err) => {
                console.log(err);
                return res.status(500).json(err);
            });
    },

    createUser(req, res) {
        User.create(req.body)
            .then(user => res.json(this.getSingleUser))
            .catch((err) => res.status(500).json(err));
    },

    deleteUser(req, res) {
        User.findOneAndDelete({ _id: res.params.userId })
            .then((user) =>
                !user
                    ? res.status(404).json({ message: 'No such user exists' })

                    : Thought.deleteMany({ userId: req.params.userId })
                        .then((thought) =>
                            !thought
                                ? res.status(404).json({ message: "No thought with this ID" })
                                : res.json({ message: 'User successfully deleted' })
                        )
                        .catch((err) => {
                            console.log(err);
                            res.status(500).json(err);
                        }));
    },

    updateUser(req, res) {
        User.findOneAndUpdate({
            _id: req.params.userId,
        },
            {
                $set: req.body,
            },
            {
                runValidators: true,
                new: true,
            },
        )
            .then((user) =>
                !user
                    ? res.status(404).json({ message: 'No such user exists' })
                    : res.json({ message: 'User successfully updated' })
            )
            .catch((err) => {
                console.log(err);
                res.status(500).json(err);
            });
    },

    addFriend(req, res) {
        User.findOneAndUpdate(
            { _id: req.params.userId },
            { $addToSet: { friends: req.params.friendId } },
            { new: true }
        )
            .then((user) =>
                !user
                    ? res
                        .status(404)
                        .json({ message: 'No user found with this Id :(' })
                    : res.json(user)
            )
            .catch((err) => res.status(500).json(err));
    },

    removeFriend(req, res) {
        User.findOneAndUpdate(
            { _id: req.params.userId },
            { $pull: { friends: req.params.friendId } },
            { new: true }
        )
            .then((user) =>
                !user
                    ? res
                        .status(404)
                        .json({ message: 'No user found with that ID :(' })
                    : res.json(user)
            )
            .catch((err) => res.status(500).json(err));
    },
};
const testPost = {
    "title": "Test post",
    "content": "Just a post",
    "sender": "Eylon"
}

const testComments = [
    {
        "content": "Hello everyone, this post is awesome",
        "sender": "Eylon"
    },
    {
        "content": "Hi my friend! This is a great post",
        "sender": "Adir"
    }
]

const failureComment = {
    "postId": "My failure comment",
    "content": "It's going to fail.",
    "owner": "Adir"
}

module.exports = {testComments, failureComment, testPost}
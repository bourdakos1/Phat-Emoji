childPropLoop = function(obj) {
    for (let childIndex in obj) {
        let child = obj[childIndex]

        if (child != null) {
            if (child['props'] != null) {
                if ('activeThreadID' in child['props']) {
                    let id = child['props']['activeThreadID']
                    return id;
                }

                if ('children' in child['props']) {
                    let children = child['props']['children']
                    let id = childPropLoop(children)
                    if (id != null) {
                        return id;
                    }
                }
            }
        }
    }
}

loopy = function(node) {
    for (let key in node) {
    	if (key.startsWith("__reactInternalInstance$")) {
            let instance = node[key]
            if (instance['memoizedState'] == null) {
                if (instance != null) {
                    if (instance['memoizedProps'] != null) {
                        if ('children' in instance['memoizedProps']) {
                            for (let childIndex in instance['memoizedProps']['children']) {
                                if (instance['memoizedProps']['children'][childIndex] != null) {
                                    if (instance['memoizedProps']['children'][childIndex]['props'] != null) {
                                        if ('children' in instance['memoizedProps']['children'][childIndex]['props']) {
                                            let children = instance['memoizedProps']['children'][childIndex]['props']['children']
                                            let id = childPropLoop(children)
                                            if (id != null) {
                                                return id;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return null
    	}
    }
    for (let child in node.children) {
        let id = loopy(node.children[child])
        if (id != null) {
            return id;
        }
    }
}

window.addEventListener('message', event => {
    if (event.source !== window || event.data.action == null || event.data.action != 'getId') {
        return;
    }
    console.log('gettngid')
    let node = document.body;
    let otherUser = loopy(node).split(':')[1];
    var user = document.getElementsByTagName("script")[4].innerText.match( /{"USER_ID":"(.*?)"/ )[1];

    var message = {
        action: 'sendId',
        otherUser: otherUser,
        user: user
    }

    window.postMessage(message, '*');
}, false);

window.addEventListener('message', event => {
    if (event.source !== window || event.data.action == null || event.data.action != 'sendMessage') {
        return;
    }

    let node = document.body;
    let otherUser = loopy(node).split(':')[1];
    console.log(otherUser);

    var millis = new Date().getTime()
    var big = new BigNumber(millis).multiply(2**22).add(Math.floor(Math.random() * 2**22))

    var token = document.getElementsByTagName("script")[4].innerText.match( /{"token":"(.*?)"}/ )[1];

    if (event.data.action === 'sendMessage') {
        // We should now be able to make a call.
        var data = new FormData();
        data.append('action_type', 'ma-type:user-generated-message');
        data.append('body', event.data.message);
        data.append('has_attachment', 'false');
        data.append('message_id', big._d.join(''));
        data.append('offline_threading_id', big._d.join(''));
        data.append('other_user_fbid', otherUser);
        data.append('source', 'source:messenger:web');
        data.append('timestamp', millis);
        data.append('fb_dtsg', token);

        var host = window.location.hostname;

        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://' + host + '/messaging/send/', true);
        xhr.send(data);
    } else if (event.data.action === "sendHotEmoji") {
        // We should now be able to make a call.
        var data = new FormData();
        data.append('action_type', 'ma-type:user-generated-message');
        data.append('body', '🤔');
        data.append('has_attachment', 'false');
        data.append('message_id', big._d.join(''));
        data.append('offline_threading_id', big._d.join(''));
        data.append('other_user_fbid', otherUser);
        data.append('source', 'source:messenger:web');
        data.append('tags[0]', 'hot_emoji_size:large');
        data.append('tags[1]', 'hot_emoji_source:hot_like');
        data.append('timestamp', millis);
        data.append('fb_dtsg', token);

        var host = window.location.hostname;

        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://' + host + '/messaging/send/', true);
        xhr.send(data);
    }
}, false);

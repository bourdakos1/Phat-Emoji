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
    if (event.source !== window || event.data.action == null || event.data.action != 'checkIsExtensionUser') {
        return;
    }

    let node = document.body;
    let otherUser = loopy(node).split(':')[1];

    var message = {
        action: 'nonUser',
        otherUser: otherUser
    }
    window.postMessage(message, '*');
}, false);

window.addEventListener('message', event => {
    if (event.source !== window || event.data.action == null || (event.data.action != 'sendMessage' && event.data.action != 'sendHotEmoji')) {
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

        // if (event.data.attach) {
        //     console.log('attaching')
        //     data.append('shareable_attachment[share_type]', 100);
        //     data.append('shareable_attachment[share_params][urlInfo][canonical]', 'https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fphat-emoji%2Fognoiiipkkmdmihiinbpdfjbfncekbhj');
        //     data.append('shareable_attachment[share_params][urlInfo][final]', 'https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fphat-emoji%2Fognoiiipkkmdmihiinbpdfjbfncekbhj');
        //     data.append('shareable_attachment[share_params][urlInfo][user]', 'https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fphat-emoji%2Fognoiiipkkmdmihiinbpdfjbfncekbhj%3Fhl%3Den-US');
        //     data.append('shareable_attachment[share_params][urlInfo][log][1502764602]', 'https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fphat-emoji%2Fognoiiipkkmdmihiinbpdfjbfncekbhj%3Fhl%3Den-US');
        //     data.append('shareable_attachment[share_params][default_scrape]', 'false');
        //     data.append('shareable_attachment[share_params][responseCode]', '200');
        //     data.append('shareable_attachment[share_params][favicon]', 'https%3A%2F%2Fssl.gstatic.com%2Fchrome%2Fwebstore%2Fimages%2Ficon_144px.png');
        //     data.append('shareable_attachment[share_params][title]', 'Phat%20Emoji');
        //     data.append('shareable_attachment[share_params][summary]', 'Send%20end%20to%20end%20encrypted%20messages');
        //     data.append('shareable_attachment[share_params][content_removed]', 'false');
        //     data.append('shareable_attachment[share_params][images][0]', 'https%3A%2F%2Flh3.googleusercontent.com%2Fvni-wqv0JbGadtkyMge0o3bRciABM20gkvEIX6P4WByXhXPnw_8R6QZ3CmyQdX66kOstBVsI3uk%3Dw640-h400-e365');
        //     data.append('shareable_attachment[share_params][ranked_images][images][0]', 'https%3A%2F%2Flh3.googleusercontent.com%2Fvni-wqv0JbGadtkyMge0o3bRciABM20gkvEIX6P4WByXhXPnw_8R6QZ3CmyQdX66kOstBVsI3uk%3Dw640-h400-e365');
        //     data.append('shareable_attachment[share_params][ranked_images][ranking_model_version]', '11');
        //     data.append('shareable_attachment[share_params][ranked_images][specified_og]', 'true');
        //     data.append('shareable_attachment[share_params][image_info][0][url]', 'https%3A%2F%2Flh3.googleusercontent.com%2Fvni-wqv0JbGadtkyMge0o3bRciABM20gkvEIX6P4WByXhXPnw_8R6QZ3CmyQdX66kOstBVsI3uk%3Dw640-h400-e365');
        //     data.append('shareable_attachment[share_params][image_info][0][width]', '640');
        //     data.append('shareable_attachment[share_params][image_info][0][height]', '400');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][closeup]', '0');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][food]', '0.0024');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][has_person]', '0.0435');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][indoor]', '0.0267');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][landmark]', '0.0039');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][nature]', '0.0009');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][outdoor]', '0');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][overlaid_text]', '0.4692');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][synthetic]', '0.9906');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][water]', '0.0042');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][1475021559182282]', '0.5505');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][1109494342443410]', '0.8035');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][1345709685500859]', '0.442');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][1213219845391771]', '0.266');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][1330038063711045]', '0.1554');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][1481449958534835]', '0.4975');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][1217540891699849]', '0.2688');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][1336804146394231]', '0.2637');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][1406325326076264]', '0.3524');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][1325406787525091]', '0.3938');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][1374201752631580]', '0.3357');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][1321648237881786]', '0.5793');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][1370281929698100]', '0.5062');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][894838270619264]', '0.1475');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][1428506300514060]', '0.4235');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][1345503238845080]', '0.2465');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][1215277101924103]', '0.3317');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][1436910129661653]', '0.1627');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][1221907154567925]', '0.9798');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][1342412209175764]', '0.9137');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][1198194556905068]', '1');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][890098047749860]', '0.9942');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][478731775513589]', '0.1375');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][825925940775366]', '0.0162');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][879269108752223]', '0.0068');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][542948579138582]', '0.0111');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][905225146174133]', '0.0026');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][860058024004202]', '0.0025');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][916120588448861]', '0.0304');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][932061020179036]', '0.0675');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][1226196364093584]', '0.1812');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][980876601946677]', '0.2686');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][987376264678721]', '0.9182');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][982659981822310]', '0.9267');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][137284553109721]', '0.0749');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][1473647772708745]', '0.5014');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][1043528985700747]', '0.2672');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][1010454505675743]', '0.1421');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][899870633472096]', '0.504');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][1159864067409456]', '0.6812');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][1097444533614028]', '0.1933');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][1000323346753239]', '0.7705');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][720779748018357]', '0.9725');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][1009589729068000]', '0.8958');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][437978556329078]', '0.1856');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][1162258277214310]', '0.438');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][789669971160491]', '0.0148');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][938448442937829]', '0.0057');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][989425901127129]', '0.068');
        //     data.append('shareable_attachment[share_params][image_info][0][xray][scores][1041518695928342]', '0.0311');
        //     data.append('shareable_attachment[share_params][image_info][0][photodna]', 'GC0ZVwEnFnwAARJ6GgMCfFQjSIkeQ0x8GCodTkgyejgNPWxEOx2IFlZDklUcXztPIAAEEUwxOmgiORhByg9adiKidWcOZxUeEAACBiMTJlgEHw8iuAo9UonruFMDUwckAQAAAAEDAAIEAAMB%2FxFmIuL%2FeXQAWAMEDgAFAB4MTQAaD1AEvxhsxzzVLesAOQEE');
        //     data.append('shareable_attachment[share_params][image_info][0][is_animated]','');
        //     data.append('shareable_attachment[share_params][image_info][0][is_graphicsmagick_corrupt]','');
        //     data.append('shareable_attachment[share_params][image_info][0][accent_colors][muted_v1]', '60524FFF');
        //     data.append('shareable_attachment[share_params][image_info][0][accent_colors][vibrant_v1]', '6C3ED7FF');
        //     data.append('shareable_attachment[share_params][image_info][0][file_size]', '42943');
        //     data.append('shareable_attachment[share_params][image_info][0][image_hash]', 'a6d767b015c0d5e61deb3dcde66bfa09');
        //     data.append('shareable_attachment[share_params][medium]', '106');
        //     data.append('shareable_attachment[share_params][url]', 'https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fphat-emoji%2Fognoiiipkkmdmihiinbpdfjbfncekbhj%3Fhl%3Den-US');
        //     data.append('shareable_attachment[share_params][domain_ip]', '2607%3Af8b0%3A400a%3A807%3A%3A200e');
        //     data.append('shareable_attachment[share_params][time_scraped]', '1502771059');
        //     data.append('shareable_attachment[share_params][last_good_scrape_time]', '1502771059');
        //     data.append('shareable_attachment[share_params][cache_hit]', 'true');
        //     data.append('shareable_attachment[share_params][global_share_id]', '1384485024920990');
        //     data.append('shareable_attachment[share_params][was_recent]', 'false');
        //     data.append('shareable_attachment[share_params][metaTagMap][0][http-equiv]', 'content-type');
        //     data.append('shareable_attachment[share_params][metaTagMap][0][content]', 'text%2Fhtml%3B%20charset%3Dutf-8');
        //     data.append('shareable_attachment[share_params][metaTagMap][1][charset]', 'utf-8');
        //     data.append('shareable_attachment[share_params][metaTagMap][2][http-equiv]', 'x-ua-compatible');
        //     data.append('shareable_attachment[share_params][metaTagMap][2][content]', 'IE%3Dedge');
        //     data.append('shareable_attachment[share_params][metaTagMap][3][name]', 'google-site-verification');
        //     data.append('shareable_attachment[share_params][metaTagMap][3][content]', '6MQ3V3iNTp9Gaek0rQdI1BT1b5HKKsN8_WzyFbu1uWU');
        //     data.append('shareable_attachment[share_params][metaTagMap][4][name]', 'Description');
        //     data.append('shareable_attachment[share_params][metaTagMap][4][content]', 'Send%20end%20to%20end%20encrypted%20messages');
        //     data.append('shareable_attachment[share_params][metaTagMap][5][name]', 'referrer');
        //     data.append('shareable_attachment[share_params][metaTagMap][5][content]', 'origin');
        //     data.append('shareable_attachment[share_params][metaTagMap][6][property]', 'og%3Atitle');
        //     data.append('shareable_attachment[share_params][metaTagMap][6][content]', 'Phat%20Emoji');
        //     data.append('shareable_attachment[share_params][metaTagMap][7][property]', 'og%3Adescription');
        //     data.append('shareable_attachment[share_params][metaTagMap][7][content]', 'Send%20end%20to%20end%20encrypted%20messages');
        //     data.append('shareable_attachment[share_params][metaTagMap][8][property]', 'og%3Atype');
        //     data.append('shareable_attachment[share_params][metaTagMap][8][content]', 'website');
        //     data.append('shareable_attachment[share_params][metaTagMap][9][property]', 'og%3Aurl');
        //     data.append('shareable_attachment[share_params][metaTagMap][9][content]', 'https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fphat-emoji%2Fognoiiipkkmdmihiinbpdfjbfncekbhj');
        //     data.append('shareable_attachment[share_params][metaTagMap][10][property]', 'og%3Aimage');
        //     data.append('shareable_attachment[share_params][metaTagMap][10][content]', 'https%3A%2F%2Flh3.googleusercontent.com%2FTLlP1cc7HVm-16nPj9uSuGwc_CNhmZePt66p62m9wuHKvy16jnqXB_c4bJtb07CCp6UnjJDsOZ4%3Dw128-h128-e365');
        //     data.append('shareable_attachment[share_params][metaTagMap][11][name]', 'viewport');
        //     data.append('shareable_attachment[share_params][metaTagMap][11][content]', 'width%3Ddevice-width%2C%20initial-scale%3D1.0%2C%20maximum-scale%3D1.0');
        //     data.append('shareable_attachment[share_params][og_info][properties][0][0]', 'og%3Atitle');
        //     data.append('shareable_attachment[share_params][og_info][properties][0][1]', 'Phat%20Emoji');
        //     data.append('shareable_attachment[share_params][og_info][properties][1][1]', 'Send%20end%20to%20end%20encrypted%20messages');
        //     data.append('shareable_attachment[share_params][og_info][properties][2][1]', 'website');
        //     data.append('shareable_attachment[share_params][og_info][properties][3][0]', 'og%3Aurl');
        //     data.append('shareable_attachment[share_params][og_info][properties][3][1]', 'https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fphat-emoji%2Fognoiiipkkmdmihiinbpdfjbfncekbhj');
        //     data.append('shareable_attachment[share_params][og_info][properties][4][1]', 'https%3A%2F%2Flh3.googleusercontent.com%2FTLlP1cc7HVm-16nPj9uSuGwc_CNhmZePt66p62m9wuHKvy16jnqXB_c4bJtb07CCp6UnjJDsOZ4%3Dw128-h128-e365');
        //     data.append('shareable_attachment[share_params][og_info][guesses][0][0]', 'og%3Aurl');
        //     data.append('shareable_attachment[share_params][og_info][guesses][0][1]', 'https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fphat-emoji%2Fognoiiipkkmdmihiinbpdfjbfncekbhj');
        //     data.append('shareable_attachment[share_params][og_info][guesses][1][0]', 'og%3Atitle');
        //     data.append('shareable_attachment[share_params][og_info][guesses][1][1]', 'Phat%20Emoji');
        //     data.append('shareable_attachment[share_params][og_info][guesses][2][0]', 'og%3Adescription');
        //     data.append('shareable_attachment[share_params][og_info][guesses][2][1]', 'Send%20end%20to%20end%20encrypted%20messages');
        //     data.append('shareable_attachment[share_params][og_info][guesses][3][0]', 'og%3Aimage');
        //     data.append('shareable_attachment[share_params][og_info][guesses][3][1]', 'https%3A%2F%2Flh3.googleusercontent.com%2FTLlP1cc7HVm-16nPj9uSuGwc_CNhmZePt66p62m9wuHKvy16jnqXB_c4bJtb07CCp6UnjJDsOZ4%3Dw128-h128-e365');
        //     data.append('shareable_attachment[share_params][og_info][guesses][4][0]', 'og%3Alocale');
        //     data.append('shareable_attachment[share_params][og_info][guesses][4][1]', 'en');
        //     data.append('shareable_attachment[share_params][redirectPath][0][status]', 'og%3Aurl');
        //     data.append('shareable_attachment[share_params][redirectPath][0][url]', 'https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fphat-emoji%2Fognoiiipkkmdmihiinbpdfjbfncekbhj');
        //     data.append('shareable_attachment[share_params][ttl]', '604800');
        //     data.append('shareable_attachment[share_params][error]', '1');
        //     data.append('shareable_attachment[share_params][amp_url]', '');
        // }

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

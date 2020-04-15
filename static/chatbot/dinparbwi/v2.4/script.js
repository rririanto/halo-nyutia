const removeElements = elms => elms.forEach(el => el.remove());
sessionStorage.removeItem("language")

function baseDict() {
    var init_dict = {
        "suggestions": {
            "id": "Saran",
            "en": "Suggestions"
        },
        "destask": {
            "id": "Mau kemana nih?",
            "en": "Where is your destination?"
        },
        "askwhat": {
            "en": "Ok, what do you want to know about",
            "id": "Baiklah, apa yang ingin Anda ketahui tentang "
        },
        "quicksuggest": {
            "en": [
                "Change my destination",
                "About " + getDest(),
                "How do I get to " + getDest(),
                "Where to stay at " + getDest(),
                "Best time to go " + getDest(),
                "Things to do in " + getDest(),
                "Entrance fee for " + getDest(),
                getDest() + " Opening hours",
                getDest() + " Facilities",
                "Things to note for " + getDest() + " trip",
                "News from " + getDest(),
                "Event this month"
            ],
            "id": [
                "Ubah destinasi saya",
                "Tentang " + getDest(),
                "Bagaimana saya bisa pergi ke " + getDest(),
                "Tempat tinggal di " + getDest(),
                "Waktu terbaik untuk pergi ke " + getDest(),
                "Yang bisa di lakukan di " + getDest(),
                "Biaya masuk untuk " + getDest(),
                "Jam buka " + getDest(),
                "Fasilitas di " + getDest(),
                "Hal-hal yang perlu diperhatikan untuk trip ke " + getDest(),
                "Info baru tentang " + getDest(),
                "Event bulan ini"
            ]
        }
    }
    return init_dict
};

var dict;

function initialize() {
    dict = {};
    base = baseDict()
    for (let key in base) {
        if (base.hasOwnProperty(key)) {
            dict[key] = base[key];
        }
    }
}
initialize()

function getDest() {
    return sessionStorage.getItem("destination");
}

loadCSS = function(href) {
    var cssLink = "<link rel='stylesheet' type='text/css' href='" + href + "'>";
    document.querySelector("head").innerHTML += cssLink;
};

langLoad = function(e) {
    var language = {
        quickReplies: [
            "Indonesia",
            "English"
        ]
    };
    addLang(language);
};

loadSuggest = function(e) {
    if (sessionStorage.getItem("destination")) {
        var suggestText = {
            quickReplies: getDict("quicksuggest")
        };
    } else {
        setBotResponse(getDict("destask"))
        var suggestText = {
            quickReplies: [
                "Ijen",
                "Baluran",
                "Sukamade",
                "Alas Purwo",
                "Meuru Betiri",
                "Green Bay",
                "Red Island"
            ]
        };
    }
    addSuggestion(suggestText);
};

function getDict(key) {
    var lang = sessionStorage.getItem("language")
    return dict[key][lang]
}
loadCSS("/static/chatbot/dinparbwi/v2.4/style.css");
var baseUrl = "/sendmessage";
setBotResponse(
    "Selamat datang di chatbot @askbwi. Saya di sini untuk membantu Anda dengan semua informasi pariwisata Banyuwangi. Tak perlu sungkan bertanya pada saya. :)"
);

if (!sessionStorage.getItem("language")) {
    setBotResponse(
        "Pilih Bahasa Anda (Please select your language)"
    );
    langLoad();
} else {
    loadSuggest();
}

var tagBody = "(?:[^\"'>]|\"[^\"]*\"|'[^']*')*";
var tagOrComment = new RegExp(
    "<(?:" +
    // Comment body.
    "!--(?:(?:-*[^->])*--+|-?)" +
    // Special "raw text" elements whose content should be elided.
    "|script\\b" +
    tagBody +
    ">[\\s\\S]*?</script\\s*" +
    "|style\\b" +
    tagBody +
    ">[\\s\\S]*?</style\\s*" +
    // Regular name
    "|/?[a-z]" +
    tagBody +
    ")>",
    "gi"
);

function removeTags(html) {
    var oldHtml;
    do {
        oldHtml = html;
        html = html.replace(tagOrComment, "");
    } while (html !== oldHtml);
    return html.replace(/</g, "&lt;");
}

var mybot =
    '<div class="chatCont" id="chatCont">' +
    '<div class="bot_profile">' +
    '<img src="/static/chatbot/dinparbwi/v2.4/mbanyutia.png" class="bot_p_img">' +
    '<div class="box-close">' +
    '<div class="close">' +
    '<img src="/static/chatbot/dinparbwi/v2.4/remove-symbol.svg"/>' +
    "</div>" +
    "</div>" +
    "</div><!--bot_profile end-->" +
    '<div id="result_div" class="resultDiv"></div>' +
    '<div class="spinner">' +
    '<div class="bounce1"></div>' +
    '<div class="bounce2"></div>' +
    '<div class="bounce3"></div>' +
    "</div>" +
    "</div><!--chatCont end-->" +
    '<div class="profile_div">' +
    '<div class="row">' +
    '<div class="col-hgt">' +
    '<img src="/static/chatbot/dinparbwi/v2.4/mbanyutia.png" class="img-profile">' +
    "</div>" +
    "</div><!--row end-->" +
    "</div><!--profile_div end-->";

String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, "");
};

var el = document.querySelector("mybot");
el.innerHTML = mybot;

var chatcont = document.querySelector(".chatCont");
var bot_profile = document.querySelector(".bot_profile");
var profile = document.querySelector(".profile_div");

var show = function(elem) {
    elem.style.display = "block";
};

var hide = function(elem) {
    elem.style.display = "none";
};

profile.onclick = function() {
    hide(profile);
    show(chatcont);
    show(bot_profile);
};

var close = document.querySelector(".close");
close.onclick = function() {
    show(profile);
    hide(chatcont);
    hide(bot_profile);
};

var session = function() {
    if (sessionStorage.getItem("session")) {
        var retrievedSession = sessionStorage.getItem("session");
    } else {
        var randomNo = Math.floor(Math.random() * 1000 + 1);
        var timestamp = Date.now();
        var date = new Date();
        var weekday = new Array(7);
        weekday[0] = "Sunday";
        weekday[1] = "Monday";
        weekday[2] = "Tuesday";
        weekday[3] = "Wednesday";
        weekday[4] = "Thursday";
        weekday[5] = "Friday";
        weekday[6] = "Saturday";
        var day = weekday[date.getDay()];
        var session_id = randomNo + day + timestamp;
        sessionStorage.setItem("session", session_id);
        var retrievedSession = sessionStorage.getItem("session");
    }
    return retrievedSession;
};

var mysession = session();

function send(text) {
    fetch(baseUrl, {
            method: "POST",
            body: JSON.stringify({
                message: text,
                lang: sessionStorage.getItem("language"),
                sessionId: mysession
            }),
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        })
        .then(result => {
            result.json().then(function(text) {
                main(text);
            });
        })
        .catch(error => console.error("Error:", error));
}

function main(data) {
    var messages = data.fulfillmentMessages;
    if (messages) {
        if (messages.length >= 0) {
            if (messages[0].platform) {
                setBotResponse(messages[0].quickReplies.title);
                var suggestions = messages[0].quickReplies;
                addSuggestion(suggestions);
            } else {
                for (var i = 0; i < messages.length; i++) {
                    if (messages[i].text.text) setBotResponse(messages[i].text.text[0]);
                }
                loadSuggest();
            }
        }
    }
}

function createTextLinks(text) {
    return (text || "").replace(
        /([^\S]|^)(((https?\:\/\/)|(www\.))(\S+))/gi,
        function(match, space, url) {
            var hyperlink = url;
            if (!hyperlink.match("^https?://")) {
                hyperlink = "http://" + hyperlink;
            }
            return space + '<a href="' + hyperlink + '">Link</a>';
        }
    );
}

function setBotResponse(val) {
    setTimeout(function() {
        if (val.trim() != "") {
            const BotResponse =
                '<p class="botResult">' +
                createTextLinks(val) +
                '</p><div class="clearfix"></div>';
            const parentNode = document.getElementById("result_div");
            parentNode.innerHTML += BotResponse;
        }
        hideSpinner();
    }, 500);
}

function removeSuggest() {
    removeElements(document.querySelectorAll(".suggestion"));
}

function appendtoID(id, element) {
    const el = document.getElementById(id),
        elChild = document.createElement("div");
    elChild.innerHTML = element;
    el.appendChild(elChild);
}

function appendtoClass(cname, element) {
    const el = document.querySelector(cname);
    el.innerHTML += element;
}

function setUserResponse(val) {
    const UserResponse =
        '<p class="userEnteredText">' + val + '</p><div class="clearfix"></div>';

    appendtoID("result_div", UserResponse);
    showSpinner();
    removeSuggest();
}

function showSpinner() {
    const spinner = document.querySelector(".spinner");
    show(spinner);
}

function hideSpinner() {
    const spinner = document.querySelector(".spinner");
    hide(spinner);
}

function addLang(textToAdd) {
    setTimeout(function() {
        var langs = textToAdd.quickReplies;
        var langLength = textToAdd.quickReplies.length;
        appendtoID("result_div", '<p class="suggestion"></p>');
        for (i = 0; i < langLength; i++) {
            appendtoClass(
                ".suggestion",
                '<span class="sugg-options" onclick="clickerLg(this)">' +
                langs[i] +
                "</span>"
            );
        }
    }, 1000);
}


function addSuggestion(textToAdd) {
    setTimeout(function() {
        var suggestions = textToAdd.quickReplies;
        var suggLength = textToAdd.quickReplies.length;
        appendtoID("result_div", '<p class="suggestion"></p>');
        appendtoClass(".suggestion", '<div class="sugg-title">' + getDict("suggestions") + ': </div>');
        for (i = 0; i < suggLength; i++) {
            appendtoClass(
                ".suggestion",
                '<span class="sugg-options" onclick="clickerFn(this)">' +
                suggestions[i] +
                "</span>"
            );
        }
        hideSpinner();
    }, 1000);
}

clickerLg = function(obj) {
    var text = obj.innerText;
    if (text == "Indonesia") {
        sessionStorage.setItem("language", 'id');
    } else {
        sessionStorage.setItem("language", 'en');
    }
    setUserResponse(text);
    loadSuggest();
};


clickerFn = function(obj) {
    var text = obj.innerText;
    var listdst = [
        "Ijen",
        "Baluran",
        "Sukamade",
        "Alas Purwo",
        "Meuru Betiri",
        "Green Bay",
        "Red Island"
    ];
    if (listdst.includes(text)) {
        sessionStorage.setItem("destination", text);
        initialize()
        setUserResponse(text);
        setBotResponse(getDict("askwhat") + text + "?");
        loadSuggest();
    } else if (text == "Change my destination" || text == "Ubah destinasi saya") {
        setUserResponse(text);
        sessionStorage.removeItem("destination")
        loadSuggest();
    } else {
        setUserResponse(text);
        send(text);
    }
    removeSuggest();
};
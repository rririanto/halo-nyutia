# -*- coding: utf-8 -*-

# Flask Lib
import requests
import datetime
from flask import Flask, jsonify, make_response, render_template, request
from flask_cors import CORS

# Main lib
import dialogflow

# We use facebook response as default responses
# We will also use this responses for our front js code
from df_responses import facebook_response as message_objects
from df_responses import fulfillment_response

from pytz import timezone
from dateutil import parser
import requests_cache
from dotenv import load_dotenv
load_dotenv()

# Default pythonlib

app = Flask(__name__, template_folder='templates')
log = app.logger
CORS(app)

"""
@Using cache to reduce requests
"""
requests_cache.install_cache(
    'reqaskbwi_cache',
    backend='sqlite',
    expire_after=180)


API_ENDPOINT = {
    "Destination": {
        "id": "https://api.sheety.co/50395747-e21e-4c25-acf3-37b98c1328a4",
        "en": "https://api.sheety.co/0e913193-6296-4cf2-8179-1a06bc9e8a17"
    },
    "Event": "https://api.sheety.co/060617d0-7c6f-4d81-b161-79d583529900"
}

DEFAULT_MESSAGE = {
    "no_event": {
        "en": "I'm sorry, We do not have any event informations of days before today. ",
        "id": "Maaf, Kami tidak memiliki informasi acara tersebut."
    }
}


def get_message_objects(title, replies):
    msg = message_objects()
    get_message = msg.quick_replies(title, replies)
    return get_message

def get_json_object(data, key, q):
    return [item for item in data if item[key] == q]


def get_json_object_date(data, date):
    count = 1
    temp = []
    for i in data:
        if i["date"] >= date:
            if count <= 6:
                parse_date = parser.parse(i["date"]).strftime("%a, %d %B, %Y")
                temp.append("%s. %s : %s" %
                            (count, parse_date, i["title"].capitalize()))
                count += 1
    return temp


def get_data_api(url, key, q, action_type):
    r = requests.get(url)
    data = r.json()
    if data:
        rdata = get_json_object(data, key, q)
        result = rdata[0].get(action_type) if len(rdata) >= 1 else ''
        return result


def event_handler(param, lang):
    time = param.get("date")
    period = param.get("date-period")
    today = datetime.datetime.now()
    today = today.replace(tzinfo=timezone('Asia/Jakarta'))
    if period:
        time = str(parser.parse(period.get("startDate")).date())

    if not time:
        time = today
    else:
        time = parser.parse(time)
        if time.date().month < today.date().month:
            res = {"fulfillmentText": DEFAULT_MESSAGE["no_event"][lang]}
            return res

        elif time.date().month == today.date().month:
            time = today

    url = API_ENDPOINT["Event"]
    r = requests.get(url)
    data = r.json()
    if data:
        get_date = get_json_object_date(data, str(time.date()))
        if lang == "en":
            get_date.insert(
                0, "Here's %s related event for you" %
                len(get_date))
        else:
            get_date.insert(
                0, "Inilah %s acara terkait untuk kamu" %
                len(get_date))

        fr = fulfillment_response()
        res = fr.fulfillment_messages(get_date)
        return res


def destination_handler(param, lang, action_type):
    setkey = "Destination"
    key = setkey.lower()
    q = param.get(setkey)
    url = API_ENDPOINT[setkey][lang]
    result = get_data_api(url, key, q, action_type)
    if result:
        res_objects = result.split("\n\n")
        fr = fulfillment_response()
        resp = fr.fulfillment_messages(res_objects)
        return resp
    else:
        resp = get_responses(
            req_query['intent']['displayName'], lang)
        return resp


@app.errorhandler(404)
def page_not_found(e):
    """Return a custom 404 error."""
    return 'Sorry, Nothing at this URL.', 404


@app.errorhandler(500)
def application_error(e):
    """Return a custom 500 error."""
    return 'Sorry, unexpected error: {}'.format(e), 500


@app.route('/')
def hello():
    return render_template('demo_dinpar.html')


def detect_intent_texts(project_id, session_id, text, language_code):
    session_client = dialogflow.SessionsClient()
    session = session_client.session_path(project_id, session_id)
    if text:
        text_input = dialogflow.types.TextInput(
            text=text, language_code=language_code)
        query_input = dialogflow.types.QueryInput(text=text_input)
        response = session_client.detect_intent(
            session=session, query_input=query_input)

        from google.protobuf.json_format import MessageToDict
        response = MessageToDict(response)
        return response


@app.route('/sendmessage', methods=['POST'])
def sendmessage():
    req = request.get_json()
    message = req.get("message")
    lang = req.get("lang")
    req = detect_intent_texts('askbwi', "unique", message, lang)
    param = req['queryResult'].get('parameters')
    action = req['queryResult'].get('action')
    text = req['queryResult'].get('fulfillmentText')
    msg = req['queryResult'].get('fulfillmentMessages')
    fm = {
        'fulfillmentMessages': msg,
        'parameters': param,
        'fulfillmentText': text,
        'action': action
    }
    return make_response(jsonify(fm))


@app.route('/webhook', methods=['POST'])
def receive_message():
    req = request.get_json(force=True)
    req_query = req['queryResult']
    req['session'].split('/')[-1]
    param = req_query['parameters']
    action_type = param.get('action_type')
    lang = req_query["languageCode"]

    if action_type:
        try:
            if action_type == "event":
                resp = event_handler(param, lang)
            else:
                resp = destination_handler(param, lang, action_type)

            return make_response(jsonify(resp))
        except Exception as e:
            log.error('Unexpected action requested: %s' % e)
            return make_response(jsonify({"fulfillmentText": ''}))

    return make_response(
        jsonify({"fulfillmentText": '', "contextOut": []}))


if __name__ == "__main__":
    PORT = 5000
    app.debug = True
    app.run(host='0.0.0.0')

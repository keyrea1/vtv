# -*- coding: utf-8 -*-
"""
    vtv-shell.accessExchange module
    ~~~~~~~~~~~~~~~~~~~~~~~~
    This module contains client functions for vtv-shell.
    v.0.0.1
    :copyright: (c) 2018 ZVO
"""

import json
import time
import tornado.escape
import tornado.ioloop
import tornado.locks
import tornado.httpserver
import tornado.web
import os.path
import _thread
from urllib.parse import parse_qs
from config import accessPort
from threading import Thread
from tornado.options import define, options, parse_command_line
import server
import sqlDriver

MODULE = 'accessExchange'
HTTP_PORT = accessPort

flag_to_exit = True
stream = None
userStatus = 0

def setFlagToExit():
    global flag_to_exit
    flag_to_exit = True

def getFlagToExit():
    global flag_to_exit
    return flag_to_exit


class Cargo(tornado.web.RequestHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def get(self):
        try:
            pyTerminalAnswer = {}
            answer = []
            details = self.get_argument("filter[value]", None, True)
            pyTerminalAnswer['method'] = "getCargos"
            dict = server.parse_method(pyTerminalAnswer)
            for word in dict['params']['cargos']:
                if details in word:
                    answer.append(word)
            answer = json.dumps(answer)
        except Exception as inst:
            answer = {'answer': 'error', "params": {'message': inst.args[0]}}
            answer = json.dumps(answer)
        self.write(answer)


class Reports(tornado.web.RequestHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.set_header('Content-Type', 'application/x-www-form-urlencoded')

    def get(self):
        try:
            pyTerminalAnswer = {}
            answer = []
            pyTerminalAnswer['method'] = "getActiveReports"
            dict = server.parse_method(pyTerminalAnswer)
            answer = json.dumps(dict, ensure_ascii=False).encode('utf8')
        except Exception as inst:
            answer = {'answer': 'error', "params": {'message': inst.args[0]}}
            answer = json.dumps(answer.encode('utf-8'))
        self.write(answer)


class CargoName(tornado.web.RequestHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def get(self):
        try:
            pyTerminalAnswer = {}
            answer = []
            details = self.get_argument("filter[value]", None, True)
            pyTerminalAnswer['method'] = "getCargoNames"
            dict = server.parse_method(pyTerminalAnswer)
            for word in dict['params']['cargonames']:
                if details in word:
                    answer.append(word)
            answer = json.dumps(answer)
        except Exception as inst:
            answer = {'answer': 'error', "params": {'message': inst.args[0]}}
            answer = json.dumps(answer)
        self.write(answer)


class UserName(tornado.web.RequestHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def get(self):
        try:
            pyTerminalAnswer = {}
            answer = []
            details = self.get_argument("filter[value]", None, True)
            pyTerminalAnswer['method'] = "getUsers"
            pyTerminalAnswer['user'] = 3
            dict = json.loads(server.parse_method(pyTerminalAnswer))
            for word in dict['params']:
                if word['user_name'] != None and word['user_name'] != "superuser":
                    if details in word['user_name']:
                        answer.append(word['user_name'])
            answer = json.dumps(answer)
        except Exception as inst:
            answer = {'answer': 'error', "params": {'message': inst.args[0]}}
            answer = json.dumps(answer)
        self.write(answer)


class ComPorts(tornado.web.RequestHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def get(self):
        try:
            pyTerminalAnswer = {}
            answer = []
            pyTerminalAnswer['method'] = "getCOMPorts"
            dict = server.parse_method(pyTerminalAnswer)
            dict = json.loads(dict)
            for word in dict['params']['ports']:
                answer.append({'id': word, 'value': word})
            answer = json.dumps(answer)
        except Exception as inst:
            answer = {'answer': 'error', "params": {'message': inst.args[0]}}
            answer = json.dumps(answer)
        self.write(answer)


class DestinationPoint(tornado.web.RequestHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def get(self):
        try:
            pyTerminalAnswer = {}
            answer = []
            details = self.get_argument("filter[value]", None, True)
            pyTerminalAnswer['method'] = "getDestPoints"
            dict = server.parse_method(pyTerminalAnswer)
            for word in dict['params']['points']:
                if details in word:
                    answer.append(word)
            answer = json.dumps(answer)
        except Exception as inst:
            sys_data = {"method": "DestinationPoint", "exeption": str(inst.args)}
            sqlDriver.set_system_log(sys_data)
            answer = {'answer': 'error', "params": {'message': inst.args[0]}}
            answer = json.dumps(answer)
        self.write(answer)


class Status(tornado.web.RequestHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def post(self):
        global userStatus
        try:
            if userStatus == 0:
                answer = None
                userStatus = 1
            else:
                answer = {"answer": "ok"}
            answer = json.dumps(answer)

        except Exception as inst:
            sys_data = {"method": "Status", "exeption": str(inst.args)}
            sqlDriver.set_system_log(sys_data)
            answer = {'answer': 'error', "params": {'message': inst.args[0]}}
            answer = json.dumps(answer)
        print("------------STATUS------------")
        self.write(answer)


class Logout(tornado.web.RequestHandler):

    answer = json.dumps({"error": '-2', "params": 'something went wrong'})
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def post(self):
        answer = json.dumps({"error": '-2', "params": 'something went wrong'})
        try:
            post_data = self.request.body
            pyTerminalAnswer = {}
            _temp = post_data.decode('utf-8')
            temp = parse_qs(_temp, True, False, 'utf-8')
            pyTerminalAnswer['method'] = temp['method'][0]
            pyTerminalAnswer['user'] = temp['user'][0]
            global userStatus
            userStatus = 0
            pyTerminalAnswer['params'] = json.loads(temp['params'][0])#json.loads(temp[b'params'][0].decode('utf-8'))
            method = pyTerminalAnswer.get("method")
            clientIp = self.request.remote_ip
        except Exception as inst:
            sys_data = {"method": "HTTPHandler", "exeption": str(inst.args)}
            sqlDriver.set_system_log(sys_data)
            newAnswer = {'answer': 'error', "params": {'message': inst.args}}
            temp = json.dumps(newAnswer)
            self.write(temp.encode('utf-8'))

        try:
            answer = server.parse_method(pyTerminalAnswer)
        except Exception as inst:
            sys_data = {"method": "HTTPHandler", "exeption": str(inst.args)}
            sqlDriver.set_system_log(sys_data)
            if 'duplicate key value violates unique constraint "user_user_name_key"' in inst.args[0]:
                answer = '{"answer": error, "params": {"message": "Such login already exists"}}'
            else:
                answer = {'answer': 'error', "params": {'message': inst.args[0]}}
            answer = json.dumps(answer)

        self.write(answer.encode('utf-8'))


class UploadHandlerArchive(tornado.web.RequestHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def options(self):
        self.write('')

    def post(self):
        method = "Archive"
        request = self.request
        files = request.files
        file1 = files['upload']
        original_fname = file1[0]['filename']
        output_file = open("backups/" + original_fname, 'wb')
        output_file.write(file1[0]['body'])
        output_file.close()
        answer = sqlDriver.upload_data(original_fname, method)
        self.finish('{"status": "server"}')

        #self.write(json.dumps(answer))


class UploadHandlerLogs(tornado.web.RequestHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def options(self):
        self.write('')

    def post(self):
        method = "Logs"
        request = self.request
        files = request.files
        file1 = files['upload']
        original_fname = file1[0]['filename']
        output_file = open("backups/" + original_fname, 'wb')
        output_file.write(file1[0]['body'])
        output_file.close()
        answer = sqlDriver.upload_data(original_fname, method)
        self.finish('{"status": "server"}')

        #self.write(json.dumps(answer))


class UploadHandlerCalibration(tornado.web.RequestHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def options(self):
        self.write('')

    def post(self):
        method = "Calibration"
        request = self.request
        files = request.files
        file1 = files['upload']
        original_fname = file1[0]['filename']
        output_file = open("backups/" + original_fname, 'wb')
        output_file.write(file1[0]['body'])
        output_file.close()
        answer = sqlDriver.upload_data(original_fname, method)
        self.finish('{"status": "server"}')

        #self.write(json.dumps(answer))


class UploadHandlerBackup(tornado.web.RequestHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def options(self):
        self.write('')

    def post(self):
        method = "Backup"
        request = self.request
        files = request.files
        file1 = files['upload']
        original_fname = file1[0]['filename']
        output_file = open("backups/" + original_fname, 'wb')
        output_file.write(file1[0]['body'])
        output_file.close()
        answer = sqlDriver.upload_data(original_fname, method)
        self.finish('{"status": "server"}')

        #self.write(json.dumps(answer))


class PhotoHandler(tornado.web.RequestHandler):

    answer = json.dumps({"error": '-2', "params": 'something went wrong'})
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def post(self):
        answer = json.dumps({"error": '-2', "params": 'something went wrong'})
        try:
            post_data = self.request.body
            pyTerminalAnswer = {}
            _temp = post_data.decode('utf-8')
            temp = parse_qs(_temp, True, False, 'utf-8')
            pyTerminalAnswer['method'] = temp['method'][0]
            pyTerminalAnswer['user'] = temp['user'][0]
            pyTerminalAnswer['params'] = {temp['number'][0]: temp['photos']}
            method = pyTerminalAnswer.get("method")
            clientIp = self.request.remote_ip
        except Exception as inst:
            sys_data = {"method": "HTTPHandler", "exeption": str(inst.args)}
            sqlDriver.set_system_log(sys_data)
            newAnswer = {'answer': 'error', "params": {'message': inst.args}}
            temp = json.dumps(newAnswer)
            self.write(temp.encode('utf-8'))

        try:
            answer = server.parse_method(pyTerminalAnswer)
        except Exception as inst:
            sys_data = {"method": "HTTPHandler", "exeption": str(inst.args)}
            sqlDriver.set_system_log(sys_data)
            if 'duplicate key value violates unique constraint "user_user_name_key"' in inst.args[0]:
                answer = '{"answer": error, "params": {"message": "Such login already exists"}}'
            else:
                answer = {'answer': 'error', "params": {'message': inst.args[0]}}
            answer = json.dumps(answer)

        self.write(answer.encode('utf-8'))


class HTTPHandler(tornado.web.RequestHandler):

    answer = json.dumps({"error": '-2', "params": 'something went wrong'})
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def post(self):
        answer = json.dumps({"error": '-2', "params": 'something went wrong'})
        try:
            post_data = self.request.body
            if self.request.headers._dict['Content-Type'] == 'application/x-www-form-urlencoded':
                pyTerminalAnswer = {}
                _temp = post_data.decode('utf-8')
                temp = parse_qs(_temp, True, False, 'utf-8')
                pyTerminalAnswer['method'] = temp['method'][0]
                pyTerminalAnswer['user'] = temp['user'][0]
                pyTerminalAnswer['params'] = json.loads(temp['params'][0])#json.loads(temp[b'params'][0].decode('utf-8'))
            else:
                stringTerminalAnswer = post_data.decode('utf-8')
                pyTerminalAnswer = json.loads(stringTerminalAnswer)
            method = pyTerminalAnswer.get("method")
            clientIp = self.request.remote_ip
        except Exception as inst:
            sys_data = {"method": "HTTPHandler", "exeption": str(inst.args)}
            sqlDriver.set_system_log(sys_data)
            newAnswer = {'answer': 'error', "params": {'message': inst.args}}
            temp = json.dumps(newAnswer)
            self.write(temp.encode('utf-8'))

        try:
            answer = server.parse_method(pyTerminalAnswer)
        except Exception as inst:
            sys_data = {"method": "HTTPHandler", "exeption": str(inst.args)}
            sqlDriver.set_system_log(sys_data)
            if 'duplicate key value violates unique constraint "user_user_name_key"' in inst.args[0]:
                answer = '{"answer": error, "params": {"message": "Such login already exists"}}'
            else:
                answer = {'answer': 'error', "params": {'message': inst.args[0]}}
            answer = json.dumps(answer)

        self.write(answer.encode('utf-8'))


class Ping(tornado.web.RequestHandler):

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def post(self):
        global flag_to_exit
        try:
            flag_to_exit = False
            answer = json.dumps({"method": 'ping', "answer": 'pong'})

            self.write(answer.encode('utf-8'))
        except Exception as inst:
            newAnswer = {'answer': 'error', "params": {'message': inst.args}}
            temp = json.dumps(newAnswer)
            self.write(temp.encode('utf-8'))


def start():
    try:
        parse_command_line()
        app = tornado.web.Application(
            [
                (r"/", HTTPHandler),
                (r"/photo", PhotoHandler),
                (r"/ping/", Ping),
                (r"/cargo/", Cargo),
                (r"/reports/", Reports),
                (r"/cargo_name/", CargoName),
                (r"/comports/", ComPorts),
                (r"/destination_point/", DestinationPoint),
                (r"/status", Status),
                (r"/logout", Logout),
                (r"/upload/archive", UploadHandlerArchive),
                (r"/upload/logs", UploadHandlerLogs),
                (r"/upload/calibration", UploadHandlerCalibration),
                (r"/upload/backup", UploadHandlerBackup),
                (r"/login_name/", UserName)
            ],
            cookie_secret="__TODO:_GENERATE_YOUR_OWN_RANDOM_VALUE_HERE__",
            template_path=os.path.join(os.path.dirname(__file__), "templates"),
            static_path=os.path.join(os.path.dirname(__file__), "static"),
            xsrf_cookies=False
        )
        _server = tornado.httpserver.HTTPServer(app)
        _server.bind(HTTP_PORT)
        _server.start(1)
        _thread.start_new_thread(tornado.ioloop.IOLoop.instance().start, ())
    except Exception as inst:
        print(inst.args)
        os._exit(1)

    #tornado.ioloop.IOLoop.current().start()

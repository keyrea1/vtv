import tornado.websocket
import tornado.web
import tornado.ioloop
from tornado.options import define, options, parse_command_line
import json
import server

MODULE = 'accessExchange'
WS_PORT = 9090
#define("port", default=WS_PORT, help="run on the given port", type=int)
#define("debug", default=True, help="run in debug mode")


class EchoWebSocket(tornado.websocket.WebSocketHandler):
    # clients = []

    def check_origin(self, origin):
        print(origin)
        return True

    def data_received(self, chunk):
        print(chunk)
        pass

    def open(self):
        print("WebSocket opened")
        # EchoWebSocket.clients.append(self)
        # self.write_message("WebSocket opened")

    def on_message(self, message):

        rcvData = json.loads(message)
        answer = server.parse_method(rcvData)
        self.write_message(answer)

    def on_close(self):
        # EchoWebSocket.clients.remove(self)
        print("WebSocket closed")


def ws_starter():
    parse_command_line()
    app = tornado.web.Application([
        (r"/", EchoWebSocket)
    ])
    app.listen(options.port)
    tornado.ioloop.IOLoop.current().start()

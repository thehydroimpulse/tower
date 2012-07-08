# https://github.com/sockjs/sockjs-client
Tower.Net.Connection.Sockjs =
  getId: (socket) ->
    1

  listen: (url) ->
    @connect(new Tower.modules.sockjs(url))

  registerHandler: (socket, name, handler) ->
    socket.on name, handler

  emit: (data) ->
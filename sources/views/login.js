import {JetView} from 'webix-jet'

export default class LoginView extends JetView {
  config () {
    const _ = this.app.getService('locale')._
    const theme = this.app.config.theme
    const ip = this.app.config.remoteHOST
    const referenceView = this

    var loginNameSuggester = {
      view: 'suggest',
      body: {
        dataFeed: ip + '/login_name/'
      },
      width: 70,
      yCount: 8
    }

    const login_form = {
      id: 'login_form',
      view: 'form', localId: 'login:form',
      width: 400, borderless: false, margin: 10,
      rows: [
        {type: 'header', template: _('Authorization')},
        {
          view: 'text',
          id: 'login',
          name: 'login',
          label: _('User Name'),
          labelPosition: 'top',
          suggest: loginNameSuggester,
          on: {
            'onEnter': function (state, editor, ignoreUpdate) {
              $$('password').$view.querySelector('input').focus()
            }
          }
        },
        {
          view: 'text', id: 'password', type: 'password', name: 'pass', label: _('Password'), labelPosition: 'top',
          on: {
            'onEnter': function (state, editor, ignoreUpdate) {
              referenceView.do_login(referenceView)
            }
          }
        },
        {view: 'button', value: _('Enter'), click: () => this.do_login(this)}
      ],
      rules: {
        login: webix.rules.isNotEmpty,
        pass: webix.rules.isNotEmpty
      }
    }

    function img (obj) {
      return '<img src="' + obj.src + '" class="content" ondragstart="return false"' + 'style="width:450px;height:200px;"' + '/>'
    }

    return {
      id: 'loginForm',
      css: {
        'background-image': 'url("assets/img/frame.png") !important',
        'background-repeat': 'no-repeat !important',
        'background-position': 'right bottom !important'
      },
      cols: [
        {
          rows: [
            {},
            {},
            {}]
        },
        {rows: [{}, login_form, {}]},
        {}]
    }
  }

  init (view) {
    const ip = this.app.config.remoteHOST
    const config = this.app.config
    const theme = this.app.config.theme
    const _ = this.app.getService('locale')._
    const referenceView = this
    this.app.callEvent('chartStaticUpdateStop')
    this.app.callEvent('chartStaticWagonUpdateStop')
    this.app.callEvent('chart3StaticCalibrationUpdateStop')
    this.app.callEvent('chart2StaticCalibrationUpdateStop')
    this.app.callEvent('chart1StaticCalibrationUpdateStop')
    this.app.callEvent('setExchange=nothing')
    // TODO: Смотреть первый ли запуск программы
    var showWindowSerial = true
    var id_serial = Math.random() * 99999999 + 'id_serial'
    var id_weight_number = Math.random() * 99999999 + 'id_weight_number'
    var id_activ_key = Math.random() * 99999999 + 'id_activ_key'

    function setSerial (serial, number) {
      var _methodName = 'setSerial'
      webix.ajax().post(
        ip,
        {'method': _methodName, 'user': 3, 'params': {'serial': serial, 'number': number}},
        function (text, xml, xhr) {
          var data = JSON.parse(text)
          console.log(data)
          if (data.method === _methodName) {
            if (data.answer === 'ok') {
              $$('login_form').show()
              serialWindow.hide()
              webix.message({type: 'success', text: _(data.params.message)})
            } else if (data.answer === 'error') {
              webix.message({type: 'error', text: _(data.params.message)})
            }
          }
        }
      )
    }

    function getSerial () {
      var _methodName = 'getSettings'
      webix.ajax().post(
        ip,
        {'method': _methodName, 'user': 3, 'params': {'id': 4}},
        function (text, xml, xhr) {
          var data = JSON.parse(text)
          console.log(data)
          if (data.method === _methodName) {
            if (data.answer === 'ok') {
              showWindowSerial = false
            }
          }
        }
      )
    }

    function getAcivatiionCode () {
      var _methodName = 'getProcessor'
      webix.ajax().post(
        ip,
        {'method': _methodName, 'user': 3, 'params': []},
        function (text, xml, xhr) {
          var data = JSON.parse(text)
          console.log(data)
          if (data.method === _methodName) {
            if (data.answer === 'ok') {
              $$(id_activ_key).setValue(data.params)
            }
          }
        }
      )
    }

    var serialWindow = webix.ui({
      view: 'window',
      css: theme,
      width: 800,
      modal: true,
      move: false,
      head: {
        view: 'toolbar', margin: -4, cols: [
          {view: 'label', label: _('Welcome'), width: 260},
          {}
        ]
      },
      body: {
        rows: [
          {},
          {
            cols: [
              {},
              {css: 'logo', width: 550, height: 140},
              {}
            ]
          },
          {},
          {
            height: 28,
            cols: [
              {},
              {view: 'label', label: _('Welcome message'), width: 550},
              {}
            ]
          },
          {
            height: 28,
            cols: [
              {},
              {view: 'label', label: _('Welcome message2'), width: 550},
              {}
            ]
          },
          {
            height: 28,
            cols: [
              {},
              {view: 'label', label: _('Welcome message3'), width: 550},
              {}
            ]
          },
          {
            height: 28,
            cols: [
              {},
              {view: 'label', label: _('Welcome message4'), width: 550},
              {}
            ]
          },
          {
            height: 28,
            cols: [
              {},
              {view: 'label', label: _('Welcome message5'), width: 550},
              {}
            ]
          },
          {
            height: 28,
            cols: [
              {},
              {view: 'label', label: _('Welcome message6'), width: 550},
              {}
            ]
          },
          {
            height: 28,
            cols: [
              {},
              {view: 'label', label: _('Welcome message7'), width: 550},
              {}
            ]
          },
          {
            height: 28,
            cols: [
              {},
              {view: 'label', label: _('Welcome message8'), width: 550},
              {}
            ]
          },
          {
            height: 28,
            cols: [
              {},
              {view: 'label', label: _('Welcome message9'), width: 550},
              {}
            ]
          },
          {
            height: 28,
            cols: [
              {},
              {view: 'label', label: _('Welcome message10'), width: 550},
              {}
            ]
          },
          {
            height: 28,
            cols: [
              {},
              {view: 'label', label: _('Welcome message11'), width: 550},
              {}
            ]
          },
          {height: 30},
          {
            cols: [
              {},
              {view: 'label', label: _('Activation key'), width: 130},
              {
                view: 'text', width: 400, id: id_activ_key, readonly: true
              },
              {}
            ]
          },
          {
            cols: [
              {},
              {view: 'label', label: _('Weight number'), width: 130},
              {
                view: 'text', width: 400, id: id_weight_number,
                on: {
                  'onEnter': function (state, editor, ignoreUpdate) {
                    $$('weight_number').$view.querySelector('input').focus()
                  }
                }
              },
              {}
            ]
          },
          {
            cols: [
              {},
              {view: 'label', label: _('Serial key'), width: 130},
              {
                view: 'text', width: 400, id: id_serial,
                on: {
                  'onEnter': function (state, editor, ignoreUpdate) {
                    var _serial = $$(id_serial).getValue()
                    var _number = $$(id_weight_number).getValue()
                    setSerial(_serial, _number)
                  }
                }
              },
              {}
            ]
          },
          {height: 10},
          {
            cols: [
              {},
              {
                view: 'button', width: 150, value: _('Approve'),
                click: function () {
                  var _serial = $$(id_serial).getValue()
                  var _number = $$(id_weight_number).getValue()
                  setSerial(_serial, _number)
                }
              },
              {}
            ]
          },
          {height: 10}]
      }
    })

    webix.extend($$('loginForm'), webix.ProgressBar)

    function show_progress_icon (delay) {
      const _configuration = referenceView.app.config.configuration
      $$('loginForm').disable()
      $$('loginForm').showProgress({
        type: 'icon',
        delay: delay,
        hide: true
      })
      setTimeout(function () {
        $$('loginForm').enable()
        $$('loginForm').$view.querySelector('input').focus()
        if (_configuration.isServerConnection) {
          getSerial()
          setTimeout(function () {
            if (showWindowSerial) {
              let width = $$('login').getTopParentView()['$width'] / 2 - 400
              let heigth = $$('login').getTopParentView()['$height'] / 2 - 400
              serialWindow.setPosition(width, heigth)
              serialWindow.show()
              $$('login_form').hide()
              $$(id_serial).$view.querySelector('input').focus()
              getAcivatiionCode()
            }
          }, 1000)
        } else {
          show_progress_icon(1000)
        }
      }, delay)
    }

    if (!config.debug) {
      show_progress_icon(4000)
    } else console.log('System launched')
  }

  do_login (xx) {
    const user = this.app.getService('user')
    const form = this.$$('login:form')
    window.storage = {} // для пространства имен, что бы много мусора в window не пихать
    window.storage.globalVar = xx
    if (form.validate()) {
      const data = form.getValues()
      user.login(data.login, data.pass, data.xx).catch(function () {
        webix.html.removeCss(form.$view, 'invalid_login')
        form.elements.pass.focus()
        webix.delay(function () {
          webix.html.addCss(form.$view, 'invalid_login')
        })
      })
    }
  }
}

import {JetView} from 'webix-jet'
import {getLangsList} from 'models/langslist'

import 'locales/webix/ru.js'

export default class AccessView extends JetView {
    config() {
        const _ = this.app.getService('locale')._;
        const ip = this.app.config.remoteHOST;
        const theme = this.app.config.theme;
        const User = this.app.config.user;

        webix.protoUI({name: 'activeList'}, webix.ui.list, webix.ActiveContent)

        function getCameras() {
            var _methodName = 'getCameras';
            webix.ajax().post(ip, {"method": "getCameras", "user": User, "params": []},
                function (text, xml, xhr) {
                    var _data = JSON.parse(text);
                    if (_data.method === _methodName) {
                        if (_data.answer === 'ok') {
                            $$('camerasList').clearAll();
                            $$('camerasList').parse(_data.params, 'json')
                        }
                    }
                })
        }

        function getCamera(obj) {
            var _methodName = 'getCamera';
            webix.ajax().post(
                ip,
                {'method': _methodName, 'user': User, 'params': {'id': obj}},
                function (text, xml, xhr) {
                    var _data = JSON.parse(text);
                    if (_data.method === _methodName) {
                        if (_data.answer === 'ok') {
                            $$('camerasSets').clear();
                            $$('camerasSets').setValues({
                                id: _data.params.id,
                                name: _data.params.name,
                                login: _data.params.login,
                                password: _data.params.password,
                                ip: _data.params.ip
                            })
                            // $$("camerasList").clearAll();
                            // $$("camerasList").parse(_data.params.//, "json");
                        } else {
                            webix.message({
                                type: 'error',
                                text: _(_data.params.message)
                            })
                        }
                    } else {
                        webix.message({
                            type: 'error',
                            text: _(_data.params.message)
                        })
                    }
                })
        }

        function _setCamera(obj) {
            var _methodName = 'setCamera';
            console.log(obj);
            webix.ajax().post(
                ip,
                {'method': _methodName, 'user': User, 'params': obj},
                function (text, xml, xhr) {
                    console.log(text);
                    var _data = JSON.parse(text);
                    if (_data.method === _methodName) {
                        if (_data.answer === 'ok') {
                            $$('camerasSets').clear();
                            $$('camerasSets').setValues(
                                {
                                    login: _('Enter login of the user here'),
                                    password: _('Enter the password of the user here'),
                                });
                            webix.message({type: 'info', text: _(_data.params.message)});
                        } else webix.message({type: 'error', text: _(_data.params.message)})
                    } else webix.message({type: 'error', text: _(_data.params.message)})
                })
        }

        function delCamera(obj) {
            var _methodName = 'delCamera';
            webix.ajax().post(
                ip,
                {'method': _methodName, 'user': User, 'params': {'id': obj}},
                function (text, xml, xhr) {
                    var _data = JSON.parse(text);
                    console.log(_data);
                    if (_data.method === _methodName) {
                        if (_data.answer === 'ok') {
                            webix.message({type: 'info', text: (_(_data.params.message))});
                            getCameras();
                        } else webix.message({type: 'error', text: _(_data.params.message)});
                    } else webix.message({type: 'error', text: _(_data.params.message)});
                })
        }

        function setCamera(obj) {
            _setCamera(obj);
            getCameras();
        }

        return {
            rows:
                [
                    {height: 5},
                    {
                        cols: [
                            {
                                rows: [
                                    {
                                        view: 'activeList',
                                        id: 'camerasList',
                                        select: true,
                                        minWidth: 560,
                                        activeContent: {
                                            deleteButton: {
                                                view: 'button',
                                                label: _('Delete'),
                                                width: 80,
                                                click: function () {
                                                    var item_id = this.config.$masterId;
                                                    delCamera(item_id);
                                                }
                                            },
                                            editButton: {
                                                view: 'button',
                                                label: _('Edit'),
                                                width: 80,
                                                click: function () {
                                                    var item_id = this.config.$masterId;
                                                    getCamera(item_id);
                                                }
                                            }
                                        },
                                        template: "<div class='title'>#name#<br>#ip#</div>" +
                                            "<div class='buttons'>{common.deleteButton()}</div><div class='buttons'>{common.editButton()}</div>",
                                        type: {
                                            height: 65
                                        }
                                    },
                                    {
                                        view: 'button', value: _('Add'), type: 'form',
                                        click: function () {
                                            var obj = {
                                                "name": _("camera"),
                                                "login": _("login"),
                                                "password": _("password"),
                                                "ip": ""
                                            };
                                            setCamera(obj)
                                        }
                                    }
                                ]
                            },
                            {width: 5},
                            {
                                rows: [
                                    {
                                        view: 'property', id: 'camerasSets', complexData: true,
                                        elements: [
                                            {label: _('Camera data'), type: 'label'},
                                            {label: _('ID'), id: 'id'},
                                            {label: _('Camera name'), type: 'text', id: 'name'},
                                            {label: _('Login'), type: 'text', id: 'login'},
                                            {label: _('Password'), type: 'text', id: 'password'},
                                            {label: _('IP'), type: 'text', id: 'ip'}
                                        ]
                                    },
                                    {
                                        view: 'button', value: _('Save'), click: function () {
                                            $$("camerasSets").editStop();
                                            var camera = $$('camerasSets').getValues();
                                            if (camera.login === null || camera.login === '' || camera.login === _('Enter login for the camera here')) {
                                                webix.message({
                                                    type: 'error',
                                                    text: _('Enter camera login')
                                                })
                                            } else if (camera.password === null || camera.password === '') {
                                                webix.message({
                                                    type: 'error',
                                                    text: _('Enter the camera password field')
                                                })
                                            } else if (camera.ip === null || camera.ip === '') {
                                                webix.message({
                                                    type: 'error',
                                                    text: _('Enter the camera ip field')
                                                })
                                            } else setCamera(camera);
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
        }
    }

    init() {
        const _ = this.app.getService('locale')._;
        const ip = this.app.config.remoteHOST;
        const User = this.app.config.user;

        function getCameras() {
            var _methodName = 'getCameras';
            webix.ajax().post(ip, {"method": "getCameras", "user": User, "params": []}, function (text, xml, xhr) {
                var _data = JSON.parse(text);
                if (_data.method === _methodName) {
                    if (_data.answer === 'ok') {
                        $$('camerasList').clearAll();
                        $$('camerasList').parse(_data.params, 'json');
                    }
                }
            })
        }

        getCameras();

        this.app.callEvent('setExchange=nothing');
        this.app.callEvent('chart3StaticCalibrationUpdateStop');
        this.app.callEvent('chart2StaticCalibrationUpdateStop');
        this.app.callEvent('chart1StaticCalibrationUpdateStop');
    }
}

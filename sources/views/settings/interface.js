import {JetView} from "webix-jet";
import {getLangsList} from "models/langslist";

import "locales/webix/ru.js";

export default class MainSettingsView extends JetView {
    config() {
        const _ = this.app.getService("locale")._;
        const lang = this.app.getService("locale").getLang();
        const theme = this.app.config.theme;
        const ip = this.app.config.remoteHOST;
        const User = this.app.config.user;
        const combo_theme_value = theme ? "1" : "0";
        const date_combo_value = this.app.config.dateFormat;
        const list_length_slider_value = this.app.config.listLength;
        const config = $$('mainTop').$scope.app.config;

        var _update_speed = config.counts;
        var referenceView = this;

        function setUser(language, update_speed) {
            var _methodName = "getSettings";
            var user = {};
            webix.ajax().post(
                ip,
                {"method": _methodName, "user": User, "params": {"id": User}},
                function (text, xml, xhr) {
                    var _data = JSON.parse(text);
                    console.log(_data);
                    if (_data.method === _methodName) {
                        if (_data.answer === "ok") {
                            user.id = _data.params.id;
                            user.user_name = _data.params.user_name;
                            user.credentials = _data.params.credentials;
                            user.phonenumber = _data.params.phonenumber;
                            user.locale = _data.params.locale;
                            user.backup = _data.params.backup;
                            user.explore_weight_arch = _data.params.explore_weight_arch;
                            user.explore_logs = _data.params.explore_logs;
                            user.printing = _data.params.printing;
                            user.adding_arch_data = _data.params.adding_arch_data;
                            user.cancel_weighting = _data.params.cancel_weighting;
                            user.change_arch_data = _data.params.change_arch_data;
                            user.change_wagon_number = _data.params.change_wagon_number;
                            user.add_user = _data.params.add_user;
                            user.calibration = _data.params.calibration;
                            user.verification = _data.params.verification;
                            user.configuration = _data.params.configuration;
                            user.save_archive = _data.params.save_archive;
                            user.save_events = _data.params.save_events;
                            user.table_configuration = _data.params.table_configuration;
                            user.tara_control = _data.params.tara_control;
                            if (config.debug) console.log(update_speed);
                            user.update_speed = update_speed;
                            user.locale = language;
                            _setUser(user);
                        }
                        else webix.message({
                            type: "error",
                            text: _(_data.params.message)
                        });
                    }
                    else webix.message({
                        type: "error",
                        text: _(_data.params.message)
                    });
                });
        }

        function _setUser(obj) {
            var methodName = "setSettings";
            webix.ajax().post(
                ip,
                {"method": methodName, "user": User, "params": obj},
                function (text, xml, xhr) {
                    var _data = JSON.parse(text);
                    console.log(_data);
                    if (_data.method === methodName) {
                        if (_data.answer === "ok") {
                            webix.message({type: "info", text: _(_data.params.message)});
                            var _config = $$('mainTop').$scope.app.config;
                            _config.counts = obj.update_speed;
                            _config.locale = obj.locale;
                            $$("language").setValue(obj.locale);
                            $$("update_speed").setValue(obj.update_speed);
                            newv => referenceView.app.config = _config;
                        }
                        else webix.message({type: "error", text: _(_data.params.message)});
                    }
                    else webix.message({type: "error", text: _(_data.params.message)});
                });
        }

        return {
            id: "interfaceView",
            rows: [
                {template: _("Settings"), type: "header", css: `webix_header ${theme}`},
                {
                    view: "form", elementsConfig: {labelPosition: "top"},
                    rules: {
                        $all: webix.rules.isNotEmpty
                    },
                    elements: [
                        {template: _("Regional settings"), type: "section"},
                        {
                            cols: [
                                {
                                    label: _("Language"), id: "language", view: "richselect",
                                    name: "lang", localId: "langs:combo",
                                    value: lang, gravity: 3,
                                    minWidth: 144,
                                    options: getLangsList(),
                                    on: {
                                        onChange: function (newlang) {
                                            this.$scope._lang = newlang;
                                            const country = this.getList().getItem(newlang).code;
                                            webix.i18n.setLocale(newlang + "-" + country);
                                        }
                                    }
                                },
                                {},
                                {
                                    label: _("Date format"), view: "richselect", hidden: true,
                                    name: "dateformat", value: date_combo_value, gravity: 3,
                                    minWidth: 207,
                                    options: [
                                        {value: "dd.mm.yyyy", id: "%d.%m.%Y"},
                                        {value: "dd/mm/yyyy hh:mm", id: "%d/%m/%Y %H:%i"},
                                        {value: "mm/dd/yyyy hh:mm", id: "%m/%d/%Y %H:%i"},
                                        {value: "dd.mm.yyyy hh:mm", id: "%d.%m.%Y %H:%i"},
                                        {value: "mm.dd.yyyy hh:mm", id: "%m.%d.%Y %H:%i"},
                                        {value: "d Month, hh:mm", id: "%j %F, %H:%i"}
                                    ],
                                    on: {
                                        onChange: newv => this.app.config.dateFormat = newv
                                    }
                                },
                                {},
                                {minWidth: 144, gravity: 3},
                                {gravity: 5}
                            ]
                        },
                        {template: _("Environment settings"), type: "section"},
                        {
                            hidden: true, cols: [
                                {
                                    label: _("Theme"), view: "richselect",
                                    name: "theme", minWidth: 144, gravity: 3,
                                    value: combo_theme_value,
                                    options: [
                                        {id: "0", value: _("Light")},
                                        {id: "1", value: _("Dark")}
                                    ],
                                    on: {
                                        onChange: newtheme => {
                                            const th = this.app.config.theme = newtheme === "1" ? "webix_dark" : "";
                                            try {
                                                webix.storage.local.put("bank_app_theme", th);
                                            }
                                            catch (err) {/* if cookies are blocked */
                                            }
                                        }
                                    }
                                },
                                {},
                                {
                                    label: _("Max list length"), view: "slider", hidden: true, minWidth: 207,
                                    min: 10, max: 1000, value: list_length_slider_value, step: 10, gravity: 3,
                                    on: {
                                        onChange: newv => this.app.config.listLength = newv
                                    }
                                },
                                {gravity: 9}
                            ]
                        },
                        {
                            cols:
                                [
                                    {
                                        name: 'update_speed',
                                        id: 'update_speed',
                                        min: 5,
                                        label: _("Speed of information update"),
                                        max: 50,
                                        view: "slider",
                                        minWidth: 207,
                                        value: _update_speed,
                                        step: 1,
                                        on: {
                                            "onAfterRender": function () {
                                                $$("_update_speed").bind($$("update_speed"));
                                            },
                                            "onSliderDrag": function () {
                                                var new_value = this.getValue();
                                                $$("_update_speed").setValue(new_value);
                                            }
                                        }
                                    },
                                    {
                                        view: "text", width: 55, id: "_update_speed", readonly: true,
                                        on: {
                                            "onChange": function (new_value, oldv) {
                                                $$("update_speed").setValue(new_value);
                                            }
                                        }
                                    },
                                    {label: _("In sec"), view: "label", minWidth: 20}
                                ]
                        },
                        {},
                        {},
                        {
                            margin: 10, cols: [
                                {
                                    view: "button", value: _("Default settings"),
                                    autowidth: true,
                                    click: function () {
                                        this.getFormView().setValues(this.$scope._defaults);
                                    }
                                },
                                {},
                                {
                                    id: "sssave", view: "button", value: _("Save"),
                                    autowidth: true,
                                    click: function () {
                                        var lang = $$("language").$scope._lang;
                                        var update_speed = $$("update_speed").getValue();
                                        setUser(lang, update_speed);
                                        this.$scope.app.getService("locale").setLang(this.$scope._lang);

                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    }

    init() {
        const User = this.app.config.user;
        const ip = this.app.config.remoteHOST;
        const _ = this.app.getService("locale")._;

        this.app.callEvent("setExchange=nothing");

        function getUser(obj) {
            var _methodName = "getSettings";
            webix.ajax().post(
                ip,
                {"method": _methodName, "user": User, "params": {"id": obj}},
                function (text, xml, xhr) {
                    var _data = JSON.parse(text);
                    console.log(_data);
                    if (_data.method === _methodName) {
                        if (_data.answer === "ok") {
                            $$("language").setValue(_data.params.locale);
                            $$("update_speed").setValue(_data.params.update_speed);
                        }
                        else webix.message({
                            type: "error",
                            text: _(_data.params.message)
                        });
                    }
                    else webix.message({
                        type: "error",
                        text: _(_data.params.message)
                    });
                });
        }

        getUser(User);
        this._lang = this.app.getService("locale").getLang();

        this._defaults = {
            lang: "en",
            update_speed: 5,
        };

        this.app.callEvent("chart3StaticCalibrationUpdateStop");
        this.app.callEvent("chart2StaticCalibrationUpdateStop");
        this.app.callEvent("chart1StaticCalibrationUpdateStop");
    }
}

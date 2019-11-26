import {JetView} from "webix-jet";
import {getLangsList} from "models/langslist";

import "locales/webix/ru.js";

export default class ReportBuilderView extends JetView {
    config() {
        const _ = this.app.getService("locale")._;
        const ip = this.app.config.remoteHOST;
        const theme = this.app.config.theme;
        const User = this.app.config.user;

        function getReports() {
            var _methodName = "getReports";
            webix.ajax().post(
                ip, {"method": "getReports", "user": User, "params": []},
                function (text, xml, xhr) {
                    var _data = JSON.parse(text);
                    if (_data.method === _methodName) {
                        var answer = _data.answer;
                        if (answer === "ok") {
                            $$("reportsList").clearAll();
                            $$("reportsList").parse(_data.params, "json");
                        }
                    }
                });
        }

        function getReport(obj) {
            var _methodName = "getReport";
            webix.ajax().post(
                ip,
                {"method": _methodName, "user": User, "params": {"id": obj}},
                function (text, xml, xhr) {
                    var _data = JSON.parse(text);
                    console.log(_data);
                    if (_data.method === _methodName) {
                        if (_data.answer === "ok") {
                            $$("sets").clear();
                            $$("sets").setValues({
                                id: _data.params.settings.id,
                                name: _data.params.settings.name,
                                statical: _data.params.settings.statical,
                                orientation: _data.params.settings.orientation,
                                one_wagon: _data.params.settings.one_wagon
                            });
                            $$("report").clearAll();
                            var resultCollumn = [];
                            var aData = ["write_date", "write_time", "direction", "wagon_number", "start_weight", "doc_start_weight",
                                "brutto", "cargo_weight", "overload", "doc_cargo_weight", "doc_number", "doc_date", "cargo_name",
                                "capacity", "truck1_weight", "ft_axis_1", "ft_axis_2", "ft_axis_3", "ft_axis_4", "truck2_weight",
                                "st_axis_1", "st_axis_2", "st_axis_3", "st_axis_4", "truck_diff", "side_diff", "offset_lengthwise", "cross_offset",
                                "speed", "sender", "reciever", "transporter", "departure_point", "destination_point", "cargo", "user",
                                "axels_count", "photo_path", "train_number", "wagon_type", "optional1", "optional2", "optional3",
                                "optional4", "optional5", "weight_type", "autofilling", "lastdateedited", "lasttimeedited", "lasttimeeditor"];
                            delete _data.params.columns.id;
                            for (var key in _data.params.columns) {
                                resultCollumn.push({
                                    "collumn": _(_data.params.columns[key]),
                                    "column": _data.params.columns[key],
                                    "hide": false
                                });
                                aData.splice(aData.indexOf(_data.params.columns[key]), 1);
                            }
                            aData.forEach(function (item, i, arr) {
                                resultCollumn.push({
                                    "collumn": _(item),
                                    "column": item,
                                    "hide": true
                                });
                            });
                            $$("report").parse(resultCollumn);
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

        function _setReport(obj) {
            var _methodName = "setReport";
            webix.ajax().post(
                ip, {"method": _methodName, "user": User, "params": obj},
                function (text, xml, xhr) {
                    var _data = JSON.parse(text);
                    console.log(_data);
                    if (_data.method === _methodName) {
                        if (_data.answer === "ok") {
                            $$("sets").clear();
                            $$("sets").setValues(
                                {
                                    name: _("Enter the name of the report here"),
                                    statical: 0,
                                    one_wagon: 0,
                                    orientation: _("landscape")
                                });
                            $$("report").clearAll();
                            $$("report").parse(data, "json");
                            webix.message({type: "info", text: _(_data.params.message)});
                        }
                        else webix.message({type: "error", text: _(_data.params.message)});
                    }
                    else webix.message({type: "error", text: _(_data.params.message)});
                });
        }

        function switchReport(obj, state) {
            var _methodName = "switchReport";
            webix.ajax().post(
                ip,
                {"method": _methodName, "user": User, "params": {"id": obj, "markCheckbox": state}},
                function (text, xml, xhr) {
                    var _data = JSON.parse(text);
                    console.log(_data);
                    if (_data.method === _methodName) {
                        if (_data.answer === "ok") {
                            webix.message({
                                type: "info",
                                text: _(_data.params.message)
                            });
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

        function delReport(obj) {
            var _methodName = "delReport";
            webix.ajax().post(
                ip,
                {"method": _methodName, "user": User, "params": {"id": obj}},
                function (text, xml, xhr) {
                    var _data = JSON.parse(text);
                    console.log(_data);
                    if (_data.method === _methodName) {
                        if (_data.answer === "ok") {
                            webix.message({type: "info", text: (_(_data.params.message))});
                        }
                        else webix.message({type: "error", text: _(_data.params.message)});
                    }
                    else webix.message({type: "error", text: _(_data.params.message)});
                });
        }

        function setReport(obj) {
            _setReport(obj);
            getReports();
        }

        var orientation_options = [
            {id: "landscape", value: _("landscape")},
            {id: "portrait", value: _("portrait")}
        ];

        function tree2grid(data, id) {
            data.collumn = data.collumn || -1;
            data.collumn = data.collumn || data.value;
            data.column = data.column || data.value;
            return data;
        }

        const data = [
            {"collumn": _("date"), "column": "write_date", "hide": false},
            {"collumn": _("time"), "column": "write_time", "hide": false},
            {"collumn": _("direction"), "column": "direction", "hide": false},
            {"collumn": _("wagon_number"), "column": "wagon_number", "hide": false},
            {"collumn": _("start_weight"), "column": "start_weight", "hide": false},
            {"collumn": _("doc_start_weight"), "column": "doc_start_weight", "hide": false},
            {"collumn": _("brutto"), "column": "brutto", "hide": false},
            {"collumn": _("cargo_weight"), "column": "cargo_weight", "hide": false},
            {"collumn": _("overload"), "column": "overload", "hide": false},
            {"collumn": _("doc_cargo_weight"), "column": "doc_cargo_weight", "hide": false},
            {"collumn": _("doc_number"), "column": "doc_number", "hide": false},
            {"collumn": _("doc_date"), "column": "doc_date", "hide": false},
            {"collumn": _("cargo_name"), "column": "cargo_name", "hide": false},
            {"collumn": _("capacity"), "column": "capacity", "hide": false},
            {"collumn": _("truck1_weight"), "column": "truck1_weight", "hide": false},
            {"collumn": _("ft_axis_1"), "column": "ft_axis_1", "hide": false},
            {"collumn": _("ft_axis_2"), "column": "ft_axis_2", "hide": false},
            {"collumn": _("ft_axis_3"), "column": "ft_axis_3", "hide": false},
            {"collumn": _("ft_axis_4"), "column": "ft_axis_4", "hide": false},
            {"collumn": _("truck2_weight"), "column": "truck2_weight", "hide": false},
            {"collumn": _("st_axis_1"), "column": "st_axis_1", "hide": false},
            {"collumn": _("st_axis_2"), "column": "st_axis_2", "hide": false},
            {"collumn": _("st_axis_3"), "column": "st_axis_3", "hide": false},
            {"collumn": _("st_axis_4"), "column": "st_axis_4", "hide": false},
            {"collumn": _("truck_diff"), "column": "truck_diff", "hide": false},
            {"collumn": _("side_diff"), "column": "side_diff", "hide": false},
            {"collumn": _("offset_lengthwise"), "column": "offset_lengthwise", "hide": false},
            {"collumn": _("cross_offset"), "column": "cross_offset", "hide": false},
            {"collumn": _("speed"), "column": "speed", "hide": false},
            {"collumn": _("sender"), "column": "sender", "hide": false},
            {"collumn": _("reciever"), "column": "reciever", "hide": false},
            {"collumn": _("transporter"), "column": "transporter", "hide": false},
            {"collumn": _("departure_point"), "column": "departure_point", "hide": false},
            {"collumn": _("destination_point"), "column": "destination_point", "hide": false},
            {"collumn": _("cargo"), "column": "cargo", "hide": false},
            {"collumn": _("axels_count"), "column": "axels_count", "hide": false},
            {"collumn": _("photo_path"), "column": "photo_path", "hide": false},
            {"collumn": _("train_number"), "column": "train_number", "hide": false},
            {"collumn": _("wagon_type"), "column": "wagon_type", "hide": false},
            {"collumn": _("optional1"), "column": "optional1", "hide": true},
            {"collumn": _("optional2"), "column": "optional2", "hide": true},
            {"collumn": _("optional3"), "column": "optional3", "hide": true},
            {"collumn": _("optional4"), "column": "optional4", "hide": true},
            {"collumn": _("optional5"), "column": "optional5", "hide": true},
            {"collumn": _("weight_type"), "column": "user", "hide": true},
            {"collumn": _("autofilling"), "column": "autofilling", "hide": true},
            {"collumn": _("lastdateedited"), "column": "lastdateedited", "hide": true},
            {"collumn": _("lasttimeedited"), "column": "lasttimeedited", "hide": true},
            {"collumn": _("lasttimeeditor"), "column": "lasttimeeditor", "hide": true}
        ];

        const ddata = {
            "write_date": 1,
            "write_time": 2,
            "direction": 3,
            "wagon_number": 4,
            "start_weight": 5,
            "doc_start_weight": 6,
            "brutto": 7,
            "cargo_weight": 8,
            "doc_cargo_weight": 9,
            "overload": 10,
            "doc_number": 11,
            "doc_date": 12,
            "cargo_name": 13,
            "capacity": 14,
            "truck1_weight": 15,
            "ft_axis_1": 16,
            "ft_axis_2": 17,
            "ft_axis_3": 18,
            "ft_axis_4": 19,
            "truck2_weight": 20,
            "st_axis_1": 21,
            "st_axis_2": 22,
            "st_axis_3": 23,
            "st_axis_4": 24,
            "truck_diff": 25,
            "side_diff": 26,
            "offset_lengthwise": 27,
            "cross_offset": 28,
            "speed": 29,
            "sender": 30,
            "reciever": 31,
            "transporter": 32,
            "departure_point": 33,
            "destination_point": 34,
            "cargo": 35,
            "user": 36,
            "axels_count": 37,
            "photo_path": 38,
            "train_number": 39,
            "wagon_type": 40,
            "optional1": 41,
            "optional2": 42,
            "optional3": 43,
            "optional4": 44,
            "optional5": 45,
            "weight_type": 46,
            "autofilling": 47,
            "lastdateedited": 48,
            "lasttimeedited": 49,
            "lasttimeeditor": 50
        };

        webix.protoUI({name: "activeList"}, webix.ui.list, webix.ActiveContent);
        return {
            rows: [
                {template: _("Report Builder"), type: "header", css: `webix_header ${theme}`},
                {height: 5},
                {
                    cols: [
                        {
                            rows: [
                                {
                                    view: "activeList",
                                    id: "reportsList",
                                    minWidth: 620,
                                    select: true,
                                    activeContent: {
                                        deleteButton: {
                                            view: "button",
                                            label: _("Delete"),
                                            width: 80,
                                            click: function () {
                                                var item_id = this.config.$masterId;
                                                delReport(item_id);
                                                getReports();
                                            }
                                        },
                                        editButton: {
                                            view: "button",
                                            label: _("Edit"),
                                            width: 80,
                                            on: {
                                                "onItemClick": function (id) {
                                                    var item_id = this.config.$masterId;
                                                    getReport(item_id);
                                                }
                                            }
                                        },
                                        markCheckbox: {
                                            view: "checkbox",
                                            width: 50,
                                            on: {
                                                "onChange": function (newv, oldv) {
                                                    var item_id = this.config.$masterId;
                                                    var state = this.getValue() ? switchReport(item_id, true) : switchReport(item_id, false);
                                                }
                                            }
                                        }
                                    },//<div class='rank'>#id#.</div>
                                    template: "<div class='title'>#name#<br>#count# " + _("collumns") + "</div>" +
                                    "<div class='buttons'>{common.editButton()}</div><div class='buttons'>{common.deleteButton()}</div>" + "<div class='checkbox'>{common.markCheckbox()}</div>",
                                    type: {
                                        height: 65
                                    },
                                },
                                {
                                    view: "button", value: _("Add"),
                                    type: "form",
                                    click: function () {
                                        var obj = {
                                            "settings": {
                                                "count": 50,
                                                "markCheckbox": false,
                                                "name": _("New report"),
                                                "orientation": "landscape",
                                                "statical": false
                                            }, "columns": ddata
                                        };
                                        setReport(obj);
                                    }
                                }
                            ]
                        },
                        {width: 5},
                        {
                            rows: [
                                {
                                    view: "property", id: "sets", complexData: true, height: 166,
                                    elements: [
                                        {label: _("Report"), type: "label"},
                                        {label: _("ID"), id: "id"},
                                        {
                                            label: _("Name"),
                                            type: "text",
                                            id: "name",
                                            value: _("Enter the name of the report here")
                                        },
                                        {
                                            label: _("Orientation"),
                                            type: "select",
                                            options: orientation_options,
                                            id: "orientation",
                                            value: "landscape"
                                        },
                                        {label: _("Statical"), type: "checkbox", id: "statical", value: 0},
                                        {label: _("For one wagon"), type: "checkbox", id: "one_wagon", value: 0},
                                        {label: _("Collumns"), type: "label"},
                                    ]
                                },
                                {
                                    view: "datatable",
                                    css: theme,
                                    id: "report",
                                    data: data,
                                    select: "multiselect",
                                    drag: true,
                                    externalData: tree2grid,
                                    columns: [
                                        {id: "collumn", header: _("Column"), css: "rank", fillspace: true},
                                        {id: "column", hidden: true},
                                        {
                                            id: "hide", header: _("Show"), adjust: "header", template: data => {
                                                if (data.hide === true) {
                                                    return "<div class='hide_element'></div>";
                                                }
                                                else
                                                    return "<div class='show_element'></div>";
                                            }
                                        }
                                    ],
                                    on: {
                                        "onItemClick": function (id, e, trg) {
                                            var item = ($$("report").getItem(id.row));

                                            if (item.hide === false) {
                                                item.hide = true;
                                                $$("report").updateItem(id, item);
                                            }
                                            else {
                                                item.hide = false;
                                                $$("report").updateItem(id, item);
                                            }
                                        }
                                    }
                                },
                                {
                                    view: "button", value: _("Save"), click: function () {
                                        $$("sets").editStop();
                                        var report = {};
                                        var report_columns = {};
                                        var report_count = 50;
                                        var i = 1;
                                        $$("report").eachRow(function (row) {
                                            const record = $$("report").getItem(row);
                                            // { id:row, title:"Film", year:2019 }
                                            if (record.hide !== true) {
                                                report_columns[record.column] = i;
                                                i = i + 1;
                                            }
                                            else {
                                                report_count = report_count - 1;
                                                report_columns[record.column] = 0;
                                                i = i + 1;
                                            }
                                        });
                                        report["settings"] = $$("sets").getValues();
                                        report["columns"] = report_columns;
                                        if (report.settings.id === "") {
                                            delete report.settings.id;
                                        }
                                        if (report.settings.statical === "") {
                                            report.settings.statical = false;
                                        }
                                        if (report.settings.name === _("Enter the name of the report here")) {
                                            report.settings.name = "";
                                        }
                                        report.settings["count"] = report_count;
                                        report.settings["markCheckbox"] = true;
                                        if (report.settings.name === "") {
                                            webix.message({type: "error", text: _("Enter the name of the report")});
                                        }
                                        else {
                                            setReport(report);
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }]
        };
    }

    init() {
        const ip = this.app.config.remoteHOST;
        const User = this.app.config.user;

        function getReports() {
            var _methodName = "getReports";
            webix.ajax().post(
                ip, {"method": "getReports", "user": User, "params": []},
                function (text, xml, xhr) {
                    var data = JSON.parse(text);
                    console.log(data);
                    if (data.method === _methodName) {
                        if (data.answer === "ok") {
                            $$("reportsList").parse(data.params, "json");
                        }
                    }
                });
        }

        function closeCalibrationWindows() {
            try {
                var lockWindowName = $$("lockWindow").getValue();
                if ($$(lockWindowName).isVisible() === true) $$(lockWindowName).destructor();
            }
            catch (e) {
                //console.log(e);
            }
            try {
                var warningWindowName = $$("warningWindow").getValue();
                if ($$(warningWindowName).isVisible() === true) $$(warningWindowName).destructor();
            }
            catch (e) {
                //console.log(e);
            }
        }

        closeCalibrationWindows();

        var report_set = [
            {id: 1, name: "Отчет о взвешивании", count: 12, markCheckbox: 1},
            {id: 2, name: "Отчет по вагонам", count: 8, markCheckbox: 0},
            {id: 3, name: "Отчет по составам", count: 6},
            {id: 4, name: "Отчет по поставщику", count: 5, markCheckbox: 1},
            {id: 15, name: "Отчет по отправителям", count: 5, markCheckbox: 1},
        ];

        //$$("reportsList").parse(report_set, "json");
        getReports();
        this.app.callEvent("setExchange=nothing");
        this.app.callEvent("chartStaticTruckUpdateStop");
        this.app.callEvent("chartStaticWagonUpdateStop");
        this.app.callEvent("chart3StaticCalibrationUpdateStop");
        this.app.callEvent("chart2StaticCalibrationUpdateStop");
        this.app.callEvent("chart1StaticCalibrationUpdateStop");
        this.app.callEvent("setMessage=Waiting");
        this.app.callEvent("chartWeighingDynamicClear");
    }
}

import {JetView} from "webix-jet";

export default class StaticCalibration extends JetView {
    config() {
        const _ = this.app.getService("locale")._;
        const theme = this.app.config.theme;
        const config = $$('mainTop').$scope.app.config.configuration;
        const ip = this.app.config.remoteHOST;
        const User = this.app.config.user;
        const referenceView = this;
        const ids = this.app.config.ids;
        const info = $$('mainTop').$scope.app.config.globals.hardware;
        const company = $$('mainTop').$scope.app.config.globals.organizationName;

        var kleimo;
        var last_verification_id = 1;
        var verification_data_for_table = [];
        var heigth_for_verification_journal = 60;

        var dt1 = "dt1111" + ids.dt1;
        var win1_reports = "win02" + ids.dt1;
        var win_verification = "win1_verification" + ids.dt1;
        var button_print = "button_print" + ids.dt1;
        var table_for_print = "static_verification_table_for_print" + ids.dt1;
        var table_for_verification = "static_verification_table_for_verification" + ids.dt1;
        var zvo_representative = "static_zvo_representative_" + ids.dt1;
        var goveverifier = "static_goveverifier_" + ids.dt1;
        var company_representative = "static_company_representative_" + ids.dt1;
        var for_print = "for_print_static_verif" + ids.dt1;
        ids.dt1 = ids.dt1 + 1;
        newv => this.app.config.ids = ids;

        var mode = false; // потележечно = false, повагонно = true
        var started = false; // начата ли поверка
        var truck = false; // номер тележки: false = 1, true = 2

        var position_options = [
            {id: _("left"), value: _("left")},
            {id: _("right"), value: _("right")},
            {id: _("center"), value: _("center")}
        ];

        var platform_options = [
            {id: _("Platform #1"), value: _("platform#1")},
            {id: _("Platform #1"), value: _("platform#2")},
            {id: _("Both"), value: _("both")}
        ];

        var data = [{
            "id": 1,
            "time": "00:00:00",
            "name": _("platform#1"),
            "position": _("left"),
            "real_weight": 0,
            "measured_weight": 0,
            "imprecisionKG": 0,
            "imprecisionPercent": 0
        },
        {
            "id": 2,
            "time": "00:00:00",
            "name": 2,
            "real_weight": 0,
            "measured_weight": 0,
            "imprecisionKG": 0,
            "imprecisionPercent": 0
        },
        {
            "id": 3,
            "time": "00:00:00",
            "name": "Sum",
            "real_weight": 0,
            "measured_weight": 0,
            "imprecisionKG": 0,
            "imprecisionPercent": 0
        }];

        var result = [];
        var iteration = 1;

        function getKleimo() {
			var _methodName = "getKleimo";
			webix.ajax().post(
				ip, {"method": _methodName, "user": User, "params": []},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							kleimo = data.params;
						}
						else if (data.params === "No kleimo") webix.message({type: "info", text: _(data.params)});
						else webix.message({type: "error", text: _(data.params.message)});
					}
				});
		}

        function setLastVerification() {
            var _methodName = 'setLastVerification';
            webix.ajax().post(ip,
                {"method": _methodName, "user": User, "params": {"date": new Date()}},
                function (text, xml, xhr) {
                    var _data = JSON.parse(text);
                    if (_data.method === _methodName) {
                        if (_data.answer === 'ok') {
                            webix.message({type: "info", text: _(_data.params.message)})
                        }
                    }
                })
        }

        function getVerificationArchive() {
            var _methodName = 'getVerificationArchive';
            webix.ajax().post(ip,
                {"method": _methodName, "user": User, "params": ["static"]},
                function (text, xml, xhr) {
                    var data = JSON.parse(text);
                    console.log(data);
                    if (data.method === _methodName) {
                        if (data.answer === 'ok') {
                            verification_data_for_table = data.params.verifications;
                            var _id = 0;
                            verification_data_for_table.forEach(function (item, i, arr) {
                                heigth_for_verification_journal += 40;
                                if (item.id === null || item.id === "" || item.id === undefined || isNaN(item.id)) _id = 0;
                                else _id = item.id;
                                if (last_verification_id < _id) last_verification_id = _id + 1;
                            });
                        }
                    }
                })
        }

        function setVerificationArchive() {
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1; //January is 0!
            var yyyy = today.getFullYear();
            var _date = "";
            if (dd < 10) dd = "0" + dd;
            if (mm < 10) mm = "0" + mm;
            _date = yyyy + "-" + mm + "-" + dd;
            try {
							kleimo = kleimo[0];
							kleimo = parseInt(kleimo);
            }
            catch (e){
                console.log(e);
            }
            //id verification_date weigher_person verification_person owner_person stamp weighing_type
            var params = {id: last_verification_id, verification_date: _date, weigher_person: $$("static_zvo_representative").getValue(),
                verification_person : $$("static_gov_verifier").getValue(), owner_person: $$("static_company_representative").getValue(), stamp: kleimo, weighing_type: "static"};
            var _methodName = 'setVerificationArchive';
            webix.ajax().post(ip,
                {"method": _methodName, "user": User, "params": params},
                function (text, xml, xhr) {
                    var _data = JSON.parse(text);
                    console.log(_data);
                    if (_data.method === _methodName) {
                        if (_data.answer === 'ok') {
                            webix.message({type: "info", text: _(_data.params.message)})
                        }
                    }
                })
        }

        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        if (dd < 10) dd = "0" + dd;
        if (mm < 10) mm = "0" + mm;
        var current_date = dd + "." + mm + "." + today.getFullYear() + _("yyyy");

        const verification_journal = {
            view: "window",
            css: theme,
            id: win_verification,
            height: 400,
            width: 800,
            move: true,
            head: {
                view: "toolbar", margin: -4, cols: [
                    {view: "label", label: _("Verification journal"), width: 760},
                    {
                        view: "label",
                        template: function (obj) {
                            var html = "<div class='del_element'>";
                            return html + "</div>";
                        },
                        click: function () {
                            $$(win_verification).hide();
                        }
                    },
                ]
            },
            body: {
                view: "scrollview", scroll: "y", body: {
                    rows: [
                        {
                            view: "form", elements: [
                                {
                                    cols: [
                                        {},
                                        {
                                            rows: [
                                                {
                                                    view: "datatable",
                                                    id: table_for_verification,
                                                    editable: true,
                                                    height: 270,
                                                    width: 750,
                                                    resizeColumn: {headerOnly: true},
                                                    select: false,
                                                    scroll: true,
                                                    navigation: true,
                                                    hover: "myhover",
                                                    columns: [
                                                        {
                                                            id: "id",
                                                            header: _("_number"),
                                                            adjust: true,
                                                            sort: "int"
                                                        },
                                                        {
                                                            id: "verification_date",
                                                            header: _("date"),
                                                            adjust: true,
                                                            sort: "int"
                                                        },
                                                        {
                                                            id: "weigher_person",
                                                            header: _("zvo_representative"),
                                                            adjust: true,
                                                            sort: "int",
                                                        },
                                                        {
                                                            id: "verification_person",
                                                            header: _("verificator"),
                                                            adjust: true,
                                                            sort: "int",
                                                        },
                                                        {
                                                            id: "owner_person",
                                                            header: _("company_representative"),
                                                            adjust: true,
                                                            sort: "int",
                                                        },
                                                        {
                                                            id: "stamp",
                                                            header: _("kleimo"),
                                                            adjust: true,
                                                        },
                                                        {
                                                            id: "weighing_type",
                                                            header: _("weighing_type"),
                                                            adjust: "header",
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        {},
                                    ]
                                }
                            ]
                        }]
                }
            }
        };

        const popup = {
            view: "window",
            css: theme,
            id: win1_reports,
            height: 690,
            width: 1160,
            move: true,
            head: {
                view: "toolbar", margin: -4, cols: [
                    {view: "label", label: _("Verification report"), width: 300},
                    {},
                    {
                        width: 40,
                        view: "label",
                        template: function (obj) {
                            var html = "<div class='del_element'>";
                            return html + "</div>";
                        },
                        click: function () {
                            $$(win1_reports).hide();
                        }
                    },
                ]
            },
            body: {
                view: "scrollview", id: for_print, scroll: "y", body: {
                    rows: [
                        {
                            view: "form", elements: [
                                {
                                    cols: [
                                        {width: 10},
                                        {
                                            rows: [
                                                {
                                                    cols: [
                                                        {},
                                                        {
                                                            view: "label",
                                                            label: (_("Verification report from ") + current_date),
                                                            width: 350
                                                        },
                                                        {}
                                                    ]
                                                },
                                                {height: 40},
                                                {
                                                    cols: [
                                                        {label: _("Organization:"), view: "label", width: 120},
                                                        {view: "text", width: 574, height: 30, value: company},
                                                        {},
                                                    ]
                                                },
                                                {
                                                    hidden: true, cols: [
                                                        {label: _("Weighing place:"), view: "label", width: 120},
                                                        {view: "text", width: 200, height: 30},
                                                        {},
                                                    ]
                                                },
                                                {
                                                    cols: [
                                                        {label: _("Type of weights"), view: "label", width: 160},
                                                        {view: "text", width: 140, height: 30, value: info.typeOfScales},
                                                        {width: 10},
                                                        {label: _("Serial #"), view: "label", width: 160},
                                                        {view: "text", width: 100, height: 30, value: info.serialNumber},
                                                        {width: 10},
                                                        {label: "MAX", view: "label", width: 50},
                                                        {view: "text", width: 70, height: 30, value: ""},
                                                        {}
                                                    ]
                                                },
                                                {height: 10},
                                                {
                                                    view: "datatable",
                                                    id: table_for_print,
                                                    editable: true,
                                                    height: 270,
                                                    width: 700,
                                                    resizeColumn: {headerOnly: true},
                                                    select: false,
                                                    scroll: false,
                                                    navigation: false,
                                                    hover: "myhover",
                                                    data: data,
                                                    columns: [
                                                        {
                                                            id: "time",
                                                            header: _("time"),
                                                            adjust: true,
                                                            sort: "int"
                                                        },
                                                        {
                                                            id: "id",
                                                            header: "#",
                                                            adjust: true,
                                                            sort: "int",
                                                            hidden: true
                                                        },
                                                        {
                                                            id: "platform1",
                                                            header: _("platform1"),
                                                            adjust: true,
                                                            sort: "int",
                                                        },
                                                        {
                                                            id: "platform2",
                                                            header: _("platform2"),
                                                            adjust: true,
                                                            sort: "int",
                                                        },
                                                        {
                                                            id: "both",
                                                            header: _("Summary weigth"),
                                                            adjust: true,
                                                            sort: "int",
                                                        },
                                                        {
                                                            id: "nnumber",
                                                            header: _("number"),
                                                            adjust: true,
                                                            hidden: true
                                                        },
                                                        {
                                                            id: "weight_position",
                                                            header: _("weight_position"),
                                                            adjust: true,
                                                            hidden: true
                                                        },
                                                        {
                                                            id: "platform",
                                                            header: _("platform"),
                                                            adjust: true,
                                                            hidden: true
                                                        },
                                                        {id: "real_weight", header: _("real_weight"), adjust: true},
                                                        {
                                                            id: "measured_weight",
                                                            header: _("measured_weight"),
                                                            adjust: true
                                                        },
                                                        {id: "imprecisionKG", header: _("infelicityKG"), adjust: true},
                                                        {
                                                            id: "imprecisionPercent",
                                                            header: _("infelicity%"),
                                                            adjust: true,
                                                            hidden: true
                                                        }
                                                    ]
                                                },
                                                {},
                                                {
                                                    cols:
                                                        [
                                                            {label: _("ZVO Representative"), view: "label", width: 280},
                                                            {
                                                                id: zvo_representative,
                                                                label: "",
                                                                view: "label",
                                                                width: 280
                                                            },
                                                            {label: _("Sign:"), view: "label", width: 100},
                                                            {
                                                                label: "________________________________________________________________________",
                                                                view: "label",
                                                                width: 300
                                                            },
                                                            {}
                                                        ]
                                                },
                                                {
                                                    cols:
                                                        [
                                                            {
                                                                label: _("Company Representative"),
                                                                view: "label",
                                                                width: 280
                                                            },
                                                            {
                                                                id: company_representative,
                                                                label: "",
                                                                view: "label",
                                                                width: 280
                                                            },
                                                            {label: _("Sign:"), view: "label", width: 100},
                                                            {
                                                                label: "________________________________________________________________________",
                                                                view: "label",
                                                                width: 300
                                                            },
                                                            {}
                                                        ]
                                                },
                                                {
                                                    cols:
                                                        [
                                                            {label: _("Gov.verifier"), view: "label", width: 280},
                                                            {id: goveverifier, label: "", view: "label", width: 280},
                                                            {label: _("Sign:"), view: "label", width: 100},
                                                            {
                                                                label: "________________________________________________________________________",
                                                                view: "label",
                                                                width: 300
                                                            },
                                                            {}
                                                        ]
                                                }
                                            ]
                                        },
                                        {width: 10},
                                    ]
                                },
                                {
                                    view: "button",
                                    type: "form",
                                    value: _("Print"),
                                    id: button_print,
                                    click: function () {
                                        $$(button_print).hide();
                                        webix.print($$(for_print), {
                                            mode: "landscape",
                                            fit: "data",
                                            docHeader: "",
                                            docFooter: ""
                                        });
                                        setVerificationArchive();
                                        getVerificationArchive();
                                        $$(button_print).show();
                                        $$(win1_reports).hide();
                                    }
                                }
                            ]
                        }]
                }
            }
        };

        function tableParseForVerificationJournal(obj, height) {
            setTimeout(function () {
                $$(table_for_verification).clearAll();
                $$(table_for_verification).parse(obj);
                $$(table_for_verification).define("height", height);
                $$(table_for_verification).resize();
            }, 1000);
        }

        function tableParse(obj, height) {
            setTimeout(function () {
                var _height = height;
                $$(table_for_print).clearAll();
                $$('static_verification_table').eachRow(function (_row) {
                    const obj = $$('static_verification_table').getItem(_row);
                    var _record = {};
                    _record.id = obj.id;
                    _record.imprecisionKG = obj.imprecisionKG;
                    _record.measured_weight = obj.measured_weight;
                    _record.real_weight = obj.real_weight;
                    _record.time = obj.time;
                    if (obj.name === _("platform#1")) {
                        _record.platform1 = obj.position;
                        _record.platform2 = "";
                        _record.both = ""
                    }
                    else if (obj.name === _("platform#2")) {
                        _record.platform1 = "";
                        _record.platform2 = obj.position;
                        _record.both = ""
                    }
                    else if (obj.name === _("both")) {
                        _record.platform1 = "";
                        _record.platform2 = "";
                        _record.both = obj.position;
                    }
                    result.push(_record);
                });
                _height += 40 * result.length;
                $$(table_for_print).parse(result);
                $$(table_for_print).define("height", _height);
                $$(table_for_print).resize();
                $$(zvo_representative).setValue($$("static_zvo_representative").getValue());
                $$(goveverifier).setValue($$("static_gov_verifier").getValue());
                $$(company_representative).setValue($$("static_company_representative").getValue());
            }, 1000);
        }

        var platform;
        if (config.wagon_weighing === 1) platform = {
            id: "name",
            header: _("# of platform"),
            adjust: true,
            sort: "int",
            editor: "select",
            options: [_("platform#1"), _("platform#2"), _("both")]
        };
        else platform = {
            id: "name",
            header: _("# of platform"),
            adjust: true,
            sort: "int",
            editor: "select",
            options: [_("platform#1")]
        };

        getKleimo();
        getVerificationArchive();

        return {
            view: "scrollview", scroll: "y", id: "static-verification", body: {
                view: "form", elementsConfig: {labelPosition: "top"},
                rules: {
                    $all: webix.rules.isNotEmpty
                },
                elements: [
                    {
                        cols: [
                            {
                                cols: [{width: 5}, {
                                    rows: [
                                        {
                                            view: "button", value: _("Verification archive"),
                                            autowidth: true, popup: verification_journal,
                                            click: function () {
                                                tableParseForVerificationJournal(verification_data_for_table, heigth_for_verification_journal);
                                            }
                                        },
                                        {}
                                    ]
                                }, {}]
                            },
                            {
                                rows: [
                                    {
                                        cols: [
                                            {},
                                            {label: _("Verification date"), view: "label", width: 120},
                                            {id: "lastVerification", view: "text", width: 100},
                                            {}
                                        ]
                                    },
                                    {height: 10},
                                    {
                                        cols:
                                            [
                                                {label: _("ZVO Representative"), view: "label", width: 280},
                                                {id: "static_zvo_representative", view: "text", width: 300, height: 40},
                                                {}
                                            ]
                                    },
                                    {
                                        cols:
                                            [
                                                {
                                                    label: _("Company Representative"),
                                                    view: "label",
                                                    width: 280
                                                },
                                                {
                                                    id: "static_company_representative",
                                                    view: "text",
                                                    width: 300,
                                                    height: 40
                                                },
                                                {}
                                            ]
                                    },
                                    {
                                        cols:
                                            [
                                                {label: _("Gov.verifier"), view: "label", width: 280},
                                                {id: "static_gov_verifier", view: "text", width: 300, height: 40},
                                                {}
                                            ]
                                    }]
                            },
                            {}
                        ]
                    },
                    {
                        hidden: true, cols: [
                            {},
                            {
                                view: "select", width: 150, editor: "select", hidden: true,
                                label: _('Platform'), id: "_platform", labelAlign: "center",
                                value: 1, options: platform_options
                            },
                            {width: 10},
                            {
                                view: "select", width: 150, hidden: true,
                                label: _('Weight position'), id: "_weight_position", labelAlign: "center",
                                value: 1, options: position_options
                            },
                            {}
                        ]
                    },
                    {
                        hidden: false,
                        cols: [
                            {},
                            {label: _("Summary weigth"), view: "label", width: 90},
                            {id: "verification_weigth", view: "text", width: 80, height: 30},
                            {width: 10},
                            {label: _("Truck 1"), view: "label", width: 90},
                            {id: "verification_truck_1", view: "text", width: 80, height: 30},
                            {width: 10},
                            {label: _("Truck 2"), view: "label", width: 90},
                            {id: "verification_truck_2", view: "text", width: 80, height: 30},
                            {width: 10},
                            {label: _("Time"), view: "label", width: 60},
                            {id: "verification_time", view: "text", width: 85, height: 30},
                            {
                                hidden: true,
                                view: "button",
                                value: _("Set weigth"),
                                width: 100,
                                css: "bt_1",
                                click: function () {
                                    if (started === true) {
                                        if (mode === false) {
                                            if (truck === false) {
                                                referenceView.app.callEvent("setConnection=verification.truck2");
                                                webix.message({type: "default", text: _("Weigth complete")});
                                                truck = true;
                                            }
                                            else {
                                                referenceView.app.callEvent("setExchange=pause");
                                                webix.message({type: "default", text: _("Weigth complete")});
                                                truck = false;
                                            }
                                        }
                                        else {
                                            referenceView.app.callEvent("setExchange=pause");
                                            webix.message({type: "default", text: _("Weigth complete")});
                                        }
                                    }
                                    else webix.message({type: "error", text: _("Start weighing first")})
                                }
                            },
                            {}
                        ]
                    },
                    {
                        cols: [
                            {},
                            {width: 10},
                            {
                                rows: [
                                    {
                                        cols: [
                                            {},
                                            {
                                                height: 35, view: "button", value: _("Add"), autowidth: true,
                                                click: function () {
                                                    //var item = $$('static_verification_table').getItem(1);
                                                    //var item2 = $$('static_verification_table').getItem(2);
                                                    //var _item = $$('static_verification_table').getItem(3);
//
                                                    //result[iteration] = {
                                                    //    "info": $$("_weight_position").getValue(),
                                                    //    1: {
                                                    //        id: item.id,
                                                    //        time: item.time,
                                                    //        name: item.name,
                                                    //        real_weight: item.real_weight,
                                                    //        measured_weight: item.measured_weight,
                                                    //        imprecisionKG: item.imprecisionKG,
                                                    //        imprecisionPercent: item.imprecisionPercent
                                                    //    },
                                                    //    2: {
                                                    //        id: item2.id,
                                                    //        time: item.time,
                                                    //        name: item2.name,
                                                    //        real_weight: item2.real_weight,
                                                    //        measured_weight: item2.measured_weight,
                                                    //        imprecisionKG: item2.imprecisionKG,
                                                    //        imprecisionPercent: item2.imprecisionPercent
                                                    //    },
                                                    //    "sum": {
                                                    //        id: _item.id,
                                                    //        time: item.time,
                                                    //        name: _item.name,
                                                    //        real_weight: _item.real_weight,
                                                    //        measured_weight: _item.measured_weight,
                                                    //        imprecisionKG: _item.imprecisionKG,
                                                    //        imprecisionPercent: _item.imprecisionPercent
                                                    //    }
                                                    //};
                                                    //$$("verificationList").add({id: iteration}, 0);
                                                    //iteration = iteration + 1;
                                                    var data = {
                                                        "name": _("platform#1"),
                                                        "position": _("left"),
                                                        "time": "00:00:00",
                                                        "real_weight": 0,
                                                        "measured_weight": 0,
                                                        "imprecisionKG": 0,
                                                        "imprecisionPercent": 0
                                                    };
                                                    $$('static_verification_table').add(data);
                                                    referenceView.app.callEvent("exchange");
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        view: "datatable",
                                        id: "static_verification_table",
                                        editable: true,
                                        height: 360,
                                        width: 870,
                                        scroll: "y",
                                        resizeColumn: {headerOnly: true},
                                        select: "row",
                                        math: true,
                                        navigation: true,
                                        hover: "myhover",
                                        data: data,
                                        columns: [
                                            {id: "id", header: "#", adjust: true, sort: "int", "hidden": true},
                                            platform,
                                            {
                                                id: "position",
                                                header: _("position"),
                                                adjust: true,
                                                sort: "int",
                                                editor: "select",
                                                options: [_("left"), _("right"), _("center")]
                                            },
                                            {id: "time", header: "time", adjust: true, "hidden": true},
                                            {
                                                id: "real_weight", header: _("real_weight"), adjust: true,
                                                editor: "text", format: function (value) {
                                                    return webix.i18n.intFormat(value);
                                                },
                                                editParse: function (value) {
                                                    return webix.Number.parse(value, {
                                                        groupSize: webix.i18n.groupSize,
                                                        groupDelimiter: webix.i18n.groupDelimiter
                                                    });
                                                },
                                                editFormat: function (value) {
                                                    return webix.i18n.intFormat(value);
                                                }
                                            },
                                            {
                                                id: "measured_weight", header: _("measured_weight"), adjust: true,
                                                format: function (value) {
                                                    return webix.i18n.intFormat(value);
                                                },
                                                editParse: function (value) {
                                                    return webix.Number.parse(value, {
                                                        groupSize: webix.i18n.groupSize,
                                                        groupDelimiter: webix.i18n.groupDelimiter
                                                    });
                                                },
                                                editFormat: function (value) {
                                                    return webix.i18n.intFormat(value);
                                                }
                                            },
                                            {
                                                id: "imprecisionKG", header: _("infelicityKG"), adjust: true
                                            },
                                            {
                                                id: "imprecisionPercent",
                                                hidden: true,
                                                header: _("infelicity%"),
                                                adjust: true
                                            },
                                            {
                                                id: "save", header: "", width: 40,
                                                adjust: true, template: data => {
                                                    if (data.save === 1) {
                                                        return `<span class='webix_icon wxi wxi-success ${data.status}'></span>`;
                                                    }
                                                    else
                                                        return "<div class='add_element'></div>";
                                                }
                                            }
                                        ],
                                        on: {
                                            "onAfterEditStop": function (state, editor, ignoreUpdate) {
                                                if (editor.column === "real_weight") {
                                                    var row = editor.row;
                                                    try {
                                                        var obj = $$('static_verification_table').getItem(row);
                                                    }
                                                    catch (e) {
                                                        console.log(e);
                                                        return false;
                                                    }
                                                    //math:"[$r,brutto] - [$r,cargo_weight]",
                                                    var measured_weight = obj.measured_weight;
                                                    if (measured_weight === null || measured_weight === "" || measured_weight === undefined || isNaN(measured_weight)) measured_weight = 0;
                                                    if (measured_weight !== 0) {
                                                        if (measured_weight > obj.real_weight) obj.imprecisionKG = measured_weight - obj.real_weight;
                                                        else obj.imprecisionKG = obj.real_weight - measured_weight;
                                                        obj.imprecisionPercent = obj.imprecisionKG / obj.real_weight;
                                                    }
                                                    $$("static_verification_table").updateItem(obj.id, obj);
                                                }

                                            },
                                            "onItemClick": function (id, e, trg) {
                                                if (id.column === "save") {
                                                    var check = $$("static_verification_table").getItem(id);
                                                    if (check.save !== 1) {
                                                        if (config.wagon_weighing) {
                                                            var weight = $$('verification_weigth').getValue();
                                                            if (weight === null || weight === "" || weight === undefined || isNaN(weight)) weight = 0;
                                                            var truck_1 = $$('verification_truck_1').getValue();
                                                            if (truck_1 === null || truck_1 === "" || truck_1 === undefined || isNaN(truck_1)) truck_1 = 0;
                                                            var truck_2 = $$('verification_truck_2').getValue();
                                                            if (truck_2 === null || truck_2 === "" || truck_2 === undefined || isNaN(truck_2)) truck_2 = 0;
                                                            var current_time = $$('verification_time').getValue();
                                                            if (current_time === null || current_time === "" || current_time === undefined) current_time = 0;
                                                            if (weight === 0 || truck_1 === 0 || truck_2 === 0 || current_time === 0) {
                                                                webix.message({
                                                                    text: _("Now weigth on the platform"),
                                                                    type: "error",
                                                                    expire: 5000
                                                                });
                                                                return false;
                                                            }
                                                            else {
                                                                //[_("platform#1"), _("platform#2"), _("both")]
                                                                var obj = $$("static_verification_table").getSelectedItem();
                                                                var real_weight = obj.real_weight;
                                                                if (real_weight === null || real_weight === "" || real_weight === undefined || isNaN(real_weight)) real_weight = 0;
                                                                if (obj.name === _("platform#1")) {
                                                                    obj.measured_weight = truck_1;
                                                                }
                                                                else if (obj.name === _("platform#2")) {
                                                                    obj.measured_weight = truck_2;
                                                                }
                                                                else {
                                                                    obj.measured_weight = weight;
                                                                }
                                                                obj.time = current_time;
                                                                if (real_weight !== 0) {
                                                                    if (real_weight > weight) obj.imprecisionKG = real_weight - weight;
                                                                    else obj.imprecisionKG = weight - real_weight;
                                                                    obj.imprecisionPercent = obj.imprecisionKG / real_weight;
                                                                }
                                                                obj.save = 1;
                                                                $$("static_verification_table").updateItem(obj.id, obj);
                                                            }
                                                        }
                                                        else {
                                                            var weight = $$('verification_weigth').getValue();
                                                            if (weight === null || weight === "" || weight === undefined || isNaN(weight)) weight = 0;
                                                            var current_time = $$('verification_time').getValue();
                                                            if (current_time === null || current_time === "" || current_time === undefined) current_time = 0;
                                                            if (weight === 0 || current_time === 0) {
                                                                webix.message({
                                                                    text: _("You must set weigth first"),
                                                                    type: "error",
                                                                    expire: 5000
                                                                });
                                                                return false;
                                                            }
                                                            else {
                                                                //[_("platform#1"), _("platform#2"), _("both")]
                                                                var obj = $$("static_verification_table").getSelectedItem();
                                                                var real_weight = obj.real_weight;
                                                                if (real_weight === null || real_weight === "" || real_weight === undefined || isNaN(real_weight)) real_weight = 0;
                                                                obj.measured_weight = weight;
                                                                obj.time = current_time;
                                                                if (real_weight !== 0) {
                                                                    if (real_weight > weight) obj.imprecisionKG = real_weight - weight;
                                                                    else obj.imprecisionKG = weight - real_weight;
                                                                    obj.imprecisionPercent = obj.imprecisionKG / real_weight;
                                                                }
                                                                obj.save = 1;
                                                                $$("static_verification_table").updateItem(obj.id, obj);
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }]
                            },
                            {}
                        ]
                    },
                    {
                        cols: [
                            {},
                            {
                                view: "switch",
                                name: 'wagon_weighing',
                                hidden: true,
                                width: 300,
                                labelWidth: 180,
                                labelAllign: "left",
                                labelPosition: "left",
                                label: _("Truck/Wagon"),
                                on: {
                                    onChange: function (newState) {
                                        mode = !mode;
                                    }
                                }
                            },
                            {}
                        ]
                    },
                    {
                        cols: [
                            {},
                            {
                                view: "button", value: _("Start verification"),
                                width: 200, hidden: true, type: "form", id: "verification_starter_btn",
                                click: function () {
                                    if (started === false) {
                                        const configuration = referenceView.app.config.configuration;
                                        if (configuration.weighing_allowed) {
                                            referenceView.app.callEvent("setExchange=nothing");
                                            if (configuration.wagon_weighing_allowed && mode === true) {
                                                referenceView.app.callEvent("setConnection=verification.wagon");
                                            }
                                            else if (mode === false) referenceView.app.callEvent("setConnection=verification.truck");
                                            referenceView.app.callEvent("connection");
                                            $$('verification_starter_btn').setValue(_("Stop verification"));
                                            started = true;
                                        }
                                        else webix.message({type: "error", text: _("Weighing is not allowed")})
                                    }
                                    else {
                                        started = false;
                                        $$('verification_starter_btn').setValue(_("Start verification"));
                                        referenceView.app.callEvent("setExchange=nothing");
                                    }
                                }
                            },
                            {}
                        ]
                    },
                    {},
                    {
                        margin: 10, cols: [
                            {},
                            {
                                view: "button", value: _("Get verification document"),
                                autowidth: true, type: "form", popup: popup,
                                click: function () {
                                    var heigth = 60;
                                    tableParse(result, heigth);
                                }
                            },
                            {}
                        ]
                    }
                ]
            }
        };
    }

    init() {
        const _ = this.app.getService('locale')._;
        const ip = this.app.config.remoteHOST;
        const User = this.app.config.user;
        const config = $$('mainTop').$scope.app.config.configuration;

        function getLastVerification() {
            var _methodName = 'getLastVerification';
            webix.ajax().post(ip, {
                "method": "getLastVerification",
                "user": User,
                "params": []
            }, function (text, xml, xhr) {
                var _data = JSON.parse(text);
                if (_data.method === _methodName) {
                    if (_data.answer === 'ok') {
                        $$('lastVerification').setValue(_data.params.date);
                    }
                }
            })
        }

        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();
        if (dd < 10) dd = "0" + dd;
        if (mm < 10) mm = "0" + mm;
        var current_date = dd + "-" + mm + "-" + yyyy;
        $$('lastVerification').setValue(current_date);

        this.app.callEvent("setExchange=nothing");
        if (config.wagon_weighing) {
            this.app.callEvent("setConnection=verification.wagon");
        }
        else {
            this.app.callEvent("setConnection=verification.truck");
        }
        this.app.callEvent("connection");
        //getLastVerification();
    }
}
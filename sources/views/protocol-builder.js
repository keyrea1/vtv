import {JetView} from "webix-jet";
import {getLangsList} from "models/langslist";

import "locales/webix/ru.js";

export default class ProtocolBuilderView extends JetView {
	config(){
		const _ = this.app.getService("locale")._;
		const ip = this.app.config.remoteHOST;
		const theme = this.app.config.theme;
		const User = this.app.config.user;

		function getProtocols() {
			var _methodName = "getProtocols";
			webix.ajax().post(
				ip, {"method": "getProtocols", "user": User, "params": []},
				function (text, xml, xhr) {
					var _data = JSON.parse(text);
					if (_data.method === _methodName) {
						if (_data.answer === "ok") {
							if ("message" in _data) {
								$$("protocolsList").clearAll();
								webix.message({type: "error", text: _(_data.message)});
							}
							else {
								$$("protocolsList").clearAll();
								console.log(_data.params);
								$$("protocolsList").parse(_data.params, "json");
							}
						}
					}
				});
		}

		function getProtocol(obj) {
			var _methodName = "getProtocol";
			webix.ajax().post(
				ip, {"method": _methodName, "user": User, "params": {"id": obj}},
				function (text, xml, xhr) {
					var _data = JSON.parse(text);
					console.log(_data);
					if (_data.method == _methodName) {
						if (_data.answer === "ok") {
							$$("protocolSets").clear();
							$$("protocolSets").setValues({
								id: _data.params.id,
								name: _data.params.name,
								IP: _data.params.IP,
								port: _data.params.port,
								one_c: _data.params.one_c,
								jsonp: _data.params.jsonp,
								journal: _data.params.journal,
								o_table: _data.params.o_table,
								password: _data.params.password,
								archive: _data.params.archive,
								data_url: _data.params.data_url,
								type: _data.params.type
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

		function _setProtocol(obj) {
			var _methodName = "setProtocol";
			console.log(obj);
			webix.ajax().post(
				ip,
				{"method": _methodName, "user": User, "params": obj},
				function (text, xml, xhr) {
					var _data = JSON.parse(text);
					console.log(_data);
					if (_data.method == _methodName) {
						if (_data.answer === "ok") {
							$$("protocolSets").clear();
							$$("protocolSets").setValues(
								{
									IP: _("Enter IP for the access here"),
									port: "",
									one_c: false,
									archive: false,
									journal: false,
									o_table: false,
									jsonp: false,
									password: _("Enter the password for the access"),
									data_url: _("Enter the address of the protocol"),
									type: ""
								});
							webix.message({type: "info", text: _(_data.params.message)});
						}
						else webix.message({type: "error", text:_(_data.params.message)});
					}
					else webix.message({type: "error", text: _(_data.params.message)});
				});
		}

		function switchProtocol(obj, state) {
			var _methodName = "switchProtocol";
			webix.ajax().post(
				ip,
				{"method": _methodName, "user": User, "params": {"id": obj, "markCheckbox": state}},
				function (text, xml, xhr) {
					var _data = JSON.parse(text);
					console.log(_data);
					if (_data.method == _methodName) {
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

		function delProtocol(obj) {
			var _methodName = "delProtocol";
			webix.ajax().post(
				ip,
				{"method": _methodName, "user": User, "params": {"id": obj}},
				function (text, xml, xhr) {
					var _data = JSON.parse(text);
					console.log(_data);
					if (_data.method == _methodName) {
						if (_data.answer === "ok") {
							webix.message({type: "info", text: (_(_data.params.message))});
						}
						else webix.message({type: "error", text: _(_data.params.message)});
					}
					else webix.message({type: "error", text: _(_data.params.message)});
				});
		}

		function setProtocol(obj) {
			_setProtocol(obj);
			getProtocols();
		}

		webix.protoUI({name:"activeList"},webix.ui.list,webix.ActiveContent);

		return {
			rows: [
				{template: _("Protocol Builder"), type: "header", css: `webix_header ${theme}`},
				{height: 5},
				{
					cols: [
						{
							rows: [
								{
									view: "activeList",
									id: "protocolsList",
									minWidth: 620,
									select: true,
									activeContent: {
										deleteButton: {
											view: "button",
											label: _("Delete"),
											width: 80,
											click: function () {
												var item_id = this.config.$masterId;
												delProtocol(item_id);
												getProtocols();
											}
										},
										editButton: {
											view: "button",
											label: _("Edit"),
											width: 80,
											on: {
												"onItemClick": function (id) {
													var item_id = this.config.$masterId;
													getProtocol(item_id);
												}
											}
										},
										markCheckbox: {
											view: "checkbox",
											width: 50,
											on: {
												"onChange": function (newv, oldv) {
													var item_id = this.config.$masterId;
													var state = this.getValue() ? switchProtocol(item_id, true) : switchProtocol(item_id, false);
												}
											}
										}
									},
									template:
									"<div class='title'>#name#.<br>#IP#</div>" + "<div class='buttons'>{common.deleteButton()}</div><div class='buttons'>{common.editButton()}</div>" + "<div class='checkbox'>{common.markCheckbox()}</div>"
									,
									type: {
										height: 65
									}
								},
								{
									view: "button", value: _("Add"),
									type: "form",
									click: function () {
										var obj = {"name":_("New protocol"), "port": "80", "one_c": false, "jsonp": false, "journal": false, "o_table": false, "password": "", "archive": false, "type": "", "markCheckbox": false, "data_url": "New address"};
										setProtocol(obj);
									}
								}
							]
						},
						{width: 5},
						{
							rows: [
								{
									view: "property", id: "protocolSets", complexData: true,
									elements: [
										{label: _("Layout"), type: "label"},
										{label: _("ID"), id: "id"},
										{label: _("Protocol destination"), type: "text", id: "name"},
										{label: _("IP"), type: "text", id: "IP"},
										{label: _("port"), type: "text", id: "port"},
										{label: _("Data loading"), type: "label"},
										{label: _("Data address"), type: "text", id: "data_url"},
										{
											label: _("Type"),
											type: "select",
											options: ["json", "xml", "csv", "urlencoded"],
											id: "type"
										},
										{label: _("Password"), type: "text", id: "password"},
										{label: _("Use JSONP"), type: "checkbox", id: "jsonp"},
										{label: _("Use 1C"), type: "checkbox", id: "one_c"},
										{label: _("Access"), type: "label"},
										{label: _("Archive"), type: "checkbox", id: "archive"},
										{label: _("Event Journal"), type: "checkbox", id: "journal"},
										{label: _("Operation Table"), type: "checkbox", id: "o_table"}
									]
								},
								{
									view: "button", value: _("Preview"), hidden: true, click: function () {
									}
								},
								{
									view: "button", value: _("Save"), click: function () {
										$$("protocolSets").editStop();
										var protocol = {};
										var i = 1;
										protocol = $$("protocolSets").getValues();
										if (protocol.IP === ""){
											delete protocol.IP;
										}
										if (protocol.port === ""){
											delete protocol.port;
										}
										if (protocol.password === _("Enter the password to access the protocol here")){
											protocol.password = "";
										}
										protocol["markCheckbox"] = true;
										if (protocol['one_c'] === ""){
											protocol['one_c'] = false
										}
										if (protocol['archive'] === ""){
											protocol['archive'] = false
										}
										if (protocol['journal'] === ""){
											protocol['journal'] = false
										}
										if (protocol['o_table'] === ""){
											protocol['o_table'] = false
										}
										if (protocol['jsonp'] === ""){
											protocol['jsonp'] = false
										}
										if (protocol['type'] === ""){
											webix.message({type: "error", text: _("Specify the type of data")});
										}
										else if (protocol.data_url === ""){
											webix.message({type: "error", text: _("Enter the name of the address")});
										}
										else if (protocol.password === ""){
											webix.message({type: "error", text: _("Enter the password for the access")});
										}
										else {
											setProtocol(protocol);
										}
									}
								}
							]
						}
					]
				}
			]
		}
	}

	init(){
		const ip = this.app.config.remoteHOST;
		const _ = this.app.getService("locale")._;
		const User = this.app.config.user;

		function getProtocols(){
			var _methodName = "getProtocols";
			webix.ajax().post(
				ip, {"method": "getProtocols", "user": User, "params": []},
				function (text, xml, xhr) {
					var _data = JSON.parse(text);
					console.log(_data);
					if (_data.method === _methodName) {
						if (_data.answer === "ok") {
							if ("message" in _data){
								$$("protocolsList").clearAll();
								webix.message({type: "error",text: _(_data.message)});
                            }
                            else {
                                $$("protocolsList").clearAll();
                                $$("protocolsList").parse(_data.params, "json");
                            }
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

		var film_set = [
			{id: 1, title: "Склад", ip: "192.168.14.3", isOn: 1},
			{id: 2, title: "Офис", ip: "192.168.14.45", isOn: 0},
			{id: 3, title: "Цех", ip: "192.168.14.58"},
			{id: 4, title: "Начальник станции", ip: "25.31.63.197"},
		];
		//$$('protocolsList').parse(film_set, "json");

		getProtocols();
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

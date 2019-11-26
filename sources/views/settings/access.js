import {JetView} from "webix-jet";
import {getLangsList} from "models/langslist";

import "locales/webix/ru.js";

export default class AccessView extends JetView {
	config() {
		const _ = this.app.getService("locale")._;
		const ip = this.app.config.remoteHOST;
		const theme = this.app.config.theme;
		const User = this.app.config.user;

		webix.protoUI({name:"activeList"},webix.ui.list,webix.ActiveContent);

		function getUsers() {
			var _methodName = "getUsers";
			webix.ajax().post(
				ip, {"method": "getUsers", "user": User, "params": []},
				function (text, xml, xhr) {
					var _data = JSON.parse(text);
					if (_data.method === _methodName) {
						if (_data.answer === "ok") {
							$$("accessList").clearAll();
							$$("accessList").parse(_data.params, "json");
						}
					}
				});
		}

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
							$$("accessSets").clear();
							$$("accessSets").setValues({
								id: _data.params.id,
								user_name: _data.params.user_name,
								credentials: _data.params.credentials,
								pass1: _(_data.params.password),
								pass2: _(_data.params.password),
								phonenumber: _data.params.phonenumber,
								backup: _data.params.backup,
								explore_weight_arch: _data.params.explore_weight_arch,
								explore_logs: _data.params.explore_logs,
								printing: _data.params.printing,
								adding_arch_data: _data.params.adding_arch_data,
								cancel_weighting: _data.params.cancel_weighting,
								change_arch_data: _data.params.change_arch_data,
								change_wagon_number: _data.params.change_wagon_number,
								add_user: _data.params.add_user,
								calibration: _data.params.calibration,
								verification: _data.params.verification,
								configuration: _data.params.configuration,
								save_archive: _data.params.save_archive,
								save_events: _data.params.save_events,
								table_configuration: _data.params.table_configuration,
								tara_control: _data.params.tara_control
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

		function _setUser(obj) {
			var _methodName = "setSettings";
			webix.ajax().post(
				ip,
				{"method": _methodName, "user": User, "params": obj},
				function (text, xml, xhr) {
					var _data = JSON.parse(text);
					if (_data.method === _methodName) {
						if (_data.answer === "ok") {
							console.log(_data);
							$$("accessSets").clear();
							$$("accessSets").setValues(
								{
									user_name: _("Enter login of the user here"),
									pass1: _("Enter the password of the user here"),
									pass2: _("Re-type the password")
								});
							webix.message({type: "info", text: _(_data.params.message)});
						}
						else webix.message({type: "error", text:_(_data.params.message)});
					}
					else webix.message({type: "error", text: _(_data.params.message)});
				});
		}

		function delUser(obj) {
			var _methodName = "delUser";
			webix.ajax().post(
				ip,
				{"method": _methodName, "user": User, "params": {"id": obj}},
				function (text, xml, xhr) {
					var _data = JSON.parse(text);
					console.log(_data);
					if (_data.method === _methodName) {
						if (_data.answer === "ok") {
							webix.message({type: "info", text: (_(_data.params.message))});
							getUsers();
						}
						else webix.message({type: "error", text: _(_data.params.message)});
					}
					else webix.message({type: "error", text: _(_data.params.message)});
				});
		}

		function setUser(obj) {
			_setUser(obj);
			getUsers();
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
										view: "activeList",
										id: "accessList",
										select: true,
										minWidth: 560,
										activeContent: {
											deleteButton: {
												view: "button",
												label: _("Delete"),
												width: 80,
												click: function () {
													var item_id = this.config.$masterId;
													delUser(item_id);
												}
											},
											editButton: {
												view: "button",
												label: _("Edit"),
												width: 80,
												click: function () {
													var item_id = this.config.$masterId;
													getUser(item_id);
												}
											}
										},
										template: "<div class='title'>#credentials#<br>#user_name#</div>" +
										"<div class='buttons'>{common.deleteButton()}</div><div class='buttons'>{common.editButton()}</div>",
										type: {
											height: 65
										}
									},
									{
										view: "button", value: _("Add"),
										type: "form",
										click: function () {
											var obj = {"credentials": _("User"), "user_name": [], "calibration": false, "verification": false, "configuration":false, "save_archive":false, "save_events":false, "table_configuration": false, "tara_control":false,  "backup": false, "explore_weight_arch": false, "explore_logs": false, "printing": false, "adding_arch_data": false, "cancel_weighting": false, "change_arch_data": false, "add_user": false, "change_wagon_number": false, "locale": "ru", "update_speed": 5};
											setUser(obj);
										}
									}
								]
							},
							{width: 5},
							{
								view: "scrollview", scroll: "y", body: {
									rows: [
										{
											view: "property", borderless: true, id: "accessSets", height: 750, complexData: true, nameWidth:300,
											elements: [
												{label: _("Credentials"), type: "label"},
												{label: _("Phonenumber"), type: "text", id: "phonenumber"},
												{label: _("Credentials"), type: "text", id: "credentials"},
												{label: _("Login and Password"), type: "label"},
												{label: _("ID"), id: "id"},
												{label: _("Login"), type: "text", id: "user_name", value: _("Enter login of the user here")},
												{
													label: _("Password"),
													type: "text",
													id: "pass1",
													value: _("Enter the password of the user here")
												},
												{
													label: _("Re-type password"),
													type: "text",
													id: "pass2",
													value: _("Enter the password of the user here")
												},
												{label: _("Access"), type: "label"},
												{label: _("Can backup"), type: "checkbox", id: "backup", value: false},
												{label: _("Can explore archive"), type: "checkbox", id: "explore_weight_arch"},
												{label: _("Can explore logs"), type: "checkbox", id: "explore_logs"},
												{label: _("Can print"), type: "checkbox", id: "printing"},
												{label: _("Can add data to archive"), type: "checkbox", id: "adding_arch_data"},
												{label: _("Can cancelling weighing"), type: "checkbox", id: "cancel_weighting"},
												{label: _("Can change arch data"), type: "checkbox", id: "change_arch_data"},
												{label: _("Can add users"), type: "checkbox", id: "add_user"},
												{label: _("Can change wagon number"), type: "checkbox", id: "change_wagon_number"},
												{label: _("Calibration access"), type: "checkbox", id: "calibration"},
												{label: _("Configuration access"), type: "checkbox", id: "configuration"},
												{label: _("Verification access"), type: "checkbox", id: "verification"},
												{label: _("Tara control access"), type: "checkbox", id: "tara_control"},
												{label: _("Download archive data"), type: "checkbox", id: "save_archive"},
												{label: _("Download events data"), type: "checkbox", id: "save_events"},
												{label: _("Table configuration"), type: "checkbox", id: "table_configuration"}
											]
										},
										{},
										{
											view: "button", value: _("Save"), click: function () {
												$$("accessSets").editStop();
												var user = {};
												user = $$("accessSets").getValues();
												if (user.user_name === null || user.user_name === "" || user.user_name === _("Enter login of the user here")) {
													webix.message({
														type: "error",
														text: _("Enter user login")
													});
												}
												else {
													if (user.pass1 === "") {
														webix.message({
															type: "error",
															text: _("Enter the user password field")
														});
													}
													else if (user.pass2 === "") {
														webix.message({
															type: "error",
															text: _("Enter the user password field again")
														});
													}
													else {
														if (user.pass1 !== user.pass2) {
															webix.message({
																type: "error",
																text: _("Enter the same password in both password fields")
															});
														}
														else {
															user.password = user.pass1;
															delete user.pass1;
															delete user.pass2;
															if (user.password === "******" || user.password === _("Password is not setted")) {
																delete user.password;
															}
															if (user.user_name === "Login is not setted") {
																user.user_name = null;
															}
															if (user.backup === "") user.backup = false;
															if (user.explore_weight_arch === "") user.explore_weight_arch = false;
															if (user.printing === "") user.printing = false;
															if (user.adding_arch_data === "") user.adding_arch_data = false;
															if (user.cancel_weighting === "") user.cancel_weighting = false;
															if (user.change_arch_data === "") user.change_arch_data = false;
															if (user.add_user === "") user.add_user = false;
															if (user.calibration === "") user.calibration = false;
															if (user.verification === "") user.verification = false;
															if (user.configuration === "") user.configuration = false;
															if (user.save_archive === "") user.save_archive = false;
															if (user.save_events === "") user.save_events = false;
															if (user.table_configuration === "") user.table_configuration = false;
															if (user.tara_control === "") user.tara_control = false;
															if (user.change_wagon_number === "") user.change_wagon_number = false;
															setUser(user);
														}
													}
												}
											}
										}
									]
								}
							}
						]
					}
				]
		};
	}

	init(){
		const _ = this.app.getService("locale")._;
		const ip = this.app.config.remoteHOST;
		const User = this.app.config.user;

		function getUsers() {
			var _methodName = "getUsers";
			webix.ajax().post(
				ip, {"method": "getUsers", "user": User, "params": []},
				function (text, xml, xhr) {
					var _data = JSON.parse(text);
					console.log(_data);
					if (_data.method === _methodName) {
						if (_data.answer === "ok") {
							$$("accessList").clearAll();
							$$("accessList").parse(_data.params, "json");
						}
					}
				});
		}

		getUsers();
		//$$("accessList").parse(film_set, "json");

		this.app.callEvent("setExchange=nothing");
		this.app.callEvent("chart3StaticCalibrationUpdateStop");
		this.app.callEvent("chart2StaticCalibrationUpdateStop");
		this.app.callEvent("chart1StaticCalibrationUpdateStop");
	}
}

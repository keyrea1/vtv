import {JetView} from "webix-jet";
import ToolView from "views/toolbar";
import MenuView from "views/menu";
import {getLangsList} from "models/langslist";

export default class TopView extends JetView {
	config () {
		const _ = this.app.getService("locale")._;
		const theme = this.app.config.theme;
		var referenceView = this;

		function logout () {
			referenceView.app.callEvent("setExchange=nothing");
			referenceView.app.callEvent("chartStaticUpdateStop");
			referenceView.app.callEvent("chartStaticWagonUpdateStop");
			referenceView.app.callEvent("chart3StaticCalibrationUpdateStop");
			referenceView.app.callEvent("chart2StaticCalibrationUpdateStop");
			referenceView.app.callEvent("chart1StaticCalibrationUpdateStop");
			referenceView.app.callEvent("chartWeighingDynamicClear");
			referenceView.app.callEvent("setExchange=nothing");
			referenceView.app.callEvent("setMessage=Waiting");
			closeAllPopups();
		}

		function closeAllPopups () {
			var _ids = $$('mainTop').$scope.app.config.ids;
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
			try {
				var helpwindowID = $$("helpButtonID").getValue();
				if ($$(helpwindowID).isVisible() === true) $$(helpwindowID).destructor();
			}
			catch (e) {
				//console.log(e);
			}
			try {
				var adcWindowID = $$("adcWindowID").getValue();
				referenceView.app.callEvent('exchangeADCstop');
				if ($$(adcWindowID).isVisible() === true) $$(adcWindowID).destructor();
			}
			catch (e) {
				//console.log(e);
			}
			try {
				var cameraWindowID = _ids.cameraWdwID;
				if ($$(cameraWindowID).isVisible() === true) $$(cameraWindowID).destructor();
			}
			catch (e) {
				//console.log(e);
			}
            try {
                var wagonNumberWindowID = _ids.wagonNumberWindowStatic;
                if ($$(wagonNumberWindowID).isVisible() === true) $$(wagonNumberWindowID).destructor();
            }
            catch (e) {
                //console.log(e);
            }
		};

		return {
			id: "mainTop", css: theme, rows: [
				ToolView,
				{
					css: theme, cols: [
						{
							rows: [
								MenuView,
								{
									css: theme,
									rows: [
										{css: theme},
										{
											view: "button",
											type: "image",
											align: "left",
											image: "sources/styles/logout-1.svg",
											css: theme,
											label: _("Logout"),
											click: () => {
												logout();
												this.show("/logout");
												//setLogout("User logout");

											}
										},
										{
											view: "button",
											type: "image",
											align: "left",
											image: "sources/styles/unlocked-1.svg",
											css: theme,
											label: _("Lock"),
											click: () => {
												logout();
												this.show("/lock");
												//setLogout("User lock program");
											}
										},
										{css: theme, height: 5}
									]
								}
							]
						},
						{
							type: "space",
							cols: [
								{$subview: true}
							]
						}
					]
				}
			]
		};
	}

	init () {
		let i = 0;
		const _ = this.app.getService("locale")._;
		const ip = this.app.config.remoteHOST;
		const lang = this.app.getService("locale").getLang();
		const User = this.app.config.user;
		const counts = this.app.config.counts;

		var timeoutForConnection = 1000;
		var timeoutForExchange = 1000 / counts;
		var exchangeCycle;
		var exchangeCycleADC;
		var exchangeCycleCAMERAS = false;
		var cameras = [{}];
		var connectionCycle;
		var connectionType;
		var currentExchange;
		var switcher = false;
		var message = "Connecting to PDO";
		var warning = "";
		var imortant_message = "";
		var referenceView = this;
		var counter;
		var _counter = 0;
		var startGetADCstatus = 0;
		var adcStatusTimer;
		var startTime = 0; // for charts

		clearInterval(adcStatusTimer);

		if (lang !== "en") {
			const langs = getLangsList();
			const country = langs.find(l => l.id === lang).code;
			webix.i18n.setLocale(lang + "-" + country);
		}

		function LIMITY (weight) {
			var A, B, C, D, _i;
			var LIMTABY = [[10000, 30000, 50000, 55000, 67000, 68000], [410, 290, 200, 150, 120, 100]];
			if (weight <= LIMTABY[0][0]) return LIMTABY[1][0];

			if (weight >= LIMTABY[0][4]) return LIMTABY[1][5];

			for (_i = 1; _i <= 4; _i++) {
				if (weight < LIMTABY[0][_i]) {
					A = LIMTABY[1][_i];
					B = LIMTABY[1][_i - 1];
					C = LIMTABY[0][_i];
					D = LIMTABY[0][_i - 1];
					break
				}
			}
			return ((weight - D) * ((A - B) / (C - D))) + B;
		}

		function LIMITX (weight) {
			var A, B, C, D, _i;
			var LIMTABX = [[10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000, 55000, 60000, 62000, 67000, 70000, 71000],
				[3000, 2480, 2230, 2070, 1970, 1890, 1840, 1800, 1700, 1330, 860, 690, 300, 110, 100]];
			if (weight <= LIMTABX[0][0]) return LIMTABX[1][0];
			if (weight >= LIMTABX[0][13]) return LIMTABX[1][14];

			for (_i = 1; _i <= 13; _i++) {
				if (weight < LIMTABX[0][_i]) {
					A = LIMTABX[1][_i];
					B = LIMTABX[1][_i - 1];
					C = LIMTABX[0][_i];
					D = LIMTABX[0][_i - 1];
					break;
				}
			}
			return ((weight - D) * ((A - B) / (C - D))) + B;
		}

		function exchange () {
			const configuration = $$('mainTop').$scope.app.config.configuration;
			_counter = _counter + 1;
			switch (currentExchange) {
				case "static.truck":
					if (configuration.weighing_allowed) {
						getWeightTruck();
					}
					break;

				case "static.wagon":
					if (configuration.wagon_weighing_allowed && configuration.weighing_allowed) {
						getWeightWagon();
					}
					break;

				case "dynamic":
					if (configuration.weighing_allowed) {
						getWeightDynamic();
					}
					break;

				case "dynamic.chart":
					if (configuration.weighing_allowed) {
						getWeightDynamicWithChart();
					}
					break;

				case "calibration.static":
					getADCdata();
					if (configuration.weighing_allowed) {
						if (configuration.wagon_weighing_allowed) getCalibrationStaticWagon();
						else getCalibrationStaticTruck();
					}
					break;

				case "calibration.auto":
					if (configuration.weighing_allowed) {
						getCalibrationAuto();
					}
					break;

				case "calibration.dynamic":
					if (configuration.weighing_allowed) {
						getCalibrationDynamic();
					}
					break;

				case "verification.truck":
					if (configuration.weighing_allowed) {
						getVerificationStaticTruck();
					}
					break;

				case "verification.truck2":
					if (configuration.weighing_allowed) {
						getVerificationStaticTruck2();
					}
					break;

				case "verification.wagon":
					if (configuration.weighing_allowed) {
						getVerificationStaticWagon();
					}
					break;

				case "verification.dynamic":
					if (configuration.weighing_allowed) {
						getVerificationDynamic();
					}
					break;

				case "nothing":
					clearInterval(exchangeCycle);
					break;
			}
		}

		function exchangeADC () {
			const configuration = $$('mainTop').$scope.app.config.configuration;
			_counter = _counter + 1;
			if (configuration.weighing_allowed) {
				getADCdataForWindow();
			}
		}

		function connection () {
			const configuration = referenceView.app.config.configuration;
			if (configuration.weighing_allowed) {
				_counter = _counter + 1;
				switch (connectionType) {
					case "static.truck":
						staticTruckConnection();
						break;

					case "static.wagon":
						if (configuration.wagon_weighing_allowed) {
							staticWagonConnection();
						}
						break;

					case "dynamic":
						dynamicConnection();
						break;

					case "dynamic.chart":
						dynamicConnectionWithChart();
						break;

					case "calibration.static":
						staticWagonConnection();
						break;

					case "calibration.dynamic":
						dynamicCalibrationConnection();
						break;

					case "calibration.auto":
						autoCalibrationConnection();
						break;

					case "verification.truck":
						verificationTruckConnection();
						break;

					case "verification.wagon":
						staticWagonConnection();
						break;

					case "verification.dynamic":
						verificationDynamicConnection();
						break;
				}
			} else {
				if (connectionType === "calibration.static") {
					staticWagonConnectionSilent();
				}
			}
		}

		function _typeof (obj) {
			if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
				_typeof = function (obj) {
					return typeof obj;
				};
			} else {
				_typeof = function (obj) {
					return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
				};
			}

			return _typeof(obj);
		}

		function setWeight (obj) {
			var _methodName = "addOperationData";
			if (_typeof(obj.doc_date) === "object") {
				try {
					var dd = obj.doc_date.getDate();
					var mm = obj.doc_date.getMonth() + 1; //January is 0!
					var yyyy = obj.doc_date.getFullYear();
					if (dd < 10) dd = "0" + dd;
					if (mm < 10) mm = "0" + mm;
					obj.doc_date = yyyy + "-" + mm + "-" + dd;
				} catch (e) {
					obj.doc_date = "";
				}
			} else if (_typeof(obj.doc_date) === "string")
				if (obj.doc_date.length > 10) {
					obj.doc_date = obj.doc_date.slice(0, 10);
				}
			var _row = {
				id: obj.id,
				direction: obj.direction,
				write_date: obj.write_date,
				write_time: obj.write_time,
				wagon_number: obj.wagon_number,
				train_number: obj.train_number,
				start_weight: obj.start_weight,
				doc_start_weight: obj.doc_start_weight,
				brutto: obj.brutto,
				cargo_weight: obj.cargo_weight,
				doc_cargo_weight: obj.doc_cargo_weight,
				capacity: obj.capacity,
				doc_number: obj.doc_number,
				doc_date: obj.doc_date,
				cargo_name: obj.cargo_name,
				truck1_weight: obj.truck1_weight,
                ft_axis_1: obj.ft_axis_1,
           		ft_axis_2: obj.ft_axis_2,
           		ft_axis_3: obj.ft_axis_3,
           		ft_axis_4: obj.ft_axis_4,
				truck2_weight: obj.truck2_weight,
                st_axis_1: obj.st_axis_1,
                st_axis_2: obj.st_axis_2,
                st_axis_3: obj.st_axis_3,
                st_axis_4: obj.st_axis_4,
				truck_diff: obj.truck_diff,
				side_diff: obj.side_diff,
				offset_lengthwise: obj.offset_lengthwise,
				cross_offset: obj.cross_offset,
				sender: obj.sender,
				reciever: obj.reciever,
				speed: obj.speed,
				transporter: obj.transporter,
				departure_point: obj.departure_point,
				destination_point: obj.destination_point,
				cargo: obj.cargo,
				user: User,
				axels_count: obj.axels_count,
				photo_path: obj.photo_path,
				wagon_type: obj.wagon_type,
				optional1: obj.optional1,
				optional2: obj.optional2,
				optional3: obj.optional3,
				optional4: obj.optional4,
				optional5: obj.optional5,
				autofilling: obj.autofilling
			};
			webix.ajax().post(
				ip,
				{
					"method": _methodName, "user": User,
					"params": {"reweight": 0, "type": "dynamic", row: _row}
				},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							$$('dynamic_operations').updateItem(obj.id, obj);
						}
					}
				});
		}

		function staticTruckConnection () {
			var _methodName = "startWeighing";
			webix.ajax().post(
				ip,
				{
					"method": "startWeighing", "user": User,
					"params": {"type": "static.truck", "status": "start"}
				},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							webix.message({type: "default", text: _(data.params.message)});
							imortant_message = connectionType;
							if (connectionType !== currentExchange) {
								currentExchange = connectionType;
								referenceView.app.callEvent("chartStaticUpdateStart");
								exchangeCycle = setInterval(function () {
									exchange();
								}, timeoutForExchange);
								clearInterval(connectionCycle);
							}
						}
					}
				});
		}

		function verificationTruckConnection () {
			var _methodName = "startWeighing";
			webix.ajax().post(
				ip,
				{
					"method": "startWeighing", "user": User,
					"params": {"type": "static.truck", "status": "start"}
				},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							webix.message({type: "default", text: _(data.params.message)});
							imortant_message = connectionType;
							if (connectionType !== currentExchange) {
								currentExchange = connectionType;
								exchangeCycle = setInterval(function () {
									exchange();
								}, timeoutForExchange);
								clearInterval(connectionCycle);
							}
						}
					}
				});
		}

		function verificationDynamicConnection () {
			var _methodName = "startWeighing";
			var wagon_weighing;
			var _configuration = $$('mainTop').$scope.app.config.configuration;
			if (_configuration.wagon_weighing) {
				wagon_weighing = false
			} else wagon_weighing = true;
			webix.ajax().post(
				ip,
				{
					"method": "startWeighing", "user": User,
					"params": {"wagon_weighing": wagon_weighing, "write": false, "type": "dynamic", "status": "start"}
				},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							setVerificationDynamic();
							webix.message({type: "default", text: _(data.params.message)});
							message = "Verification: Dynamic";
							clearInterval(connectionCycle);
						}
					}
				});
		}

		function setVerificationDynamic () {
			var _methodName = "setVerificationDynamic";
			var mass = [];
			$$('dynamic_verification_table').eachRow(function (row) {
				const record = $$('dynamic_verification_table').getItem(row);
				if (record.id < 6) mass.push(record.real_weight);
			});
			webix.ajax().post(
				ip, {"method": _methodName, "user": User, "params": mass},
				function (text, xml, xhr) {
					var _data = JSON.parse(text);
					if (_data.method === _methodName) {
						if (_data.answer === "ok") {
							imortant_message = connectionType;
							if (connectionType !== currentExchange) {
								currentExchange = connectionType;
								startTime = (new Date()).getTime();
								exchangeCycle = setInterval(function () {
									exchange();
								}, timeoutForExchange);
								$$("verification_starter_btn_dynamic").setValue(_("In progress"));
							}
						} else webix.message({type: "error", text: _(_data.params.message)});
					} else webix.message({type: "error", text: _(_data.params.message)});
				});
		}

		function staticWagonConnection () {
			var _methodName = "startWeighing";
			webix.ajax().post(
				ip,
				{
					"method": "startWeighing", "user": User,
					"params": {"write": true, "type": "static.wagon", "status": "start"}
				},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							webix.message({type: "default", text: _(data.params.message)});
							imortant_message = connectionType;
							if (connectionType !== currentExchange) {
								currentExchange = connectionType;
								exchangeCycle = setInterval(function () {
									exchange();
								}, timeoutForExchange);
								clearInterval(connectionCycle);
								connectionCycle = {};
							}
						}
					}
				});
		}

		function staticWagonConnectionSilent () {
			var _methodName = "startWeighing";
			webix.ajax().post(
				ip,
				{
					"method": "startWeighing", "user": User,
					"params": {"write": true, "type": "static.wagon", "status": "start"}
				},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							imortant_message = connectionType;
							if (connectionType !== currentExchange) {
								currentExchange = connectionType;
								exchangeCycle = setInterval(function () {
									exchange();
								}, timeoutForExchange);
								clearInterval(connectionCycle);
								connectionCycle = {};
							}
						}
					}
				});
		}

		function dynamicConnection () {
			var _methodName = "startWeighing";
			var wagon_weighing;
			var _configuration = $$('mainTop').$scope.app.config.configuration;
			if (_configuration.wagon_weighing) {
				wagon_weighing = false
			} else wagon_weighing = true;
			webix.ajax().post(
				ip,
				{
					"method": "startWeighing", "user": User,
					"params": {"wagon_weighing": wagon_weighing, "write": true, "type": "dynamic", "status": "start"}
				},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							webix.message({type: "default", text: _(data.params.message)});
							imortant_message = "Dynamic: Waiting";
							if (connectionType !== currentExchange) {
								currentExchange = connectionType;
								exchangeCycle = setInterval(function () {
									exchange();
								}, timeoutForExchange);
								clearInterval(connectionCycle);
							}
						}
					}
				});
		}

		function dynamicConnectionWithChart () {
			var _methodName = "startWeighing";
			var wagon_weighing;
			var _configuration = $$('mainTop').$scope.app.config.configuration;
			if (_configuration.wagon_weighing) {
				wagon_weighing = false
			} else wagon_weighing = true;
			webix.ajax().post(
				ip,
				{
					"method": "startWeighing", "user": User,
					"params": {
						"wagon_weighing": wagon_weighing,
						"write": true,
						"chart": true,
						"type": "dynamic",
						"status": "start"
					}
				},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							webix.message({type: "default", text: _(data.params.message)});
							imortant_message = "Dynamic: Waiting";
							clearInterval(connectionCycle);
							referenceView.app.callEvent("chartWeighingUpdateEnable");
							if (connectionType !== currentExchange) {
								currentExchange = connectionType;
								exchangeCycle = setInterval(function () {
									exchange();
								}, timeoutForExchange);
								clearInterval(connectionCycle);
							}
						}
					}
				});
		}

		function dynamicCalibrationConnection () {
			var _methodName = "startWeighing";
			var wagon_weighing;
			var _configuration = $$('mainTop').$scope.app.config.configuration;
			if (_configuration.wagon_weighing) wagon_weighing = false;
			else wagon_weighing = true;
			webix.ajax().post(
				ip,
				{
					"method": "startWeighing", "user": User,
					"params": {
						"wagon_weighing": wagon_weighing,
						"write": false,
						"chart": true,
						"type": "dynamic",
						"status": "start"
					}
				},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							webix.message({type: "default", text: _(data.params.message)});
							imortant_message = "Calibration: Dynamic";
							clearInterval(connectionCycle);
							$$("dynamic_calibr_starter").setValue(_("In progress"));
							message = connectionType;
							if (connectionType !== currentExchange) {
								currentExchange = connectionType;
								exchangeCycle = setInterval(function () {
									exchange();
								}, timeoutForExchange);
							}
						}
					}
				});
		}

		function autoCalibrationConnection () {
			var _methodName = "startWeighing";
			var wagon_weighing;
			var _configuration = $$('mainTop').$scope.app.config.configuration;
			if (_configuration.wagon_weighing) {
				wagon_weighing = false
			} else wagon_weighing = true;
			webix.ajax().post(
				ip,
				{
					"method": "startWeighing", "user": User,
					"params": {"wagon_weighing": wagon_weighing, "write": false, "type": "dynamic", "status": "start"}
				},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							webix.message({type: "default", text: _(data.params.message)});
							imortant_message = "Calibration: Dynamic";
							clearInterval(connectionCycle);
							setCalibrationAuto();
						}
					}
				});
		}

		function setCalibrationAuto () {
			var _methodName = "setCalibrationDynamic";
			var mass = [];
			$$('dyn_calibration').eachRow(function (row) {
				const record = $$('dyn_calibration').getItem(row);
				mass.push(record.weight);
			});
			webix.ajax().post(
				ip, {"method": _methodName, "user": User, "params": mass},
				function (text, xml, xhr) {
					var _data = JSON.parse(text);
					console.log(_data);
					if (_data.method === _methodName) {
						if (_data.answer === "ok") {
							webix.message({type: "success", text: _(_data.params.message)});
							message = connectionType;
							if (connectionType !== currentExchange) {
								currentExchange = connectionType;
								startTime = (new Date()).getTime();
								exchangeCycle = setInterval(function () {
									exchange();
								}, timeoutForExchange);
								$$("auto_calibr_starter").setValue(_("In progress"));
							}
						} else webix.message({type: "error", text: _(data.params.message)});
					} else webix.message({type: "error", text: _(data.params.message)});
				});
		}

		function getWeightTruck () {
			var _methodName = "getWeight";
			webix.ajax().post(
				ip,
				{"method": "getWeight", "user": User, "params": []},
				function (text, xml, xhr) {
					var configuration = $$('mainTop').$scope.app.config.configuration;
					var data = JSON.parse(text);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							var weight = parseInt(data.params.weight);
							var x = data.params.x;
							var y = data.params.y;
							var offset_len = parseInt(data.params.offset_lenghtwise_mm);
							var cross_offset = parseInt(data.params.cross_offset_mm);
							$$("_cart1weigth").setValue(data.params["1"]);
							$$("_offset_lengthwise").setValue(offset_len);
							$$("_cross_offset").setValue(cross_offset);
							$$("_side_diff").setValue(data.params.cross_offset);
							$$("x").setValue(x);
							$$("y").setValue(y);
							$$("weight").setValue(weight);
							if (data.params.cross_offset > 0) {
								$$("_offset2side").setValue(data.params.cross_offset);
								$$("_offset1side").setValue("");
							} else {
								$$("_offset1side").setValue(data.params.cross_offset);
								$$("_offset2side").setValue("");
							}
							i = i + 1;
							if (weight > 1) {
								if (configuration.gost) {
									var limitx = LIMITX(weight);
									var limity = LIMITY(weight);
									if (cross_offset >= limity || cross_offset <= -limity || offset_len >= limitx || offset_len <= -limitx) {
										referenceView.app.callEvent("changePointColorRed");
									} else {
										referenceView.app.callEvent("changePointColorBlack");
									}
								} else {
									if (offset_len >= configuration.offset_lenghtwise || offset_len <= -configuration.offset_lenghtwise || cross_offset >= configuration.cross_offset || cross_offset <= -configuration.cross_offset) {
										referenceView.app.callEvent("changePointColorRed");
									} else {
										referenceView.app.callEvent("changePointColorBlack");
									}
								}
								imortant_message = "Static: Weighing";
							} else imortant_message = "static.truck";
						} else if (data.params.message !== "list index out of range") {
							imortant_message = "";
							webix.message({type: "error", text: _(data.params.message)});
							clearInterval(connectionCycle);
							clearInterval(exchangeCycle);
							currentExchange = "nothing";
							connectionCycle = setInterval(function () {
								connection();
							}, timeoutForConnection);
						}
					} else {
						imortant_message = "";
						webix.message({type: "error", text: _(data.params.message)});
						clearInterval(connectionCycle);
						clearInterval(exchangeCycle);
						currentExchange = "nothing";
						connectionCycle = setInterval(function () {
							connection();
						}, timeoutForConnection);
					}
				}).fail(function () {
				currentExchange = "nothing";
				clearInterval(exchangeCycle);
				clearInterval(connectionCycle);
				connectionType = "static.truck";
				connectionCycle = setInterval(function () {
					connection();
				}, timeoutForConnection);
			});
		}

		function getWeightWagon () {
			var _methodName = "getWeight";
			webix.ajax().post(
				ip,
				{"method": "getWeight", "user": User, "params": []},
				function (text, xml, xhr) {
					var configuration = $$('mainTop').$scope.app.config.configuration;
					var data = JSON.parse(text);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							var weight = parseInt(data.params.weight);
							var x = data.params.x;
							var y = data.params.y;
							var offset_len = parseInt(data.params.offset_lenghtwise_mm);
							var cross_offset = parseInt(data.params.cross_offset_mm);
							$$("_cart1weigth").setValue(data.params["1"]);
							$$("_cart2weigth").setValue(data.params["2"]);
							$$("_offset_lengthwise").setValue(offset_len);
							$$("_cross_offset").setValue(cross_offset);
							$$("_side_diff").setValue(data.params.cross_offset);
							$$("_truck_diff").setValue(data.params.offset_lenghtwise);
							$$("_x").setValue(x);
							$$("_y").setValue(y);
							$$("___weight").setValue(weight);
							if (data.params.cross_offset > 0) {
								$$("_offset2side").setValue(data.params.cross_offset);
								$$("_offset1side").setValue("");
							} else {
								$$("_offset1side").setValue(-data.params.cross_offset);
								$$("_offset2side").setValue("");
							}
							if (weight > 1) {
								if (configuration.gost) {
									var limitx = LIMITX(weight);
									var limity = LIMITY(weight);
									if (cross_offset >= limity || cross_offset <= -limity || offset_len >= limitx || offset_len <= -limitx) {
										referenceView.app.callEvent("changePointColorRed");
									} else {
										referenceView.app.callEvent("changePointColorBlack");
									}
								} else {
									if (offset_len >= configuration.offset_lenghtwise || offset_len <= -configuration.offset_lenghtwise || cross_offset >= configuration.cross_offset || cross_offset <= -configuration.cross_offset) {
										referenceView.app.callEvent("changePointColorRed");
									} else {
										referenceView.app.callEvent("changePointColorBlack");
									}
								}
								imortant_message = "Static: Weighing";
							} else imortant_message = "static.wagon";
							i = i + 1;
						} else {
							imortant_message = "";
							webix.message({type: "error", text: _(data.params.message)});
							clearInterval(connectionCycle);
							clearInterval(exchangeCycle);
							currentExchange = "nothing";
							connectionCycle = setInterval(function () {
								connection();
							}, timeoutForConnection);
						}
					} else {
						imortant_message = "";
						webix.message({type: "error", text: _(data.params.message)});
						clearInterval(connectionCycle);
						clearInterval(exchangeCycle);
						currentExchange = "nothing";
						connectionCycle = setInterval(function () {
							connection();
						}, timeoutForConnection);
					}
				}).fail(function () {
				currentExchange = "nothing";
				clearInterval(exchangeCycle);
				clearInterval(connectionCycle);
				connectionType = "static.wagon";
				connectionCycle = setInterval(function () {
					connection();
				}, timeoutForConnection);
			});
		}

		function getWeightDynamic () {
			var _methodName = "getWeightDynamic";
			webix.ajax().post(
				ip,
				{"method": "getWeightDynamic", "user": User, "params": {"write": true, "user": User}},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							i = i + 1;
							if (data.params.status === true) imortant_message = "Dynamic: Analysis";
							else imortant_message = "";
							if (data.params.speed === 0) imortant_message = "Dynamic: Waiting";
							else if (data.params.speed < 2 || data.params.speed > 10) imortant_message = "Speed limit error";
							else {
								imortant_message = "";
								imortant_message = "Dynamic: Weighing";
							}
							$$('_speed').setValue(data.params.speed);
							if (data.params.data !== "None") {
								console.log(data);
								var out = [];
								if ($$("taraControl2").getValue() === 1) {	//TARA CONTROL = TRUE and BRUTTO
									//TARA
									if ($$("brutto/tara2").getValue() === 1) {
										var row = $$('dynamic_operations').getSelectedItem();
										if (row === undefined) {
											data.params.data.forEach(function (item, i, arr) {
												out.push({
													wagon_number: item.wagon_number,
													train_number: item.train_number,
													axels_count: item.axels_count,
													id: item.id,
													cargo_weight: item.brutto,
													brutto: null,
													cross_offset: item.cross_offset,
													offset_lengthwise: item.offset_lengthwise,
													side_diff: item.side_diff,
													speed: item.speed,
													direction: item.direction,
                                                    truck1_weight: parseInt(item.truck1_weight),
                                                    ft_axis_1: parseInt(item.ft_axis_1),
                                                    ft_axis_2: parseInt(item.ft_axis_2),
                                                    ft_axis_3: parseInt(item.ft_axis_3),
                                                    ft_axis_4: parseInt(item.ft_axis_4),
                                                    truck2_weight: parseInt(item.truck2_weight),
                                                    st_axis_1: parseInt(item.st_axis_1),
                                                    st_axis_2: parseInt(item.st_axis_2),
                                                    st_axis_3: parseInt(item.st_axis_3),
                                                    st_axis_4: parseInt(item.st_axis_4),
													type: item.type,
													user: item.user,
													write_date: item.write_date,
													write_time: item.write_time
												});
											});
											$$('dynamic_operations').parse(out);
											out.forEach(function (item, i, arr) {
												setWeight(item);
											})
										} else {
											console.log(4);
											var input_wagons_count = 0;
											var input_wagons_direction = false;
											data.params.data.forEach(function (item, i, arr) {
												input_wagons_count += 1;
												input_wagons_direction = item.direction;
											});
											var wagons = [];
											var wagons_count = 0;
											var wagons_direction = 0;
											$$('dynamic_operations').eachRow(function (_row) {
												const record = $$('dynamic_operations').getItem(_row);
												wagons_direction = record.direction;
												if (record.train_number === row.train_number) {
													wagons_count += 1;
													wagons.push(record);
												}
											});
											if (wagons_count === input_wagons_count && wagons_direction !== input_wagons_direction) {
												console.log(5);
												if (row.cargo_weight === "" || row.cargo_weight === undefined || isNaN(row.cargo_weight) || row.cargo_weight === null) {
													console.log(6);

													data.params.data.forEach(function (item, i, arr) {
														console.log(parseInt(wagons[wagons_count - (i + 1)].brutto));
														console.log(parseInt(item.cargo_weight));
														out.push({
															wagon_number: wagons[wagons_count - (i + 1)].wagon_number,
															train_number: item.train_number,
															axels_count: item.axels_count,
															id: wagons[wagons_count - (i + 1)].id,
															cargo_weight: item.brutto,
															brutto: wagons[wagons.length - (i + 1)].brutto,
															doc_start_weight: parseInt(wagons[wagons_count - (i + 1)].brutto) - parseInt(item.brutto),
															cross_offset: item.cross_offset,
															offset_lengthwise: item.offset_lengthwise,
															side_diff: item.side_diff,
															speed: item.speed,
															direction: item.direction,
                                                            truck1_weight: parseInt(item.truck1_weight),
                                                            ft_axis_1: parseInt(item.ft_axis_1),
                                                            ft_axis_2: parseInt(item.ft_axis_2),
                                                            ft_axis_3: parseInt(item.ft_axis_3),
                                                            ft_axis_4: parseInt(item.ft_axis_4),
                                                            truck2_weight: parseInt(item.truck2_weight),
                                                            st_axis_1: parseInt(item.st_axis_1),
                                                            st_axis_2: parseInt(item.st_axis_2),
                                                            st_axis_3: parseInt(item.st_axis_3),
                                                            st_axis_4: parseInt(item.st_axis_4),
															type: item.type,
															user: item.user,
															write_date: item.write_date,
															write_time: item.write_time
														})
													});
													$$('dynamic_operations').parse(out);
													out.forEach(function (item, i, arr) {
														setWeight(item);
													})
												} else {
													out = data.params.data;
													$$('dynamic_operations').parse(out);
													out.forEach(function (item, i, arr) {
														setWeight(item);
													})
												}
											} else {
												out = data.params.data;
												$$('dynamic_operations').parse(out);
												out.forEach(function (item, i, arr) {
													setWeight(item);
												})
											}
										}
									}
									//BRUTTO
									else {
										var row = $$('dynamic_operations').getSelectedItem();
										if (row === undefined) {
											data.params.data.forEach(function (item, i, arr) {
												out.push({
													wagon_number: item.wagon_number,
													train_number: item.train_number,
													axels_count: item.axels_count,
													id: item.id,
													brutto: item.brutto,
													cross_offset: item.cross_offset,
													offset_lengthwise: item.offset_lengthwise,
													side_diff: item.side_diff,
													speed: item.speed,
													direction: item.direction,
                                                    truck1_weight: parseInt(item.truck1_weight),
                                                    ft_axis_1: parseInt(item.ft_axis_1),
                                                    ft_axis_2: parseInt(item.ft_axis_2),
                                                    ft_axis_3: parseInt(item.ft_axis_3),
                                                    ft_axis_4: parseInt(item.ft_axis_4),
                                                    truck2_weight: parseInt(item.truck2_weight),
                                                    st_axis_1: parseInt(item.st_axis_1),
                                                    st_axis_2: parseInt(item.st_axis_2),
                                                    st_axis_3: parseInt(item.st_axis_3),
                                                    st_axis_4: parseInt(item.st_axis_4),
													type: item.type,
													user: item.user,
													write_date: item.write_date,
													write_time: item.write_time
												});
											});
											$$('dynamic_operations').parse(out);
											out.forEach(function (item, i, arr) {
												setWeight(item);
											})
										} else {
											var input_wagons_count = 0;
											var input_wagons_direction = false;
											data.params.data.forEach(function (item, i, arr) {
												input_wagons_count += 1;
												input_wagons_direction = item.direction;
											});
											var wagons = [];
											var wagons_count = 0;
											var wagons_direction = 0;
											$$('dynamic_operations').eachRow(function (_row) {
												const record = $$('dynamic_operations').getItem(_row);
												wagons_direction = record.direction;
												if (record.train_number === row.train_number) {
													wagons_count += 1;
													wagons.push(record);
												}
											});
											if (wagons_count === input_wagons_count && wagons_direction !== input_wagons_direction) {
												console.log(5);
												if (row.brutto === "" || row.brutto === undefined || isNaN(row.brutto) || row.brutto === null) {
													console.log(6);

													data.params.data.forEach(function (item, i, arr) {
														console.log(parseInt(wagons[wagons_count - (i + 1)].brutto));
														console.log(parseInt(item.cargo_weight));
														out.push({
															wagon_number: wagons[wagons_count - (i + 1)].wagon_number,
															train_number: item.train_number,
															axels_count: item.axels_count,
															id: wagons[wagons_count - (i + 1)].id,
															brutto: item.brutto,
															cargo_weight: wagons[wagons.length - (i + 1)].cargo_weight,
															doc_start_weight: parseInt(item.brutto) - parseInt(wagons[wagons_count - (i + 1)].cargo_weight),
															cross_offset: item.cross_offset,
															offset_lengthwise: item.offset_lengthwise,
															side_diff: item.side_diff,
															speed: item.speed,
															direction: item.direction,
                                                            truck1_weight: parseInt(item.truck1_weight),
                                                            ft_axis_1: parseInt(item.ft_axis_1),
                                                            ft_axis_2: parseInt(item.ft_axis_2),
                                                            ft_axis_3: parseInt(item.ft_axis_3),
                                                            ft_axis_4: parseInt(item.ft_axis_4),
                                                            truck2_weight: parseInt(item.truck2_weight),
                                                            st_axis_1: parseInt(item.st_axis_1),
                                                            st_axis_2: parseInt(item.st_axis_2),
                                                            st_axis_3: parseInt(item.st_axis_3),
                                                            st_axis_4: parseInt(item.st_axis_4),
															type: item.type,
															user: item.user,
															write_date: item.write_date,
															write_time: item.write_time
														})
													});
													$$('dynamic_operations').parse(out);
													out.forEach(function (item, i, arr) {
														setWeight(item);
													})
												} else {
													out = data.params.data;
													$$('dynamic_operations').parse(out);
													out.forEach(function (item, i, arr) {
														setWeight(item);
													})
												}
											} else {
												out = data.params.data;
												$$('dynamic_operations').parse(out);
												out.forEach(function (item, i, arr) {
													setWeight(item);
												})
											}
										}
									}
								} else {
									out = data.params.data;
									$$('dynamic_operations').parse(out);
									out.forEach(function (item, i, arr) {
										setWeight(item);
									})
								}
							}
							i = i + 1;
						} else {
							imortant_message = "";
							webix.message({type: "error", text: _(data.params.message)});
							clearInterval(exchangeCycle);
							clearInterval(connectionCycle);
							currentExchange = "nothing";
							connectionType = "dynamic";
							connectionCycle = setInterval(function () {
								connection();
							}, timeoutForConnection);
						}
					} else {
						imortant_message = "";
						webix.message({type: "error", text: _(data.params.message)});
						clearInterval(exchangeCycle);
						clearInterval(connectionCycle);
						currentExchange = "nothing";
						connectionType = "dynamic";
						connectionCycle = setInterval(function () {
							connection();
						}, timeoutForConnection);
					}
				}).fail(function () {
				currentExchange = "nothing";
				clearInterval(exchangeCycle);
				clearInterval(connectionCycle);
				connectionType = "dynamic";
				connectionCycle = setInterval(function () {
					connection();
				}, timeoutForConnection);
			});
		}

		function getWeightDynamicWithChart () {
			var _methodName = "getWeightDynamic";
			webix.ajax().post(
				ip,
				{"method": "getWeightDynamic", "user": User, "params": {"write": true, "user": User}},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							i = i + 1;
							if (data.params.status === true) imortant_message = "Dynamic: Analysis";
							else imortant_message = "";
							if (data.params.speed === 0) imortant_message = "Dynamic: Waiting";
							else if (data.params.speed < 2 || data.params.speed > 10) imortant_message = "Speed limit error";
							else {
								imortant_message = "";
								imortant_message = "Dynamic: Weighing";
							}
							$$('_speed').setValue(data.params.speed);
							referenceView.app.callEvent("chartWeighingDynamicUpdate");
							if (data.params.data !== "None") {
								console.log(data);
								var out = [];
								if ($$("taraControl2").getValue() === 1) {	//TARA CONTROL = TRUE and BRUTTO
									//TARA
									if ($$("brutto/tara2").getValue() === 1) {
										var row = $$('dynamic_operations').getSelectedItem();
										if (row === undefined) {
											data.params.data.forEach(function (item, i, arr) {
												out.push({
													wagon_number: item.wagon_number,
													train_number: item.train_number,
													axels_count: item.axels_count,
													id: item.id,
													cargo_weight: item.brutto,
													brutto: null,
													cross_offset: item.cross_offset,
													offset_lengthwise: item.offset_lengthwise,
													side_diff: item.side_diff,
													speed: item.speed,
													direction: item.direction,
                                                    truck1_weight: parseInt(item.truck1_weight),
                                                    ft_axis_1: parseInt(item.ft_axis_1),
                                                    ft_axis_2: parseInt(item.ft_axis_2),
                                                    ft_axis_3: parseInt(item.ft_axis_3),
                                                    ft_axis_4: parseInt(item.ft_axis_4),
                                                    truck2_weight: parseInt(item.truck2_weight),
                                                    st_axis_1: parseInt(item.st_axis_1),
                                                    st_axis_2: parseInt(item.st_axis_2),
                                                    st_axis_3: parseInt(item.st_axis_3),
                                                    st_axis_4: parseInt(item.st_axis_4),
													type: item.type,
													user: item.user,
													write_date: item.write_date,
													write_time: item.write_time
												});
											});
											$$('dynamic_operations').parse(out);
											out.forEach(function (item, i, arr) {
												setWeight(item);
											})
										} else {
											console.log(4);
											var input_wagons_count = 0;
											var input_wagons_direction = false;
											data.params.data.forEach(function (item, i, arr) {
												input_wagons_count += 1;
												input_wagons_direction = item.direction;
											});
											var wagons = [];
											var wagons_count = 0;
											var wagons_direction = 0;
											$$('dynamic_operations').eachRow(function (_row) {
												const record = $$('dynamic_operations').getItem(_row);
												wagons_direction = record.direction;
												if (record.train_number === row.train_number) {
													wagons_count += 1;
													wagons.push(record);
												}
											});
											if (wagons_count === input_wagons_count && wagons_direction !== input_wagons_direction) {
												console.log(5);
												if (row.cargo_weight === "" || row.cargo_weight === undefined || isNaN(row.cargo_weight) || row.cargo_weight === null) {
													console.log(6);

													data.params.data.forEach(function (item, i, arr) {
														console.log(parseInt(wagons[wagons_count - (i + 1)].brutto));
														console.log(parseInt(item.cargo_weight));
														out.push({
															wagon_number: wagons[wagons_count - (i + 1)].wagon_number,
															train_number: item.train_number,
															axels_count: item.axels_count,
															id: wagons[wagons_count - (i + 1)].id,
															cargo_weight: item.brutto,
															brutto: wagons[wagons.length - (i + 1)].brutto,
															doc_start_weight: parseInt(wagons[wagons_count - (i + 1)].brutto) - parseInt(item.brutto),
															cross_offset: item.cross_offset,
															offset_lengthwise: item.offset_lengthwise,
															side_diff: item.side_diff,
															speed: item.speed,
															direction: item.direction,
                                                            truck1_weight: parseInt(item.truck1_weight),
                                                            ft_axis_1: parseInt(item.ft_axis_1),
                                                            ft_axis_2: parseInt(item.ft_axis_2),
                                                            ft_axis_3: parseInt(item.ft_axis_3),
                                                            ft_axis_4: parseInt(item.ft_axis_4),
                                                            truck2_weight: parseInt(item.truck2_weight),
                                                            st_axis_1: parseInt(item.st_axis_1),
                                                            st_axis_2: parseInt(item.st_axis_2),
                                                            st_axis_3: parseInt(item.st_axis_3),
                                                            st_axis_4: parseInt(item.st_axis_4),
															type: item.type,
															user: item.user,
															write_date: item.write_date,
															write_time: item.write_time
														})
													});
													$$('dynamic_operations').parse(out);
													out.forEach(function (item, i, arr) {
														setWeight(item);
													})
												} else {
													out = data.params.data;
													$$('dynamic_operations').parse(out);
													out.forEach(function (item, i, arr) {
														setWeight(item);
													})
												}
											} else {
												out = data.params.data;
												$$('dynamic_operations').parse(out);
												out.forEach(function (item, i, arr) {
													setWeight(item);
												})
											}
										}
									}
									//BRUTTO
									else {
										var row = $$('dynamic_operations').getSelectedItem();
										if (row === undefined) {
											data.params.data.forEach(function (item, i, arr) {
												out.push({
													wagon_number: item.wagon_number,
													train_number: item.train_number,
													axels_count: item.axels_count,
													id: item.id,
													brutto: item.brutto,
													cross_offset: item.cross_offset,
													offset_lengthwise: item.offset_lengthwise,
													side_diff: item.side_diff,
													speed: item.speed,
													direction: item.direction,
                                                    truck1_weight: parseInt(item.truck1_weight),
                                                    ft_axis_1: parseInt(item.ft_axis_1),
                                                    ft_axis_2: parseInt(item.ft_axis_2),
                                                    ft_axis_3: parseInt(item.ft_axis_3),
                                                    ft_axis_4: parseInt(item.ft_axis_4),
                                                    truck2_weight: parseInt(item.truck2_weight),
                                                    st_axis_1: parseInt(item.st_axis_1),
                                                    st_axis_2: parseInt(item.st_axis_2),
                                                    st_axis_3: parseInt(item.st_axis_3),
                                                    st_axis_4: parseInt(item.st_axis_4),
													type: item.type,
													user: item.user,
													write_date: item.write_date,
													write_time: item.write_time
												});
											});
											$$('dynamic_operations').parse(out);
											out.forEach(function (item, i, arr) {
												setWeight(item);
											})
										} else {
											var input_wagons_count = 0;
											var input_wagons_direction = false;
											data.params.data.forEach(function (item, i, arr) {
												input_wagons_count += 1;
												input_wagons_direction = item.direction;
											});
											var wagons = [];
											var wagons_count = 0;
											var wagons_direction = 0;
											$$('dynamic_operations').eachRow(function (_row) {
												const record = $$('dynamic_operations').getItem(_row);
												wagons_direction = record.direction;
												if (record.train_number === row.train_number) {
													wagons_count += 1;
													wagons.push(record);
												}
											});
											if (wagons_count === input_wagons_count && wagons_direction !== input_wagons_direction) {
												console.log(5);
												if (row.brutto === "" || row.brutto === undefined || isNaN(row.brutto) || row.brutto === null) {
													console.log(6);

													data.params.data.forEach(function (item, i, arr) {
														console.log(parseInt(wagons[wagons_count - (i + 1)].brutto));
														console.log(parseInt(item.cargo_weight));
														out.push({
															wagon_number: wagons[wagons_count - (i + 1)].wagon_number,
															train_number: item.train_number,
															axels_count: item.axels_count,
															id: wagons[wagons_count - (i + 1)].id,
															brutto: item.brutto,
															cargo_weight: wagons[wagons.length - (i + 1)].cargo_weight,
															doc_start_weight: parseInt(item.brutto) - parseInt(wagons[wagons_count - (i + 1)].cargo_weight),
															cross_offset: item.cross_offset,
															offset_lengthwise: item.offset_lengthwise,
															side_diff: item.side_diff,
															speed: item.speed,
															direction: item.direction,
                                                            truck1_weight: parseInt(item.truck1_weight),
                                                            ft_axis_1: parseInt(item.ft_axis_1),
                                                            ft_axis_2: parseInt(item.ft_axis_2),
                                                            ft_axis_3: parseInt(item.ft_axis_3),
                                                            ft_axis_4: parseInt(item.ft_axis_4),
                                                            truck2_weight: parseInt(item.truck2_weight),
                                                            st_axis_1: parseInt(item.st_axis_1),
                                                            st_axis_2: parseInt(item.st_axis_2),
                                                            st_axis_3: parseInt(item.st_axis_3),
                                                            st_axis_4: parseInt(item.st_axis_4),
															type: item.type,
															user: item.user,
															write_date: item.write_date,
															write_time: item.write_time
														})
													});
													$$('dynamic_operations').parse(out);
													out.forEach(function (item, i, arr) {
														setWeight(item);
													})
												} else {
													out = data.params.data;
													$$('dynamic_operations').parse(out);
													out.forEach(function (item, i, arr) {
														setWeight(item);
													})
												}
											} else {
												out = data.params.data;
												$$('dynamic_operations').parse(out);
												out.forEach(function (item, i, arr) {
													setWeight(item);
												})
											}
										}
									}
								} else {
									out = data.params.data;
									$$('dynamic_operations').parse(out);
									out.forEach(function (item, i, arr) {
										setWeight(item);
									})
								}
							}
							i = i + 1;
						} else {
							imortant_message = "";
							webix.message({type: "error", text: _(data.params.message)});
							clearInterval(exchangeCycle);
							clearInterval(connectionCycle);
							currentExchange = "nothing";
							connectionType = "dynamic";
							connectionCycle = setInterval(function () {
								connection();
							}, timeoutForConnection);
						}
					} else {
						imortant_message = "";
						webix.message({type: "error", text: _(data.params.message)});
						clearInterval(exchangeCycle);
						clearInterval(connectionCycle);
						currentExchange = "nothing";
						connectionType = "dynamic";
						connectionCycle = setInterval(function () {
							connection();
						}, timeoutForConnection);
					}
				}).fail(function () {
				currentExchange = "nothing";
				clearInterval(exchangeCycle);
				clearInterval(connectionCycle);
				connectionType = "dynamic";
				connectionCycle = setInterval(function () {
					connection();
				}, timeoutForConnection);
			});
		}

		function getCalibrationStaticTruck () {
			var _methodName = "getCalibrationData";
			webix.ajax().post(
				ip, {"method": "getCalibrationData", "user": User, "params": []},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							var params = data.params;
							$$("_leftweigth").setValue(params["1"]);
							$$("_rightweigth").setValue(params["2"]);
							$$("_weigth").setValue(params.weight);
							$$("__x").setValue(params.x);
							$$("__y").setValue(params.y);
							$$("_x1").setValue(params.x1);
							$$("_y1").setValue(params.y1);
							$$("_x2").setValue(params.x2);
							$$("_y2").setValue(params.y2);
							i = i + 1;
						} else {
							webix.message({type: "error", text: _(data.params.message)});
							clearInterval(exchangeCycle);
							clearInterval(connectionCycle);
							currentExchange = "nothing";
							connectionCycle = setInterval(function () {
								connection();
							}, timeoutForConnection);
						}
					} else {
						webix.message({type: "error", text: _(data.params.message)});
						clearInterval(exchangeCycle);
						clearInterval(connectionCycle);
						currentExchange = "nothing";
						connectionCycle = setInterval(function () {
							connection();
						}, timeoutForConnection);
					}
				});
		}

		function getCalibrationStaticWagon () {
			var _methodName = "getCalibrationData";
			webix.ajax().post(
				ip, {"method": "getCalibrationData", "user": User, "params": []},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							var params = data.params;
							$$("_leftweigth").setValue(params["1"]);
							$$("_rightweigth").setValue(params["2"]);
							$$("_weigth").setValue(params.weight);
							$$("__x").setValue(params.x);
							$$("__y").setValue(params.y);
							$$("_x1").setValue(params.x1);
							$$("_y1").setValue(params.y1);
							$$("_x2").setValue(params.x2);
							$$("_y2").setValue(params.y2);
							i = i + 1;
						} else {
							webix.message({type: "error", text: _(data.params.message)});
							clearInterval(exchangeCycle);
							clearInterval(connectionCycle);
							currentExchange = "nothing";
							connectionCycle = setInterval(function () {
								connection();
							}, timeoutForConnection);
						}
					} else {
						webix.message({type: "error", text: _(data.params.message)});
						clearInterval(exchangeCycle);
						clearInterval(connectionCycle);
						currentExchange = "nothing";
						connectionCycle = setInterval(function () {
							connection();
						}, timeoutForConnection);
					}
				});
		}

		function getCalibrationDynamic () {
			var _methodName = "getWeightDynamic";
			webix.ajax().post(
				ip,
				{"method": _methodName, "user": User, "params": {"write": false, "user": User}},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							i = i + 1;
							if (data.params.status === true) imortant_message = "Calibration: Analysis";
							else imortant_message = "";
							if (data.params.speed === 0) message = "Calibration: Waiting";
							else message = "Calibration: Weighing";
							$$("__speed").setValue(data.params.speed);
							$$("__axials").setValue(data.params.axels_count);
							referenceView.app.callEvent("chartCalibrationDynamicUpdate");
							i = i + 1;
						} else {
							webix.message({type: "error", text: _(data.params.message)});
							clearInterval(exchangeCycle);
							clearInterval(connectionCycle);
							currentExchange = "nothing";
							connectionType = "calibration.dynamic";
							connectionCycle = setInterval(function () {
								connection();
							}, timeoutForConnection);
						}
					} else {
						webix.message({type: "error", text: _(data.params.message)});
						clearInterval(exchangeCycle);
						clearInterval(connectionCycle);
						currentExchange = "nothing";
						connectionType = "calibration.dynamic";
						connectionCycle = setInterval(function () {
							connection();
						}, timeoutForConnection);
					}
				}).fail(function () {
				currentExchange = "nothing";
				clearInterval(exchangeCycle);
				clearInterval(connectionCycle);
				connectionType = "calibration.dynamic";
				connectionCycle = setInterval(function () {
					connection();
				}, timeoutForConnection);
			});
		}

		function getCalibrationAuto () {
			var _methodName = "getCalibrationDynamic";
			webix.ajax().post(
				ip, {"method": "getCalibrationDynamic", "user": User, "params": []},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							$$("_speed").setValue(data.params.speed);
							if (data.params.data !== "None") {
								$$("avrg_coof").setValue(data.params.avrg_coof);
								$$("avrg_percent").setValue(data.params.avrg_percent);
								$$('dyn_calibration').parse(data.params.data);
								referenceView.app.callEvent("setExchange=nothing");
								$$('auto_calibr_starter').setValue(_("Start"));
							}
							i = i + 1;
						} else {
							webix.message({type: "error", text: _(data.params.message)});
							clearInterval(exchangeCycle);
							clearInterval(connectionCycle);
							currentExchange = "nothing";
							connectionCycle = setInterval(function () {
								connection();
							}, timeoutForConnection);
						}
					} else {
						webix.message({type: "error", text: _(data.params.message)});
						clearInterval(exchangeCycle);
						clearInterval(connectionCycle);
						currentExchange = "nothing";
						connectionCycle = setInterval(function () {
							connection();
						}, timeoutForConnection);
					}
				});
		}

		function getVerificationStaticTruck () {
			var _methodName = "getWeight";
			webix.ajax().post(ip, {"method": "getWeight", "user": User, "params": []},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							var weight = parseInt(data.params.weight);
							var truck_1 = parseInt(data.params["1"]);
							var truck_2 = parseInt(data.params["2"]);
							var today = new Date();
							var hr = today.getHours();
							if (hr < 10) hr = "0" + hr;
							var min = today.getMinutes();
							if (min < 10) min = "0" + min;
							var sec = today.getSeconds();
							if (sec < 10) sec = "0" + sec;
							var current_time = hr + ":" + min + ":" + sec;
							$$('verification_weigth').setValue(weight);
							$$('verification_truck_1').setValue(truck_1);
							$$('verification_truck_2').setValue(truck_2);
							$$('verification_time').setValue(current_time);
							i = i + 1;
						} else {
							webix.message({type: "error", text: _(data.params.message)});
							clearInterval(connectionCycle);
							clearInterval(exchangeCycle);
							currentExchange = "nothing";
							connectionCycle = setInterval(function () {
								connection();
							}, timeoutForConnection);
						}
					} else {
						webix.message({type: "error", text: _(data.params.message)});
						clearInterval(connectionCycle);
						clearInterval(exchangeCycle);
						currentExchange = "nothing";
						connectionCycle = setInterval(function () {
							connection();
						}, timeoutForConnection);
					}
				});
		}

		function getVerificationStaticTruck2 () {
			var _methodName = "getWeight";
			webix.ajax().post(
				ip, {"method": "getWeight", "user": User, "params": []},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							var weight = parseInt(data.params.weight);
							var truck_1 = parseInt(data.params["1"]);
							var truck_2 = parseInt(data.params["2"]);
							var today = new Date();
							var hr = today.getHours();
							if (hr < 10) hr = "0" + hr;
							var min = today.getMinutes();
							if (min < 10) min = "0" + min;
							var sec = today.getSeconds();
							if (sec < 10) sec = "0" + sec;
							var current_time = hr + ":" + min + ":" + sec;
							$$('verification_weigth').setValue(weight);
							$$('verification_truck_1').setValue(truck_1);
							$$('verification_truck_2').setValue(truck_2);
							$$('verification_time').setValue(current_time);
							i = i + 1;
						} else {
							webix.message({type: "error", text: _(data.params.message)});
							clearInterval(connectionCycle);
							clearInterval(exchangeCycle);
							currentExchange = "nothing";
							connectionCycle = setInterval(function () {
								connection();
							}, timeoutForConnection);
						}
					} else {
						webix.message({type: "error", text: _(data.params.message)});
						clearInterval(connectionCycle);
						clearInterval(exchangeCycle);
						currentExchange = "nothing";
						connectionCycle = setInterval(function () {
							connection();
						}, timeoutForConnection);
					}
				});
		}

		function getVerificationStaticWagon () {
			var _methodName = "getWeight";
			webix.ajax().post(ip, {"method": "getWeight", "user": User, "params": []},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							var weight = parseInt(data.params.weight);
							var truck_1 = parseInt(data.params["1"]);
							var truck_2 = parseInt(data.params["2"]);
							var today = new Date();
							var hr = today.getHours();
							if (hr < 10) hr = "0" + hr;
							var min = today.getMinutes();
							if (min < 10) min = "0" + min;
							var sec = today.getSeconds();
							if (sec < 10) sec = "0" + sec;
							var current_time = hr + ":" + min + ":" + sec;
							$$('verification_weigth').setValue(weight);
							$$('verification_truck_1').setValue(truck_1);
							$$('verification_truck_2').setValue(truck_2);
							$$('verification_time').setValue(current_time);
							i = i + 1;
						} else {
							webix.message({type: "error", text: _(data.params.message)});
							clearInterval(connectionCycle);
							clearInterval(exchangeCycle);
							currentExchange = "nothing";
							connectionCycle = setInterval(function () {
								connection();
							}, timeoutForConnection);
						}
					} else {
						webix.message({type: "error", text: _(data.params.message)});
						clearInterval(connectionCycle);
						clearInterval(exchangeCycle);
						currentExchange = "nothing";
						connectionCycle = setInterval(function () {
							connection();
						}, timeoutForConnection);
					}
				});
		}

		function getVerificationDynamic () {
			var _methodName = "getVerificationDynamic";
			webix.ajax().post(
				ip,
				{"method": "getVerificationDynamic", "user": User, "params": {"user": User}},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					if (data.method === _methodName) {
						if (data.answer === "ok") {

							i = i + 1;
							if (data.params.status === true) imortant_message = "Verification: Analysis";
							else imortant_message = "";
							if (data.params.speed === 0) message = "Verification: Waiting";
							else message = "Verification: Weighing";
							if (data.params.data !== "None") {
								console.log(data);
								var wagons = [];
								$$('dynamic_verification_table').eachRow(function (_row) {
									const record = $$('dynamic_verification_table').getItem(_row);
									if (record.id < 6) {
										wagons.push(record.real_weight);
									}
								});
								var today = new Date();
								var hr = today.getHours();
								if (hr < 10) hr = "0" + hr;
								var min = today.getMinutes();
								if (min < 10) min = "0" + min;
								var sec = today.getSeconds();
								if (sec < 10) sec = "0" + sec;
								var current_time = hr + ":" + min + ":" + sec;
								var _measured_weight = 0;
								var _speed = 0;
								var _time;
								var _direction;
								var _real_weight = 0;
								var _imprecicsionKG = 0;
								var _imprecicsionPercent = 0;
								data.params.data.forEach(function (item, i, arr) {
									var obj = {};
									var measured_weight = parseInt(item.measured_weight);
									obj.id = item.id;
									obj.measured_weight = measured_weight;
									obj.direction = item.direction;
									obj.time = item.time;
									obj.speed = item.speed;
									_time = item.time;
									_measured_weight += measured_weight;
									_speed += item.speed;
									_direction = item.direction;
									var real_weight = wagons[i];
									_real_weight += real_weight;
									if (real_weight === null || real_weight === "" || real_weight === undefined || isNaN(real_weight)) real_weight = 0;
									if (real_weight !== 0) {
										var impresicionKG = 0;
										obj.time = current_time;
										if (real_weight > obj.measured_weight) {
											impresicionKG = real_weight - obj.measured_weight;
											obj.impresicionKG = impresicionKG;
											_imprecicsionKG += impresicionKG;
										} else {
											impresicionKG = obj.measured_weight - real_weight;
											obj.impresicionKG = impresicionKG;
											_imprecicsionKG += impresicionKG;
										}
										var imprecisionPercent = ((impresicionKG / real_weight) * 100);
										obj.imprecisionPercent = imprecisionPercent.toFixed(2);
										_imprecicsionPercent += imprecisionPercent;
									}
									$$('dynamic_verification_table').updateItem(obj.id, obj);
								});
								var obj = {};
								obj.id = 6;
								obj.measured_weight = _measured_weight;
								var temp = 0;
								if (_measured_weight > _real_weight) temp = _measured_weight - _real_weight;
								else temp = _real_weight - _measured_weight;

								obj.direction = _direction;
								obj.speed = (_speed / 5).toFixed(2);
								obj.time = _time;
								obj.imprecisionPercent = (temp / _real_weight).toFixed(2);
								obj.impresicionKG = temp;
								obj.real_weight = _real_weight;
								$$('dynamic_verification_table').updateItem(obj.id, obj);
								referenceView.app.callEvent("setExchange=nothing");
								$$('verification_starter_btn_dynamic').setValue(_("Start verification"));
							}
							i = i + 1;
						} else {
							webix.message({type: "error", text: _(data.params.message)});
							clearInterval(exchangeCycle);
							clearInterval(connectionCycle);
							currentExchange = "nothing";
							connectionType = "verification.dynamic";
							connectionCycle = setInterval(function () {
								connection();
							}, timeoutForConnection);
						}
					} else {
						webix.message({type: "error", text: _(data.params.message)});
						clearInterval(exchangeCycle);
						clearInterval(connectionCycle);
						currentExchange = "nothing";
						connectionType = "verification.dynamic";
						connectionCycle = setInterval(function () {
							connection();
						}, timeoutForConnection);
					}
				}).fail(function () {
				currentExchange = "nothing";
				clearInterval(exchangeCycle);
				clearInterval(connectionCycle);
				connectionType = "verification.dynamic";
				connectionCycle = setInterval(function () {
					connection();
				}, timeoutForConnection);
			});
		}

		function getADCdata () {
			var _methodName = "getADCdata";
			webix.ajax().post(
				ip, {"method": "getADCdata", "user": User, "params": []},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							$$("adcData1").parse(data.params["1"]);
							$$("adcData2").parse(data.params["2"]);
							i = i + 1;
						}
					}
				});
		}

		function getADCdataForWindow () {
			var _methodName = "getADCdata";
			webix.ajax().post(
				ip, {"method": "getADCdata", "user": User, "params": []},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							$$($$("nameForADCdata1").getValue()).parse(data.params["1"]);
							$$($$("nameForADCdata2").getValue()).parse(data.params["2"]);
							i = i + 1;
						}
					}
				});
		}

		function getCameras () {
			var _methodName = 'getCameras';
			webix.ajax().post(ip, {"method": "getCameras", "user": User, "params": []},
				function (text, xml, xhr) {
					var _data = JSON.parse(text);
					if (_data.method === _methodName) {
						if (_data.answer === 'ok') {
							cameras = [];
							_data.params.forEach(function (item, i, arr) {
								cameras.push({"id": item.id, "camera": item.name, "status": false})
							});
							exchangeCycleCAMERAS = true;
							var camerasdatatable = $$("nameForCAMERASdata").getValue();
							$$(camerasdatatable).clearAll();
						}
					}
				})
		}

		function setADCcolor (adcs, color) {
			var _color;
			if (color === 'grey') _color = '#475466';
			else if (color === 'green') _color = '#66ff33';
			else _color = '#cc0000';
			if (adcs.length === 0) adcs = [1, 2, 3, 4, 5, 6, 7, 8];
			adcs.forEach(function (item, i, arr) {
				$$("_adc" + item).setHTML('<div style="color: ' + _color + '; font-size: 10pt; margin-top: -5px !important" >' + item + '</div>');
			});
		}

		function getADCstatus () {
			var _methodName = "getADCstatus";
			var _configuration = $$('mainTop').$scope.app.config.configuration;
			var weighing_configuration = $$('mainTop').$scope.app.config.weighing;
			var blockinTime = $$('mainTop').$scope.app.config.globals.blockingTime;
			var today = new Date();
			if (today >= blockinTime) {
				warning = "Error 499: Call to support";
				_configuration.wagon_weighing_allowed = false;
				_configuration.weighing_allowed = false;
				setADCcolor([], 'grey');
				newv => referenceView.app.config.configuration = _configuration;
			} else {
				webix.ajax().post(
					ip,
					{"method": "getADCstatus", "user": User, "params": []},
					function (text, xml, xhr) {
						var data = JSON.parse(text);
						//console.log(data);
						if (data.method === _methodName) {
							//CAMERAS GOES HERE
							if (exchangeCycleCAMERAS) {
								var camerasdatatable = $$("nameForCAMERASdata").getValue();
								cameras.forEach(function (item, i, arr) {
									if (data.params.cameras.indexOf(item.id) !== -1) item.status = true;
									else item.status = false;
								});
								$$(camerasdatatable).parse(cameras);
							}
							if (data.answer === "ok") {
								//ВСЕ ДАТЧИКИ ЕСТЬ
								if (data.params.data.indexOf(1) === -1 && data.params.data.indexOf(2) === -1 && data.params.data.indexOf(3) === -1 && data.params.data.indexOf(4) === -1 && data.params.data.indexOf(5) === -1 && data.params.data.indexOf(6) === -1 && data.params.data.indexOf(7) === -1 && data.params.data.indexOf(8) === -1) {
									warning = "";
									message = "Connected";
									setADCcolor([], 'green');
									_configuration.wagon_weighing_allowed = true;
									_configuration.weighing_allowed = true;
									newv => referenceView.app.config.configuration = _configuration;
								}
								//ЕСТЬ ВСЯ ЛЕВАЯ ПЛАТФОРМА
								else if (data.params.data.indexOf(1) === -1 && data.params.data.indexOf(2) === -1 && data.params.data.indexOf(3) === -1 && data.params.data.indexOf(4) === -1) {
									_configuration.wagon_weighing_allowed = false;
									if (_configuration.wagon_weighing && weighing_configuration.dynamichidden) {
										warning = "Wagon weighing is not allowed";
										_configuration.weighing_allowed = false;
									} else {
										warning = "";
										message = "Connected";
										setADCcolor([], 'green');
										setADCcolor(data.params.data, 'red');
										if (_configuration.platform_for_dynamic === false) {
											_configuration.weighing_allowed = true;
										} else {
											_configuration.weighing_allowed = false;
											warning = "Wagon weighing is not allowed";
										}
									}
									newv => referenceView.app.config.configuration = _configuration;
								}
								//ЕСТЬ ВСЯ ПРАВАЯ ПЛАТФОРМА
								else if (data.params.data.indexOf(5) === -1 && data.params.data.indexOf(6) === -1 && data.params.data.indexOf(7) === -1 && data.params.data.indexOf(8) === -1) {
									_configuration.wagon_weighing_allowed = false;
									if (_configuration.wagon_weighing && weighing_configuration.dynamichidden) {
										warning = "Wagon weighing is not allowed";
										_configuration.weighing_allowed = false;
									} else {
										warning = "";
										message = "Connected";
										setADCcolor([], 'green');
										setADCcolor(data.params.data, 'red');
										if (_configuration.platform_for_dynamic === true) {
											_configuration.weighing_allowed = true;
										} else {
											_configuration.weighing_allowed = false;
											warning = "Wagon weighing is not allowed";
										}
									}
									newv => referenceView.app.config.configuration = _configuration;
								}
								//НЕТ НИ ОДНОЙ ПОЛНОСТЬЮ РАБОТАЮЩЕЙ ПЛАТФОРМЫ
								else {
									warning = "Warning: Error in ADC sensors";
									setADCcolor([], 'green');
									setADCcolor(data.params.data, 'red');
									_configuration.wagon_weighing_allowed = false;
									_configuration.weighing_allowed = false;
									newv => referenceView.app.config.configuration = _configuration;
								}
								i = i + 1;
							} else if (data.answer === "warning") {
								warning = "Connecting to PDO";
								_configuration.wagon_weighing_allowed = false;
								_configuration.weighing_allowed = false;
								setADCcolor([], 'grey');
								newv => referenceView.app.config.configuration = _configuration;
							} else {
								warning = "Error: Something went wrong";
								_configuration.wagon_weighing_allowed = false;
								_configuration.weighing_allowed = false;
								setADCcolor([], 'grey');
								newv => referenceView.app.config.configuration = _configuration;
								webix.message({type: "error", text: _(data.params.message)});
							}
						} else {
							warning = "Error: Something went wrong";
							setADCcolor([], 'red');
							_configuration.wagon_weighing_allowed = false;
							_configuration.weighing_allowed = false;
							newv => referenceView.app.config.configuration = _configuration;
							webix.message({type: "error", text: _(data.params.message)});
						}
					}).fail(function () {
					warning = "No backend connection";
					setADCcolor([], 'red');
					_configuration.wagon_weighing_allowed = false;
					_configuration.weighing_allowed = false;
					newv => referenceView.app.config.configuration = _configuration;
				});
			}
		}

		var statusTable = setInterval(function () {
			if (switcher) {
				$$('top1').setValue("");
				switcher = false;
			} else {
				if (warning !== "") {
					$$('top1').setValue(_(warning));
				} else if (imortant_message !== "") {
					$$('top1').setValue(_(imortant_message));
				} else $$('top1').setValue(_(message));
				switcher = true;
			}
		}, 500);

		var packetCounter = setInterval(function () {
			//console.log(_counter);
			_counter = 0;
		}, 1000);

		if (startGetADCstatus < 1) {
			adcStatusTimer = setInterval(function () {
				getADCstatus();
			}, 1000);
			startGetADCstatus = startGetADCstatus + 1;
		}

		this.app.attachEvent("refresh", function () {
			clearInterval(adcStatusTimer);
			clearInterval(statusTable);
		});

		this.app.attachEvent("setConnection=static.truck", function () {
			connectionType = "static.truck";
		});

		this.app.attachEvent("setConnection=static.wagon", function () {
			connectionType = "static.wagon";
		});

		this.app.attachEvent("setExchange=static.wagon", function () {
			currentExchange = "static.wagon";
		});

		this.app.attachEvent("setExchange=pause", function () {
			clearInterval(exchangeCycle);
		});

		this.app.attachEvent("setConnection=dynamic", function () {
			connectionType = "dynamic";
		});

		this.app.attachEvent("setConnection=dynamic.chart", function () {
			connectionType = "dynamic.chart";
		});

		this.app.attachEvent("setConnection=calibration.static", function () {
			connectionType = "calibration.static";
		});

		this.app.attachEvent("setConnection=calibration.dynamic", function () {
			connectionType = "calibration.dynamic";
		});

		this.app.attachEvent("setConnection=calibration.auto", function () {
			connectionType = "calibration.auto";
		});

		this.app.attachEvent("setConnection=verification.truck", function () {
			connectionType = "verification.truck";
		});

		this.app.attachEvent("setConnection=verification.truck2", function () {
			connectionType = "verification.truck2";
			currentExchange = "verification.truck2";
		});

		this.app.attachEvent("setConnection=verification.wagon", function () {
			connectionType = "verification.wagon";
		});

		this.app.attachEvent("setConnection=verification.dynamic", function () {
			connectionType = "verification.dynamic";
		});

		this.app.attachEvent("setExchange=nothing", function () {
			imortant_message = "Waiting";
			currentExchange = "nothing";
			clearInterval(exchangeCycle);
			clearInterval(connectionCycle);
		});

		this.app.attachEvent("currentView=dynamic", function () {
			var _configuration = $$('mainTop').$scope.app.config.configuration;
			_configuration.current_view = "dynamic";
			newv => referenceView.app.config.configuration = _configuration;
		});

		this.app.attachEvent("currentView=calibration", function () {
			var _configuration = $$('mainTop').$scope.app.config.configuration;
			_configuration.current_view = "calibration";
			newv => referenceView.app.config.configuration = _configuration;
		});

		this.app.attachEvent("currentView=calibration_dynamic", function () {
			var _configuration = $$('mainTop').$scope.app.config.configuration;
			_configuration.current_view = "calibration_dynamic";
			newv => referenceView.app.config.configuration = _configuration;
		});

		this.app.attachEvent("currentView=dynamic_chart", function () {
			var _configuration = $$('mainTop').$scope.app.config.configuration;
			_configuration.current_view = "dynamic_chart";
			newv => referenceView.app.config.configuration = _configuration;
		});

		this.app.attachEvent("currentView=static_truck", function () {
			var _configuration = $$('mainTop').$scope.app.config.configuration;
			_configuration.current_view = "static_truck";
			newv => referenceView.app.config.configuration = _configuration;
		});

		this.app.attachEvent("currentView=static", function () {
			var _configuration = $$('mainTop').$scope.app.config.configuration;
			_configuration.current_view = "static";
			newv => referenceView.app.config.configuration = _configuration;
		});

		this.app.attachEvent("connection", function () {
			connectionCycle = setInterval(function () {
				connection();
			}, timeoutForConnection);
		});

		this.app.attachEvent("exchange", function () {
			exchangeCycle = setInterval(function () {
				exchange();
			}, timeoutForExchange);
		});

		this.app.attachEvent("exchangeADC", function () {
			exchangeCycleADC = setInterval(function () {
				exchangeADC();
			}, timeoutForExchange);
		});

		this.app.attachEvent("exchangeADCstop", function () {
			clearInterval(exchangeCycleADC);
		});

		this.app.attachEvent("exchangeCAMERAS", function () {
			getCameras();
		});

		this.app.attachEvent("exchangeCAMERASstop", function () {
			exchangeCycleCAMERAS = false;
		});

		this.app.attachEvent("setMessage=Waiting", function () {
			imortant_message = "Waiting";
		});
	}

	destroy () {
		this.app.callEvent("refresh");
		this.app.callEvent("setExchange=nothing");
		this.app.detachEvent("setConnection=static.truck");
		this.app.detachEvent("setConnection=static.wagon");
		this.app.detachEvent("setConnection=dynamic");
		this.app.detachEvent("setConnection=calibration.static");
		this.app.detachEvent("setConnection=calibration.dynamic");
		this.app.detachEvent("setConnection=calibration.auto");
		this.app.detachEvent("setConnection=verification.static");
		this.app.detachEvent("setConnection=verification.dynamic");
		this.app.detachEvent("setExchange=nothing");
		this.app.detachEvent("connection");
		this.app.detachEvent("exchange");
		this.app.detachEvent("exchangeADC");
		this.app.detachEvent("exchangeADCstop");
	}
}

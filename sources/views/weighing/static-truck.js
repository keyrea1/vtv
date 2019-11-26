import {JetView} from "webix-jet";
import StaticTActionsTruck from "views/datatables/statictactionstruck";

export default class Static_truck extends JetView {
	config () {
		const lang = this.app.getService("locale").getLang();
		const theme = this.app.config.theme;
		const _ = this.app.getService("locale")._;
		const ids = this.app.config.ids;
		const hideOptions = this.app.config.hideOptions;
		const hidden = this.app.config.weighing["statichidden"];
		const ip = this.app.config.remoteHOST;
		const referenceView = this;
		const User = this.app.config.user;
		const Type = "static.truck";
		const access = this.app.config.globals.access;
		const config = $$('mainTop').$scope.app.config;
		const brb = parseInt($$('mainTop').$scope.app.config.configuration.brb);
		const datatable_name = "static_operations_truck";

		var dt1 = "dt1" + ids.dt1;
		var win1 = "win1" + ids.win1;
		var win2 = "wagonNumberWindows" + ids.win1;
		var numberOfWagon = "numberOfWagon" + ids.win1;
		var close = "close" + ids.close;
		ids.dt1 = ids.dt1 + 1;
		ids.wagonNumberWindowStatic = win2;
		ids.win1 = ids.win1 + 1;
		ids.close = ids.close + 1;
		newv => this.app.config.ids = ids;

		var staticWagonTimer;
		var next_wagon = true;
		var next_wagon2 = true;

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

		function setZero1 (weight) {
			var _configuration = $$('mainTop').$scope.app.config.configuration;
			var _methodName = "setZero1";
			if (_configuration.maximum_weight_at_zeroing >= weight) {
				if (_configuration.weighing_allowed) {
					webix.ajax().post(
						ip,
						{"method": "setZero", "user": User, "params": {"truck": [1, 2]}},
						function (text, xml, xhr) {
							var data = JSON.parse(text);
							if (data.method === _methodName) {
								if (data.answer === "ok") {
									webix.message({type: "default", text: _(data.params.message)});
								}
								else webix.message({
									type: "error", text: _(data.params.message)
								});
							}
							else webix.message({
								type: "error", text: _(data.params.message)
							});
						}
					);
				}
				else webix.message({
					type: "error", text: _("Weighing is not allowed")
				});
			}
			else webix.message({
				type: "error", text: _("Weight must be in allowed limits")
			});
		}

		function addOperationData (obj) {
			var _methodName = "addOperationData";
			if (_typeof(obj.doc_date) === "object") {
				try {
					var dd = obj.doc_date.getDate();
					var mm = obj.doc_date.getMonth() + 1; //January is 0!
					var yyyy = obj.doc_date.getFullYear();
					if (dd < 10) dd = "0" + dd;
					if (mm < 10) mm = "0" + mm;
					obj.doc_date = yyyy + "-" + mm + "-" + dd;
				}
				catch (e) {
					obj.doc_date = "";
				}
			}
			else if (_typeof(obj.doc_date) === "string")
				if (obj.doc_date.length > 10) {
					obj.doc_date = obj.doc_date.slice(0, 10);
				}
			var _row = {
				id: obj.id,
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
                truck2_weight: obj.truck2_weight,
                truck_diff: obj.truck_diff,
				side_diff: obj.side_diff,
				offset_lengthwise: obj.offset_lengthwise,
				cross_offset: obj.cross_offset,
				sender: obj.sender,
				reciever: obj.reciever,
				transporter: obj.transporter,
				departure_point: obj.departure_point,
				destination_point: obj.destination_point,
				cargo: obj.cargo,
				user: User,
				axels_count: obj.axels_count,
				photo_path: obj.photo_path,
				wagon_type: obj.wagon_type,
				lasttimeedited: obj.lasttimeedited,
				lasttimeeditor: obj.lasttimeeditor,
				lastdateedited: obj.lastdateedited,
				optional1: obj.optional1,
				optional2: obj.optional2,
				optional3: obj.optional3,
				optional4: obj.optional4,
				optional5: obj.optional5,
				autofilling: obj.autofilling,
				type: Type
			};
			var request = {
				"method": _methodName, "user": User,
				"params": {"reweight": 1, "type": Type, row: _row}
			};
			webix.ajax().post(
				ip, request,
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							$$('static_operations_wagon').updateItem(obj.id, obj);
						}
					}
				});
		}

		function getHidOptions () {
			var _methodName = "getHidOptions";
			webix.ajax().post(
				ip, {"method": _methodName, "user": User, "params": {"type": Type}},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							var resultCollumn = [];
							var aData = ["write_date", "write_time", "wagon_number", "start_weight", "doc_start_weight", "brutto", "cargo_weight", "overload", "doc_cargo_weight", "doc_number", "doc_date", "cargo_name", "capacity", "truck1_weight", "truck2_weight", "side_diff", "offset_lengthwise", "cross_offset", "sender", "reciever", "transporter", "departure_point", "destination_point", "cargo", "axels_count", "photo_path", "train_number", "wagon_type", "optional1", "optional2", "optional3", "optional4", "optional5", "autofilling", "lastdateedited", "lasttimeedited", "lasttimeeditor"];
							delete data.params.collumns.id;
							for (var key in data.params.collumns) {
								resultCollumn.push({
									"collumn": _(data.params.collumns[key]),
									"column": data.params.collumns[key],
									"hide": false
								});
								delete aData[aData.indexOf(data.params.collumns[key])];
							}
							aData.forEach(function (item, i, arr) {
								resultCollumn.push({
									"collumn": _(item),
									"column": item,
									"hide": true
								});
							});
							resultCollumn.forEach(function (item, i, arr) {
								if (item.hide !== true) {
									$$(datatable_name).moveColumn(item.column, i + 2);
								}
								else {
									if ($$(datatable_name).isColumnVisible(item.column)) {
										$$(datatable_name).hideColumn(item.column);
									}
								}
							});
						}
					}
				});
		}

		function setHidOptions (obj) {
			var _methodName = "setHidOptions";
			webix.ajax().post(
				ip, {"method": _methodName, "user": User, "params": {"type": Type, "columns": obj}},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							getHidOptions();
							webix.message({type: "default", text: _("Collumn settings are saved")});
						}
					}
				});
		}

		function getHidOptionsForConfigurator () {
			var _methodName = "getHidOptions";
			webix.ajax().post(
				ip, {"method": _methodName, "user": User, "params": {"type": Type}},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							var resultCollumn = [];
							var aData = ["write_date", "write_time", "wagon_number", "start_weight", "doc_start_weight", "brutto", "cargo_weight", "overload", "doc_cargo_weight", "doc_number", "doc_date", "cargo_name", "capacity", "truck1_weight", "truck2_weight", "side_diff", "offset_lengthwise", "cross_offset", "sender", "reciever", "transporter", "departure_point", "destination_point", "cargo", "axels_count", "photo_path", "train_number", "wagon_type", "optional1", "optional2", "optional3", "optional4", "optional5", "autofilling", "lastdateedited", "lasttimeedited", "lasttimeeditor"];
							delete data.params.collumns.id;
							for (var key in data.params.collumns) {
								resultCollumn.push({
									"collumn": _(data.params.collumns[key]),
									"column": data.params.collumns[key],
									"hide": false
								});
								delete aData[aData.indexOf(data.params.collumns[key])];
							}
							aData.forEach(function (item, i, arr) {
								resultCollumn.push({
									"collumn": _(item),
									"column": item,
									"hide": true
								});
							});
							data = resultCollumn;
							$$(dt1).clearAll();
							$$(dt1).parse(data);
						}
					}
				});
		}

		function setWeightBrutto (obj, reWrite, id) {
			var _methodName = "setWeight";
			var _row = {};
			if (obj.doc_start_weight !== undefined) _row = {
				id: obj.id,
				write_date: obj.write_date,
				write_time: obj.write_time,
				start_weight: obj.start_weight,
				doc_start_weight: obj.doc_start_weight,
				cargo_weight: obj.cargo_weight,
				doc_cargo_weight: obj.doc_cargo_weight,
				brutto: obj.brutto,
				truck1_weight: obj.truck1_weight,
                truck2_weight: obj.truck2_weight,
                truck_diff: obj.truck_diff,
				wagon_number: obj.wagon_number,
				side_diff: obj.side_diff,
				offset_lengthwise: obj.offset_lengthwise,
				cross_offset: obj.cross_offset,
				user: User,
				type: Type
			};
			else _row = {
				id: obj.id,
				write_date: obj.write_date,
				write_time: obj.write_time,
				start_weight: obj.start_weight,
				cargo_weight: obj.cargo_weight,
				doc_cargo_weight: obj.doc_cargo_weight,
				brutto: obj.brutto,
				truck1_weight: obj.truck1_weight,
				truck2_weight: obj.truck2_weight,
                truck_diff: obj.truck_diff,
				wagon_number: obj.wagon_number,
				side_diff: obj.side_diff,
				offset_lengthwise: obj.offset_lengthwise,
				cross_offset: obj.cross_offset,
				user: User,
				type: Type
			};
			webix.ajax().post(
				ip,
				{
					"method": _methodName, "user": User, "params": {
						"type": Type,
						row: _row
					}
				},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							webix.message({type: "default", text: _("Weigth complete")});
							if (reWrite) {
								if (next_wagon === true) {
									$$('static_operations_truck').updateItem(id, obj);
									next_wagon = false;
									$$('_bt_').setValue(_("Set weigth wagon"));
									//DISABLING TARA CONTROL AND TARA/NETTO SWITCHERS
									$$("taraControl").disable();
									$$("brutto/netto").disable();
                                    $$("reweighbtn").disable();
								} else {
									$$('static_operations_truck').updateItem(id, obj);
									$$('_bt_').setValue(_("Set weigth platform"));
									next_wagon = true;
									$$('static_operations_truck').unselectAll();
									//ENABLING TARA CONTROL AND TARA/NETTO SWITCHERS
									$$("taraControl").enable();
									$$("brutto/netto").enable();
                                    $$("reweighbtn").enable();
								}
							}
							else {
								if (next_wagon === true) {
									$$('static_operations_truck').add(obj);
									next_wagon = false;
									$$('_bt_').setValue(_("Set weigth wagon"));
									//DISABLING TARA CONTROL AND TARA/NETTO SWITCHERS
									$$("taraControl").disable();
									$$("brutto/netto").disable();
                                    $$("reweighbtn").disable();
								}
								else {
									$$('static_operations_truck').updateItem(obj.id, obj);
									$$('_bt_').setValue(_("Set weigth platform"));
									next_wagon = true;
									$$('static_operations_truck').unselectAll();
									//ENABLING TARA CONTROL AND TARA/NETTO SWITCHERS
									$$("taraControl").enable();
									$$("brutto/netto").enable();
                                    $$("reweighbtn").enable();
								}
							}
							wagonNumberWindow.hide();
						}
						else {
							webix.message({type: "error", text: _(data.params.message)});
							//ENABLING TARA CONTROL AND TARA/NETTO SWITCHERS
							$$("taraControl").enable();
							$$("brutto/netto").enable();
                            $$("reweighbtn").enable();
						}
					}
				}).fail(function () {
				let message = "No backend connection";
				webix.message({type: "error", text: _(message)});
				//ENABLING TARA CONTROL AND TARA/NETTO SWITCHERS
				$$("taraControl").enable();
				$$("brutto/netto").enable();
                $$("reweighbtn").enable();
			})
		}

		function setWeightNetto (obj, reWrite, id) {
			var _methodName = "setWeight";
			var _row = {};
			if (obj.doc_start_weight !== undefined) _row = {
				id: obj.id,
				write_date: obj.write_date,
				write_time: obj.write_time,
				start_weight: obj.start_weight,
				doc_start_weight: obj.doc_start_weight,
				cargo_weight: obj.cargo_weight,
				doc_cargo_weight: obj.doc_cargo_weight,
				brutto: obj.brutto,
				truck1_weight: obj.truck1_weight,
				truck2_weight: obj.truck2_weight,
				wagon_number: obj.wagon_number,
                truck_diff: obj.truck_diff,
				side_diff: obj.side_diff,
				offset_lengthwise: obj.offset_lengthwise,
				cross_offset: obj.cross_offset,
				user: User,
				type: Type
			};
			else _row = {
				id: obj.id,
				write_date: obj.write_date,
				write_time: obj.write_time,
				start_weight: obj.start_weight,
				cargo_weight: obj.cargo_weight,
				doc_cargo_weight: obj.doc_cargo_weight,
				brutto: obj.brutto,
				truck1_weight: obj.truck1_weight,
				truck2_weight: obj.truck2_weight,
				wagon_number: obj.wagon_number,
                truck_diff: obj.truck_diff,
				side_diff: obj.side_diff,
				offset_lengthwise: obj.offset_lengthwise,
				cross_offset: obj.cross_offset,
				user: User,
				type: Type
			};
			webix.ajax().post(
				ip,
				{
					"method": _methodName, "user": User, "params": {
						"type": Type,
						row: _row
					}
				},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							webix.message({type: "default", text: _("Weigth complete")});
							if (reWrite) {
								if (next_wagon === true) {
									$$('static_operations_truck').updateItem(id, obj);
									next_wagon = false;
									$$('_bt_').setValue(_("Set weigth wagon"));
									//DISABLING TARA CONTROL AND TARA/NETTO SWITCHERS
									$$("taraControl").disable();
									$$("brutto/netto").disable();
                                    $$("reweighbtn").disable();
								} else {
									$$('static_operations_truck').updateItem(id, obj);
									$$('_bt_').setValue(_("Set weigth platform"));
									next_wagon = true;
									$$('static_operations_truck').unselectAll();
									//ENABLING TARA CONTROL AND TARA/NETTO SWITCHERS
									$$("taraControl").enable();
									$$("brutto/netto").enable();
                                    $$("reweighbtn").enable();
								}
							}
							else {
								if (next_wagon === true) {
									$$('static_operations_truck').add(obj);
									next_wagon = false;
									$$('_bt_').setValue(_("Set weigth wagon"));
									//DISABLING TARA CONTROL AND TARA/NETTO SWITCHERS
									$$("taraControl").disable();
									$$("brutto/netto").disable();
                                    $$("reweighbtn").disable();
								}
								else {
									$$('static_operations_truck').updateItem(obj.id, obj);
									$$('_bt_').setValue(_("Set weigth platform"));
									next_wagon = true;
									$$('static_operations_truck').unselectAll();
									//ENABLING TARA CONTROL AND TARA/NETTO SWITCHERS
									$$("taraControl").enable();
									$$("brutto/netto").enable();
                                    $$("reweighbtn").enable();
								}
							}
							wagonNumberWindow.hide();
						}
						else {
							webix.message({type: "error", text: _(data.params.message)});
							//ENABLING TARA CONTROL AND TARA/NETTO SWITCHERS
							$$("taraControl").enable();
							$$("brutto/netto").enable();
                            $$("reweighbtn").enable();
						}
					}
				}).fail(function () {
				let message = "No backend connection";
				webix.message({type: "error", text: _(message)});
				//ENABLING TARA CONTROL AND TARA/NETTO SWITCHERS
				$$("taraControl").enable();
				$$("brutto/netto").enable();
                $$("reweighbtn").enable();
			});
		}

		function setWeight (wagonNumber) {
			var _weigth = $$('weight').getValue();
			var __weigthh = parseInt(_weigth);
			if (_weigth !== "0" && _weigth !== "" && __weigthh > 0) {
				if (next_wagon === true) {
					var today = new Date();
					var dd = today.getDate();
					var mm = today.getMonth() + 1; //January is 0!
					var yyyy = today.getFullYear();
					if (dd < 10) dd = "0" + dd;
					if (mm < 10) mm = "0" + mm;
					var current_date = yyyy + "-" + mm + "-" + dd;
					var hr = today.getHours();
					if (hr < 10) hr = "0" + hr;
					var min = today.getMinutes();
					if (min < 10) min = "0" + min;
					var sec = today.getSeconds();
					if (sec < 10) min = "0" + sec;
					var current_time = hr + ":" + min + ":" + sec;
					var weigth = parseInt(_weigth);
					var side_diff = parseInt($$('_side_diff').getValue());
					if (side_diff < 0) side_diff = -side_diff;
					var offset_lengthwise = parseInt($$('_offset_lengthwise').getValue());
					var cross_offset = parseInt($$('_cross_offset').getValue());
					var last_id = 0;
					var id;
					$$('static_operations_truck').eachRow(function (row) {
						const record = $$('static_operations_truck').getItem(row);
						if (last_id < record.id) last_id = record.id;
					});
					if (last_id !== 0) id = last_id + 1;
					else id = 1;
					if ($$("taraControl").getValue() === 1) {
						var _data = $$('static_operations_truck').getSelectedItem();
						var data = {};
						if (_data === undefined) {
							//NEW ROW
							if ($$("brutto/netto").getValue() === 1) {
								console.log(1);
								data = {
									"id": id,
									"write_date": current_date,
									"write_time": current_time,
									"cargo_weight": weigth,
									"truck1_weight": weigth,
									"truck2_weight": 0,
									"side_diff": side_diff,
									"wagon_number": wagonNumber,
									"offset_lengthwise": offset_lengthwise,
									"cross_offset": cross_offset,
									"type": Type
								};
								$$('staticTruckLastID').setValue(id);
								setWeightNetto(data, false, 0);
							}
							else {
								data = {
									"id": id,
									"write_date": current_date,
									"write_time": current_time,
									"brutto": weigth,
									"truck1_weight": weigth,
									"truck2_weight": 0,
                                    "side_diff": side_diff,
									"wagon_number": wagonNumber,
									"offset_lengthwise": offset_lengthwise,
									"cross_offset": cross_offset,
									"type": Type,
								};
								$$('staticTruckLastID').setValue(id);
								setWeightBrutto(data, false, 0);
							}
						}
						else {
							//ROW EXISTS
							if ($$('brutto/netto').getValue() === 1) {
								//TARA
								if (_data.cargo_weight === "" || _data.cargo_weight === null || _data['cargo_weight'] === undefined) {
									var data = {};
									if (_data.brutto !== "" && _data.brutto !== null && _data['brutto'] !== undefined) {
										data = {
											"id": _data.id,
											"write_date": current_date,
											"write_time": current_time,
											"doc_start_weight": _data.brutto - parseInt(weigth),
											"cargo_weight": parseInt(weigth),
											"truck1_weight": weigth,
											"truck2_weight": 0,
											"side_diff": side_diff,
											"wagon_number": wagonNumber,
											"offset_lengthwise": offset_lengthwise,
											"cross_offset": cross_offset,
											"type": Type
										};
									}
									else {
										data = {
											"id": _data.id,
											"write_date": current_date,
											"write_time": current_time,
											"cargo_weight": parseInt(weigth),
											"truck1_weight": parseInt(weigth),
											"truck2_weight": 0,
											"side_diff": side_diff,
											"wagon_number": wagonNumber,
											"offset_lengthwise": offset_lengthwise,
											"cross_offset": cross_offset,
											"type": Type
										};
									}
									$$('staticTruckLastID').setValue(_data.id);
									setWeightNetto(data, true, _data.id);
								}
								else {
									$$(datatable_name).unselectAll();
									webix.message({type: "error", text: _("NETTO is already set")});
								}
							}
							//BRUTTO
							else {
								if (_data.brutto === "" || _data.brutto === null || _data['brutto'] === undefined) {
									var data = {};
									if (_data.cargo_weight !== "" && _data.cargo_weight !== null && _data['cargo_weight'] !== undefined) {
										if (_data.doc_cargo_weight !== "" && _data.doc_cargo_weight !== null && _data['doc_cargo_weight'] !== undefined) {
											data = {
												"id": _data.id,
												"write_date": current_date,
												"write_time": current_time,
												"doc_start_weight": parseInt(weigth) - _data.cargo_weight,
												"start_weight": parseInt(weigth) - _data.doc_cargo_weight,
												"brutto": parseInt(weigth),
												"truck1_weight": parseInt(weigth),
												"truck2_weight": 0,
												"side_diff": side_diff,
												"wagon_number": wagonNumber,
												"offset_lengthwise": offset_lengthwise,
												"cross_offset": cross_offset,
												"type": Type
											};
										}
										else {
											data = {
												"id": _data.id,
												"write_date": current_date,
												"write_time": current_time,
												"doc_start_weight": parseInt(weigth) - _data.cargo_weight,
												"brutto": parseInt(weigth),
												"truck1_weight": parseInt(weigth),
												"truck2_weight": 0,
												"side_diff": side_diff,
												"wagon_number": wagonNumber,
												"offset_lengthwise": offset_lengthwise,
												"cross_offset": cross_offset,
												"type": Type
											};
										}
									}
									else {
										if (_data.doc_cargo_weight !== "" && _data.doc_cargo_weight !== null && _data['doc_cargo_weight'] !== undefined){
											data = {
												"id": _data.id,
												"write_date": current_date,
												"write_time": current_time,
												"brutto": parseInt(weigth),
												"start_weight": parseInt(weigth) - _data.doc_cargo_weight,
												"truck1_weight": parseInt(weigth),
												"truck2_weight": 0,
												"side_diff": side_diff,
												"wagon_number": wagonNumber,
												"offset_lengthwise": offset_lengthwise,
												"cross_offset": cross_offset,
												"type": Type
											};
										}
										else {
											data = {
												"id": _data.id,
												"write_date": current_date,
												"write_time": current_time,
												"brutto": parseInt(weigth),
												"truck1_weight": parseInt(weigth),
												"truck2_weight": 0,
												"side_diff": side_diff,
												"wagon_number": wagonNumber,
												"offset_lengthwise": offset_lengthwise,
												"cross_offset": cross_offset,
												"type": Type
											};
										}
									}
									$$('staticTruckLastID').setValue(_data.id);
									setWeightBrutto(data, true, _data.id);
								}
								else {
									$$('static_operations_truck').unselectAll();
									webix.message({type: "error", text: _("BRUTTO is already set")});
								}
							}
						}
					}
					else {
						var data = {};
						//TARA CONTROL OFF
							data = {
								"id": id,
								"write_date": current_date,
								"write_time": current_time,
								"brutto": parseInt(weigth),
								"truck1_weight": parseInt(weigth),
								"truck2_weight": 0,
								"side_diff": side_diff,
								"wagon_number": wagonNumber,
								"offset_lengthwise": offset_lengthwise,
								"cross_offset": cross_offset,
								"type": Type
							};
						$$('staticTruckLastID').setValue(id);
						setWeightBrutto(data, false, id);
					}
				}
				else {
					var today = new Date();
					var dd = today.getDate();
					var mm = today.getMonth() + 1; //January is 0!
					var yyyy = today.getFullYear();
					if (dd < 10) dd = "0" + dd;
					if (mm < 10) mm = "0" + mm;
					var current_date = yyyy + "-" + mm + "-" + dd;
					var hr = today.getHours();
					if (hr < 10) hr = "0" + hr;
					var min = today.getMinutes();
					if (min < 10) min = "0" + min;
					var sec = today.getSeconds();
					if (sec < 10) sec = "0" + sec;
					var current_time = hr + ":" + min + ":" + sec;
					var id = $$('staticTruckLastID').getValue();
					var wei1 = parseInt(_weigth);
					var cargo_weigth = $$(datatable_name).getItem(id).cargo_weight;
					if (cargo_weigth === undefined) cargo_weigth = 0;
					else cargo_weigth = parseInt(cargo_weigth);
					var brutto = $$(datatable_name).getItem(id).brutto;
					if (brutto === undefined) brutto = 0;
					else brutto = parseInt(brutto);
					var cart1weigth = parseInt($$(datatable_name).getItem(id).truck1_weight);
					var doc_start_weight = $$(datatable_name).getItem(id).doc_start_weight;
					if (doc_start_weight === undefined) doc_start_weight = 0;
					else doc_start_weight = parseInt(doc_start_weight);
                    var truck_diff = wei1 - cart1weigth;
                    if (truck_diff < 0) truck_diff = -truck_diff;
					var side_diff = parseInt($$('_side_diff').getValue());
					if (side_diff < 0) side_diff = -side_diff;
					var offset_lengthwise = ((wei1 / (wei1 + cart1weigth) * brb) - brb / 2).toFixed(0);
					var cross_offset = parseInt($$('_cross_offset').getValue());
					var _data = $$(datatable_name).getItem(id);
					cross_offset = ((cross_offset + _data.cross_offset) / 2).toFixed(0);
					console.log("222");
					if ($$("taraControl").getValue() === 1) {
						//NEW ROW
						if (_data === undefined) {
							webix.message({type: "error", text: _("Row with last weigth data not exist")});
						}
						//ROW EXISTS
						else {
							var id = _data.id;
							if ($$('brutto/netto').getValue() === 1) {
								//TARA
								var data = {};
								if (_data.brutto !== "" && _data.brutto !== null && _data['brutto'] !== undefined) {
									data = {
										"id": _data.id,
										"write_date": current_date,
										"write_time": current_time,
										"doc_start_weight": doc_start_weight - wei1,
										"cargo_weight": cargo_weigth + wei1,
										"truck1_weight": cart1weigth,
										"truck2_weight": wei1,
                                        "side_diff": side_diff,
                                        "truck_diff": truck_diff,
										"wagon_number": wagonNumber,
										//((вес 2-й тележки / общий вес) * длина между платформами) - длина между платформами / 2
										"offset_lengthwise": offset_lengthwise,
										"cross_offset": cross_offset,
										"type": Type
									};
								}
								else {
									data = {
										"id": _data.id,
										"write_date": current_date,
										"write_time": current_time,
										"cargo_weight": cargo_weigth + wei1,
										"truck1_weight": cart1weigth,
										"truck2_weight": wei1,
										"side_diff": side_diff,
                                        "truck_diff": truck_diff,
										"wagon_number": wagonNumber,
										"offset_lengthwise": offset_lengthwise,
										"cross_offset": cross_offset,
										"type": Type
									};
								}
								setWeightNetto(data, true, _data.id);
							}
							//BRUTTO
							else {
								var data = {};
								if (_data.cargo_weight === "" || _data.cargo_weight === null || _data['cargo_weight'] === undefined) {
									if (_data.doc_cargo_weight === "" || _data.doc_cargo_weight === null || _data['doc_cargo_weight'] === undefined) {
										data = {
											"id": _data.id,
											"write_date": current_date,
											"write_time": current_time,
											"brutto": brutto + wei1,
											"start_weight": brutto + wei1 - _data.doc_cargo_weight,
											"truck1_weight": cart1weigth,
											"truck2_weight": wei1,
											"side_diff": side_diff,
                                            "truck_diff": truck_diff,
											"wagon_number": wagonNumber,
											"offset_lengthwise": offset_lengthwise,
											"cross_offset": cross_offset,
											"type": Type
										};
									}
									else {
										data = {
											"id": _data.id,
											"write_date": current_date,
											"write_time": current_time,
											"brutto": brutto + wei1,
											"truck1_weight": cart1weigth,
											"truck2_weight": wei1,
											"side_diff": side_diff,
                                            "truck_diff": truck_diff,
											"wagon_number": wagonNumber,
											"offset_lengthwise": offset_lengthwise,
											"cross_offset": cross_offset,
											"type": Type
										};
									}
								}
								else {
									if (_data.doc_cargo_weight === "" || _data.doc_cargo_weight === null || _data['doc_cargo_weight'] === undefined) {
										data = {
											"id": _data.id,
											"write_date": current_date,
											"write_time": current_time,
											"doc_start_weight": doc_start_weight + wei1,
											"start_weight": brutto + wei1 - _data.doc_cargo_weight,
											"brutto": brutto + wei1,
											"truck1_weight": cart1weigth,
											"truck2_weight": wei1,
											"side_diff": side_diff,
                                            "truck_diff": truck_diff,
											"wagon_number": wagonNumber,
											"offset_lengthwise": offset_lengthwise,
											"cross_offset": cross_offset,
											"type": Type
										};
									}
									else {
										data = {
											"id": _data.id,
											"write_date": current_date,
											"write_time": current_time,
											"doc_start_weight": doc_start_weight + wei1,
											"brutto": brutto + wei1,
											"truck1_weight": cart1weigth,
											"truck2_weight": wei1,
											"side_diff": side_diff,
                                            "truck_diff": truck_diff,
											"wagon_number": wagonNumber,
											"offset_lengthwise": offset_lengthwise,
											"cross_offset": cross_offset,
											"type": Type
										};
									}
								}
								setWeightBrutto(data, true, _data.id);
							}
						}
						$$(datatable_name).unselectAll();
					}
					//TARA CONTROL
					else {
						var data = {};
						if (_data.doc_cargo_weight === "" || _data.doc_cargo_weight === null || _data['doc_cargo_weight'] === undefined) {
							data = {
								"id": id,
								"write_date": current_date,
								"write_time": current_time,
								"brutto": brutto + wei1,
								"start_weight": brutto + wei1 - _data.doc_cargo_weight,
								"truck1_weight": cart1weigth,
								"truck2_weight": wei1,
                                "truck_diff": truck_diff,
								"side_diff": side_diff,
								"wagon_number": wagonNumber,
								"offset_lengthwise": offset_lengthwise,
								"cross_offset": cross_offset,
								"type": Type
							};
						}
						else {
							data = {
								"id": id,
								"write_date": current_date,
								"write_time": current_time,
								"brutto": brutto + wei1,
								"truck1_weight": cart1weigth,
								"truck2_weight": wei1,
                                "truck_diff": truck_diff,
								"side_diff": side_diff,
								"wagon_number": wagonNumber,
								"offset_lengthwise": offset_lengthwise,
								"cross_offset": cross_offset,
								"type": Type
							};
						}
						setWeightBrutto(data, false, id);
						$$(datatable_name).unselectAll();
					}
					$$(win2).hide();
				}
			}
			else {
				webix.message({
					type: "error",
					text: _("Weight must be more than zero")
				});
			}
		}

		function updateWeight (_id, wagonNumber) {
			var _weigth = $$('weight').getValue();
			var __weigth = parseInt(_weigth);
			if (_weigth !== "0" && _weigth !== "" && __weigth > 0) {
				if (next_wagon) {
					var today = new Date();
					var dd = today.getDate();
					var mm = today.getMonth() + 1; //January is 0!
					var yyyy = today.getFullYear();
					if (dd < 10) dd = "0" + dd;
					if (mm < 10) mm = "0" + mm;
					var current_date = yyyy + "-" + mm + "-" + dd;
					var hr = today.getHours();
					if (hr < 10) hr = "0" + hr;
					var min = today.getMinutes();
					if (min < 10) min = "0" + min;
					var sec = today.getSeconds();
					if (sec < 10) sec = "0" + sec;
					var current_time = hr + ":" + min + ":" + sec;
					var weigth = parseInt(_weigth);
					var id = _id;
					var _data = $$(datatable_name).getItem(id);
					var cart1weigth = weigth;
					var cart2weigth = _data.truck1_weight;
					if (cart2weigth === undefined || cart2weigth === "" || cart2weigth === null) cart2weigth = 0;
					var brutto = _data.brutto;
					if (brutto === undefined || brutto === "" || brutto === null) brutto = 0;
					var cargo_weight = _data.cargo_weight;
					if (cargo_weight === undefined || cargo_weight === "" || cargo_weight === null) cargo_weight = 0;
					var doc_cargo_weight = _data.doc_cargo_weight;
					if (doc_cargo_weight === undefined || doc_cargo_weight === "" || doc_cargo_weight === null) doc_cargo_weight = 0;
                    var truck_diff = cart2weigth - cart1weigth;
                    if (truck_diff < 0) truck_diff = -truck_diff;
					var side_diff = parseInt($$('_side_diff').getValue());
					if (side_diff < 0) side_diff = -side_diff;
					var offset_lengthwise = parseInt($$('_offset_lengthwise').getValue());
					var cross_offset = parseInt($$('_cross_offset').getValue());
					if ($$("taraControl").getValue() === 1) {
						if (_data !== undefined) {
							//ROW EXISTS
							if ($$('brutto/netto').getValue() === 1) {
								if (cargo_weight !== 0) {
									webix.message({type: "error", text: _("Weight is already set")})
								}
								else {
									//TARA
									//CALC CARGO WEIGHT
									var data = {};
									if (brutto !== 0) {
										data = {
											"id": id,
											"write_date": current_date,
											"write_time": current_time,
											"cargo_weight": weigth,
											"doc_start_weight": brutto - weigth,
											"truck1_weight": cart1weigth,
											"truck2_weight": cart2weigth,
                                            "side_diff": side_diff,
                                            "truck_diff": truck_diff,
											"wagon_number": wagonNumber,
											"offset_lengthwise": offset_lengthwise,
											"cross_offset": cross_offset,
											"type": Type
										};
									}
									else {
										data = {
											"id": id,
											"write_date": current_date,
											"write_time": current_time,
											"cargo_weight": parseInt(weigth) + cargo_weight,
											"truck1_weight": cart1weigth,
											"truck2_weight": cart2weigth,
											"side_diff": side_diff,
                                            "truck_diff": truck_diff,
											"wagon_number": wagonNumber,
											"offset_lengthwise": offset_lengthwise,
											"cross_offset": cross_offset,
											"type": Type
										};
									}
									$$('staticTruckLastID').setValue(_data.id);
									setWeightNetto(data, true, _data.id);
								}
							}
							//BRUTTO
							else {
								if (brutto !== 0) {
									webix.message({type: "error", text: _("Weight is already set")})
								}
								else {
									var data = {};
									if (cargo_weight !== 0) {
										if (doc_cargo_weight !== 0) {
											data = {
												"id": _data.id,
												"write_date": current_date,
												"write_time": current_time,
												"brutto": parseInt(weigth) + brutto,
												"doc_start_weight": parseInt(weigth) + brutto - cargo_weight,
												"start_weight": parseInt(weigth) + brutto - doc_cargo_weight,
												"truck1_weight": cart1weigth,
												"truck2_weight": cart2weigth,
												"side_diff": side_diff,
                                                "truck_diff": truck_diff,
												"wagon_number": wagonNumber,
												"offset_lengthwise": offset_lengthwise,
												"cross_offset": cross_offset,
												"type": Type
											};
										}
										else {
											data = {
												"id": _data.id,
												"write_date": current_date,
												"write_time": current_time,
												"brutto": parseInt(weigth) + brutto,
												"doc_start_weight": parseInt(weigth) + brutto - cargo_weight,
												"truck1_weight": cart1weigth,
												"truck2_weight": cart2weigth,
												"side_diff": side_diff,
                                                "truck_diff": truck_diff,
												"wagon_number": wagonNumber,
												"offset_lengthwise": offset_lengthwise,
												"cross_offset": cross_offset,
												"type": Type
											};
										}
									}
									else {
										if (doc_cargo_weight) {
											data = {
												"id": _data.id,
												"write_date": current_date,
												"write_time": current_time,
												"brutto": parseInt(weigth) + brutto,
												"start_weight": parseInt(weigth) + brutto - doc_cargo_weight,
												"truck1_weight": cart1weigth,
												"truck2_weight": cart2weigth,
												"side_diff": side_diff,
                                                "truck_diff": truck_diff,
												"wagon_number": wagonNumber,
												"offset_lengthwise": offset_lengthwise,
												"cross_offset": cross_offset,
												"type": Type
											};
										}
										else {
											data = {
												"id": _data.id,
												"write_date": current_date,
												"write_time": current_time,
												"brutto": parseInt(weigth) + brutto,
												"truck1_weight": cart1weigth,
												"truck2_weight": cart2weigth,
												"side_diff": side_diff,
                                                "truck_diff": truck_diff,
												"wagon_number": wagonNumber,
												"offset_lengthwise": offset_lengthwise,
												"cross_offset": cross_offset,
												"type": Type
											};
										}
									}
									$$('staticTruckLastID').setValue(_data.id);
									setWeightBrutto(data, true, _data.id);
								}
							}
						}
					}
					else {
						//TARA CONTROL OFF
						if (brutto !== 0) {
							webix.message({type: "error", text: _("Weight is already set")})
						}
						else {
							if (cargo_weight !== 0) {
								if (doc_cargo_weight !== 0) {
									data = {
										"id": _data.id,
										"write_date": current_date,
										"write_time": current_time,
										"brutto": parseInt(weigth) + brutto,
										"doc_start_weight": parseInt(weigth) + brutto - _data.cargo_weight,
										"start_weight": parseInt(weigth) + brutto - _data.doc_cargo_weight,
										"truck1_weight": cart1weigth,
										"truck2_weight": cart2weigth,
										"side_diff": side_diff,
                                        "truck_diff": truck_diff,
										"wagon_number": wagonNumber,
										"offset_lengthwise": offset_lengthwise,
										"cross_offset": cross_offset,
										"type": Type
									};
								}
								else {
									data = {
										"id": _data.id,
										"write_date": current_date,
										"write_time": current_time,
										"brutto": parseInt(weigth) + brutto,
										"doc_start_weight": parseInt(weigth) + brutto - _data.cargo_weight,
										"truck1_weight": cart1weigth,
										"truck2_weight": cart2weigth,
										"side_diff": side_diff,
                                        "truck_diff": truck_diff,
										"wagon_number": wagonNumber,
										"offset_lengthwise": offset_lengthwise,
										"cross_offset": cross_offset,
										"type": Type
									};
								}
							}
							else {
								if (doc_cargo_weight !== 0) {
									data = {
										"id": _data.id,
										"write_date": current_date,
										"write_time": current_time,
										"brutto": parseInt(weigth) + brutto,
										"start_weight": parseInt(weigth) + brutto - _data.doc_cargo_weight,
										"truck1_weight": cart1weigth,
										"truck2_weight": cart2weigth,
										"side_diff": side_diff,
                                        "truck_diff": truck_diff,
										"wagon_number": wagonNumber,
										"offset_lengthwise": offset_lengthwise,
										"cross_offset": cross_offset,
										"type": Type
									};
								}
								else {
									data = {
										"id": _data.id,
										"write_date": current_date,
										"write_time": current_time,
										"brutto": parseInt(weigth) + brutto,
										"truck1_weight": cart1weigth,
										"truck2_weight": cart2weigth,
										"side_diff": side_diff,
                                        "truck_diff": truck_diff,
										"wagon_number": wagonNumber,
										"offset_lengthwise": offset_lengthwise,
										"cross_offset": cross_offset,
										"type": Type
									};
								}
							}
							$$('staticTruckLastID').setValue(_data.id);
							setWeightBrutto(data, true, _data.id);
						}
					}
				}
				else {
					var today = new Date();
					var dd = today.getDate();
					var mm = today.getMonth() + 1; //January is 0!
					var yyyy = today.getFullYear();
					if (dd < 10) dd = "0" + dd;
					if (mm < 10) mm = "0" + mm;
					var current_date = yyyy + "-" + mm + "-" + dd;
					var hr = today.getHours();
					if (hr < 10) hr = "0" + hr;
					var min = today.getMinutes();
					if (min < 10) min = "0" + min;
					var sec = today.getSeconds();
					if (sec < 10) sec = "0" + sec;
					var current_time = hr + ":" + min + ":" + sec;
					var id = _id;
					var _data = $$(datatable_name).getItem(id);
					var weigth = parseInt(_weigth);
					var cart1weigth = weigth;
					var cart2weigth = _data.truck1_weight;
					var brutto = _data.brutto;
					if (brutto === null || brutto === "" || brutto === undefined) brutto = 0;
					var cargo_weight = _data.cargo_weight;
					if (cargo_weight === null || cargo_weight === "" || cargo_weight === undefined) cargo_weight = 0;
					var doc_cargo_weight = _data.doc_cargo_weight;
					if (doc_cargo_weight === null || doc_cargo_weight === "" || doc_cargo_weight === undefined) doc_cargo_weight = 0;
                    var side_diff = parseInt($$('_side_diff').getValue());
                    if (side_diff < 0) side_diff = -side_diff;
                    var truck_diff = cart2weigth - cart1weigth;
                    if (truck_diff < 0) truck_diff = -truck_diff;
					var offset_lengthwise = ((cart1weigth / (cart1weigth + cart2weigth) * brb) - brb / 2).toFixed(0);
					if (offset_lengthwise < 0) offset_lengthwise = -offset_lengthwise;
					var cross_offset = parseInt($$('_cross_offset').getValue());
					cross_offset = ((cross_offset + _data.cross_offset) / 2).toFixed(0);
					if ($$("taraControl").getValue() === 1) {
						if (_data !== undefined) {
							//ROW EXISTS
							if ($$('brutto/netto').getValue() === 1) {
								//TARA
								//CALC CARGO WEIGHT
								var data = {};
								if (brutto !== 0) {
									data = {
										"id": id,
										"write_date": current_date,
										"write_time": current_time,
										"cargo_weight": parseInt(weigth) + cargo_weight,
										"doc_start_weight": _data.doc_start_weight - parseInt(weigth),
										"truck1_weight": cart1weigth,
										"truck2_weight": cart2weigth,
                                        "side_diff": side_diff,
                                        "truck_diff": truck_diff,
										"wagon_number": wagonNumber,
										"offset_lengthwise": offset_lengthwise,
										"cross_offset": cross_offset,
										"type": Type
									};
								}
								else {
									data = {
										"id": id,
										"write_date": current_date,
										"write_time": current_time,
										"cargo_weight": parseInt(weigth) + cargo_weight,
										"truck1_weight": cart1weigth,
										"truck2_weight": cart2weigth,
										"side_diff": side_diff,
                                        "truck_diff": truck_diff,
										"wagon_number": wagonNumber,
										"offset_lengthwise": offset_lengthwise,
										"cross_offset": cross_offset,
										"type": Type
									};
								}
								setWeightNetto(data, true, _data.id);
							}
							//BRUTTO
							else {
								var data = {};
								if (cargo_weight !== 0) {
									if (doc_cargo_weight !== 0) {
										data = {
											"id": _data.id,
											"write_date": current_date,
											"write_time": current_time,
											"brutto": parseInt(weigth) + brutto,
											"start_weight": parseInt(weigth) + brutto - doc_cargo_weight,
											"doc_start_weight": parseInt(weigth) + brutto - _data.cargo_weight,
											"truck1_weight": cart1weigth,
											"truck2_weight": cart2weigth,
											"side_diff": side_diff,
                                            "truck_diff": truck_diff,
											"wagon_number": wagonNumber,
											"offset_lengthwise": offset_lengthwise,
											"cross_offset": cross_offset,
											"type": Type
										};
									}
									else {
										data = {
											"id": _data.id,
											"write_date": current_date,
											"write_time": current_time,
											"brutto": parseInt(weigth) + brutto,
											"doc_start_weight": parseInt(weigth) + brutto - _data.cargo_weight,
											"truck1_weight": cart1weigth,
											"truck2_weight": cart2weigth,
											"side_diff": side_diff,
                                            "truck_diff": truck_diff,
											"wagon_number": wagonNumber,
											"offset_lengthwise": offset_lengthwise,
											"cross_offset": cross_offset,
											"type": Type
										};
									}
								}
								else {
									if (doc_cargo_weight !== 0) {
										data = {
											"id": _data.id,
											"write_date": current_date,
											"write_time": current_time,
											"brutto": parseInt(weigth) + brutto,
											"start_weight": parseInt(weigth) + brutto - doc_cargo_weight,
											"truck1_weight": cart1weigth,
											"truck2_weight": cart2weigth,
											"side_diff": side_diff,
                                            "truck_diff": truck_diff,
											"wagon_number": wagonNumber,
											"offset_lengthwise": offset_lengthwise,
											"cross_offset": cross_offset,
											"type": Type
										};
									}
									else {
										data = {
											"id": _data.id,
											"write_date": current_date,
											"write_time": current_time,
											"brutto": parseInt(weigth) + brutto,
											"truck1_weight": cart1weigth,
											"truck2_weight": cart2weigth,
											"side_diff": side_diff,
                                            "truck_diff": truck_diff,
											"wagon_number": wagonNumber,
											"offset_lengthwise": offset_lengthwise,
											"cross_offset": cross_offset,
											"type": Type
										};
									}
								}
								setWeightBrutto(data, true, _data.id);
							}
						}
					}
					else {
						//TARA CONTROL OFF
						if (cargo_weight !== 0) {
							if (doc_cargo_weight !== 0) {
								data = {
									"id": _data.id,
									"write_date": current_date,
									"write_time": current_time,
									"start_weight": parseInt(weigth) + brutto - doc_cargo_weight,
									"brutto": parseInt(weigth) + brutto,
									"doc_start_weight": parseInt(weigth) + brutto - cargo_weight,
									"truck1_weight": cart1weigth,
									"truck2_weight": cart2weigth,
									"side_diff": side_diff,
                                    "truck_diff": truck_diff,
									"wagon_number": wagonNumber,
									"offset_lengthwise": offset_lengthwise,
									"cross_offset": cross_offset,
									"type": Type
								};
							}
							else {
								data = {
									"id": _data.id,
									"write_date": current_date,
									"write_time": current_time,
									"brutto": parseInt(weigth) + brutto,
									"doc_start_weight": parseInt(weigth) + brutto - cargo_weight,
									"truck1_weight": cart1weigth,
									"truck2_weight": cart2weigth,
									"side_diff": side_diff,
                                    "truck_diff": truck_diff,
									"wagon_number": wagonNumber,
									"offset_lengthwise": offset_lengthwise,
									"cross_offset": cross_offset,
									"type": Type
								};
							}
						}
						else {
							if (doc_cargo_weight !== 0) {
								data = {
									"id": _data.id,
									"write_date": current_date,
									"write_time": current_time,
									"start_weight": parseInt(weigth) + brutto - doc_cargo_weight,
									"brutto": parseInt(weigth) + brutto,
									"truck1_weight": cart1weigth,
									"truck2_weight": cart2weigth,
									"side_diff": side_diff,
                                    "truck_diff": truck_diff,
									"wagon_number": wagonNumber,
									"offset_lengthwise": offset_lengthwise,
									"cross_offset": cross_offset,
									"type": Type
								};
							}
							else {
								data = {
									"id": _data.id,
									"write_date": current_date,
									"write_time": current_time,
									"brutto": parseInt(weigth) + brutto,
									"truck1_weight": cart1weigth,
									"truck2_weight": cart2weigth,
									"side_diff": side_diff,
                                    "truck_diff": truck_diff,
									"wagon_number": wagonNumber,
									"offset_lengthwise": offset_lengthwise,
									"cross_offset": cross_offset,
									"type": Type
								};
							}

						}
						setWeightBrutto(data, true, _data.id);
					}
				}
			}
			else webix.message({type: "error", text: _("Weight must be more than zero")});
		}

		function reweigh() {
			var _weigth = $$('weight').getValue();
			if (_weigth !== "0" && _weigth !== "") {
				var data = $$(datatable_name).getSelectedItem();
				if (data !== undefined) {
					if (next_wagon2 === true) {
						var id = data.id;
						var lastdateedited;
						var lasttimeedited;
						var lasttimeeditor;
						var today = new Date();
						var dd = today.getDate();
						var mm = today.getMonth() + 1; //January is 0!
						var yyyy = today.getFullYear();
						if (dd < 10) dd = "0" + dd;
						if (mm < 10) mm = "0" + mm;
						var current_date = yyyy + "-" + mm + "-" + dd;
						var hr = today.getHours();
						if (hr < 10) hr = "0" + hr;
						var min = today.getMinutes();
						if (min < 10) min = "0" + min;
						var sec = today.getSeconds();
						if (sec < 10) sec = "0" + sec;
						var current_time = hr + ":" + min + ":" + sec;
						lastdateedited = current_date;
						lasttimeedited = current_time;
						lasttimeeditor = User;
						var weigth = parseInt(_weigth);
						var cart1weigth = weigth;
						var doc_cargo_weight = data.doc_cargo_weight;
						if (doc_cargo_weight === null || doc_cargo_weight === "" || doc_cargo_weight === undefined || isNaN(doc_cargo_weight)) doc_cargo_weight = 0;
						var cargo_weight = data.cargo_weight;
						if (cargo_weight === null || cargo_weight === "" || cargo_weight === undefined || isNaN(cargo_weight)) cargo_weight = 0;
						var brutto = data.brutto;
						if (brutto === null || brutto === "" || brutto === undefined || isNaN(brutto)) brutto = 0;
						var side_diff = parseInt($$('_side_diff').getValue());
						if (side_diff < 0) side_diff = -side_diff;
						var offset_lengthwise = parseInt($$('_offset_lengthwise').getValue());
						var cross_offset = parseInt($$('_cross_offset').getValue());
						$$('staticTruckLastID2').setValue(id);
						//TODO: refactor next_wagon2, put it in the reweight methods
						next_wagon2 = false;
						//TARA CONTROL
						if ($$("taraControl").getValue() === 1) {
							//TARA
							if ($$('brutto/netto').getValue() === 1) {
								var _data = {};
								if (brutto !== 0) {
									_data = {
										"id": id,
										"write_date": data.write_date,
										"write_time": data.write_time,
										"cargo_weight": weigth,
										"doc_start_weight": brutto - weigth,
										"truck1_weight": cart1weigth,
										"truck2_weight": '0',
										"side_diff": side_diff,
										"offset_lengthwise": offset_lengthwise,
										"cross_offset": cross_offset,
										"type": Type,
										"lastdateedited": lastdateedited,
										"lasttimeedited": lasttimeedited,
										"lasttimeeditor": lasttimeeditor
									};
								}
								else {
									_data = {
										"id": id,
										"write_date": data.write_date,
										"write_time": data.write_time,
										"cargo_weight": weigth,
										"truck1_weight": cart1weigth,
										"truck2_weight": '0',
										"side_diff": side_diff,
										"offset_lengthwise": offset_lengthwise,
										"cross_offset": cross_offset,
										"type": Type,
										"lastdateedited": lastdateedited,
										"lasttimeedited": lasttimeedited,
										"lasttimeeditor": lasttimeeditor
									};
								}
								reWeightNetto(_data);
							}
							else {
								var _data = {};
								if (cargo_weight !== 0) {
									_data = {
										"id": id,
										"write_date": data.write_date,
										"write_time": data.write_time,
										"brutto": weigth,
										"doc_start_weight": weigth - cargo_weight,
										"truck1_weight": cart1weigth,
										"truck2_weight": '0',
										"side_diff": side_diff,
										"offset_lengthwise": offset_lengthwise,
										"cross_offset": cross_offset,
										"type": Type,
										"lastdateedited": lastdateedited,
										"lasttimeedited": lasttimeedited,
										"lasttimeeditor": lasttimeeditor
									};
								}
								else {
									_data = {
										"id": id,
										"write_date": data.write_date,
										"write_time": data.write_time,
										"brutto": weigth,
										"truck1_weight": cart1weigth,
										"truck2_weight": '0',
										"side_diff": side_diff,
										"offset_lengthwise": offset_lengthwise,
										"cross_offset": cross_offset,
										"type": Type,
										"lastdateedited": lastdateedited,
										"lasttimeedited": lasttimeedited,
										"lasttimeeditor": lasttimeeditor
									};
								}
								reWeightBrutto(_data);
							}
						}
						//TARA CONTROL
						else {
							//math:"[$r,brutto] - [$r,cargo_weight]",
							var _data = {};
							if (doc_cargo_weight !== 0) {
								var _data = {
									"id": id,
									"write_date": data.write_date,
									"write_time": data.write_time,
									"brutto": weigth,
									"start_weight": weigth - doc_cargo_weight,
									"truck1_weight": cart1weigth,
									"truck2_weight": '0',
									"side_diff": side_diff,
									"offset_lengthwise": offset_lengthwise,
									"cross_offset": cross_offset,
									"type": Type,
									"lastdateedited": lastdateedited,
									"lasttimeedited": lasttimeedited,
									"lasttimeeditor": lasttimeeditor
								};
							}
							else {
								var _data = {
									"id": id,
									"write_date": data.write_date,
									"write_time": data.write_time,
									"brutto": weigth,
									"truck1_weight": cart1weigth,
									"truck2_weight": '0',
									"side_diff": side_diff,
									"offset_lengthwise": offset_lengthwise,
									"cross_offset": cross_offset,
									"type": Type,
									"lastdateedited": lastdateedited,
									"lasttimeedited": lasttimeedited,
									"lasttimeeditor": lasttimeeditor
								};
							}
							reWeightBrutto(_data);
						}
					}
					else {
						var today = new Date();
						var dd = today.getDate();
						var mm = today.getMonth() + 1; //January is 0!
						var yyyy = today.getFullYear();
						if (dd < 10) dd = "0" + dd;
						if (mm < 10) mm = "0" + mm;
						var current_date = yyyy + "-" + mm + "-" + dd;
						var hr = today.getHours();
						if (hr < 10) hr = "0" + hr;
						var min = today.getMinutes();
						if (min < 10) min = "0" + min;
						var sec = today.getSeconds();
						if (sec < 10) sec = "0" + sec;
						var current_time = hr + ":" + min + ":" + sec;
						lastdateedited = current_date;
						lasttimeedited = current_time;
						lasttimeeditor = User;
						var id = $$('staticTruckLastID2').getValue();
						var cart1weigth = parseInt($$(datatable_name).getItem(id).truck1_weight);
						var doc_cargo_weight = data.doc_cargo_weight;
						if (doc_cargo_weight === null || doc_cargo_weight === "" || doc_cargo_weight === undefined || isNaN(doc_cargo_weight)) doc_cargo_weight = 0;
						var cargo_weight = data.cargo_weight;
						if (cargo_weight === null || cargo_weight === "" || cargo_weight === undefined || isNaN(cargo_weight)) cargo_weight = 0;
						var brutto = data.brutto;
						if (brutto === null || brutto === "" || brutto === undefined || isNaN(brutto)) brutto = 0;
                        var truck_diff = (parseInt(_weigth)) - cart1weigth;
                        if (truck_diff < 0) truck_diff = -truck_diff;
						var side_diff = parseInt($$('_side_diff').getValue());
						if (side_diff < 0) side_diff = -side_diff;
						var offset_lengthwise = ((parseInt(_weigth) / (parseInt(_weigth) + cart1weigth) * brb) - brb / 2).toFixed(0);
						var cross_offset = parseInt($$('_cross_offset').getValue());
						cross_offset = ((cross_offset + data.cross_offset) / 2).toFixed(0);
						next_wagon2 = true;
						//TARA CONTROL
						if ($$("taraControl").getValue() === 1) {
							//TARA
							if ($$('brutto/netto').getValue() === 1) {
								let wei1 = parseInt(_weigth);
								let wei2 = cargo_weight;
								let weigth = wei1 + wei2;
								let _data = {};
								if (brutto !== 0) {
									_data = {
										"id": id,
										"write_date": data.write_date,
										"write_time": data.write_time,
										"doc_start_weight": brutto - weigth,
										"cargo_weight": weigth,
										"truck1_weight": cart1weigth,
										"truck2_weight": wei1,
                                        "truck_diff": truck_diff,
                                        "side_diff": side_diff,
										"offset_lengthwise": offset_lengthwise,
										"cross_offset": cross_offset,
										"type": Type,
										"lastdateedited": lastdateedited,
										"lasttimeedited": lasttimeedited,
										"lasttimeeditor": lasttimeeditor
									};
								}
								else {
									_data = {
										"id": id,
										"write_date": data.write_date,
										"write_time": data.write_time,
										"cargo_weight": weigth,
										"truck1_weight": cart1weigth,
										"truck2_weight": wei1,
                                        "truck_diff": truck_diff,
										"side_diff": side_diff,
										"offset_lengthwise": offset_lengthwise,
										"cross_offset": cross_offset,
										"type": Type,
										"lastdateedited": lastdateedited,
										"lasttimeedited": lasttimeedited,
										"lasttimeeditor": lasttimeeditor
									};
								}
								reWeightNetto(_data);
							}
							else {
								//BRUTTO
								let wei1 = parseInt(_weigth);
								let wei2 = brutto;
								let weigth = wei1 + wei2;
								let _data = {};
								if (cargo_weight !== 0) {
									_data = {
										"id": id,
										"write_date": data.write_date,
										"write_time": data.write_time,
										"doc_start_weight": weigth - cargo_weight,
										"brutto": weigth,
										"truck2_weight": wei1,
										"truck1_weight": cart1weigth,
                                        "truck_diff": truck_diff,
										"side_diff": side_diff,
										"offset_lengthwise": offset_lengthwise,
										"cross_offset": cross_offset,
										"type": Type,
										"lastdateedited": lastdateedited,
										"lasttimeedited": lasttimeedited,
										"lasttimeeditor": lasttimeeditor
									};
								}
								else {
									_data = {
										"id": id,
										"write_date": data.write_date,
										"write_time": data.write_time,
										"brutto": weigth,
										"truck2_weight": wei1,
										"truck1_weight": cart1weigth,
                                        "truck_diff": truck_diff,
										"side_diff": side_diff,
										"offset_lengthwise": offset_lengthwise,
										"cross_offset": cross_offset,
										"type": Type,
										"lastdateedited": lastdateedited,
										"lasttimeedited": lasttimeedited,
										"lasttimeeditor": lasttimeeditor
									};
								}
								reWeightBrutto(_data);
							}
						}
						else {
							var wei1 = parseInt(_weigth);
							var wei2 = brutto;
							var weigth = wei1 + wei2;
							var _data = {};
							if (doc_cargo_weight !== 0) {
								_data = {
									"id": id,
									"write_date": data.write_date,
									"write_time": data.write_time,
									"brutto": weigth,
									"start_weight": weigth - data.doc_cargo_weight,
									"truck2_weight": wei1,
									"truck1_weight": cart1weigth,
									"side_diff": side_diff,
									"offset_lengthwise": offset_lengthwise,
									"cross_offset": cross_offset,
									"type": Type,
									"lastdateedited": lastdateedited,
									"lasttimeedited": lasttimeedited,
									"lasttimeeditor": lasttimeeditor
								};
							}
							else {
								var _data = {
									"id": id,
									"write_date": data.write_date,
									"write_time": data.write_time,
									"brutto": weigth,
									"truck2_weight": wei1,
									"truck1_weight": cart1weigth,
                                    "truck_diff": truck_diff,
									"side_diff": side_diff,
									"offset_lengthwise": offset_lengthwise,
									"cross_offset": cross_offset,
									"type": Type,
									"lastdateedited": lastdateedited,
									"lasttimeedited": lasttimeedited,
									"lasttimeeditor": lasttimeeditor
								};
							}
							reWeightBrutto(_data);
						}
					}
				}
				else {
					webix.message({
						type: "error",
						text: _("Choose row for re-weighing first")
					});
				}
			}
			else {
				webix.message({
					type: "error",
					text: _("Weight must be more than zero")
				});
			}
		}

		function reWeightBrutto (obj) {
			if (obj.start_weight === null) obj.start_weight = 0;
			if (obj.doc_start_weight === null) obj.doc_start_weight = 0;
			$$(datatable_name).updateItem(obj.id, obj);
			addOperationData(obj);
			webix.message({type: "default", text: _("Re-Weight complete")});
			if (!next_wagon2){
				//DISABLING TARA CONTROL AND TARA/NETTO SWITCHERS
				$$("taraControl").disable();
				$$("brutto/netto").disable();
			}
			else {
				//ENABLING TARA CONTROL AND TARA/NETTO SWITCHERS
				$$("taraControl").enable();
				$$("brutto/netto").enable();
			}
		}

		function reWeightNetto (obj) {
			if (obj.start_weight === null) obj.start_weight = 0;
			if (obj.doc_start_weight === null) obj.doc_start_weight = 0;
			$$(datatable_name).updateItem(obj.id, obj);
			addOperationData(obj);
			webix.message({type: "default", text: _("Re-Weight complete")});
			if (!next_wagon2){
				//DISABLING TARA CONTROL AND TARA/NETTO SWITCHERS
				$$("taraControl").disable();
				$$("brutto/netto").disable();
			}
			else {
				//ENABLING TARA CONTROL AND TARA/NETTO SWITCHERS
				$$("taraControl").enable();
				$$("brutto/netto").enable();
			}
		}

		function img (obj) {
			return "<img src=\"" + obj.src + "\" class=\"content\" ondragstart=\"return false\"" + "style=\"width:410px;height:200px;\"" + "/>";
		}

		function img2 (obj) {
			return "<img src=\"" + obj.src + "\" class=\"content\" ondragstart=\"return false\"" + "style=\"width:130px;height:200px;\"" + "/>";
		}

		function setWidth () {
			if (lang == "ru") {
				return 80;
			}
			else return 125;
		}

		const data = [
			{"collumn": _("date"), "column": "write_date", "hide": hideOptions[Type].date},
			{"collumn": _("time"), "column": "write_time", "hide": hideOptions[Type].time},
			{"collumn": _("train_number"), "column": "train_number", "hide": hideOptions[Type].train_number},
			{"collumn": _("wagon_number"), "column": "wagon_number", "hide": hideOptions[Type].wagon_number},
			{"collumn": _("start_weight"), "column": "start_weight", "hide": hideOptions[Type].start_weight},
			{
				"collumn": _("doc_start_weight"),
				"column": "doc_start_weight",
				"hide": hideOptions[Type].doc_start_weight
			},
			{"collumn": _("brutto"), "column": "brutto", "hide": hideOptions[Type].brutto},
			{"collumn": _("cargo_weight"), "column": "cargo_weight", "hide": hideOptions[Type].cargo_weight},
			{"collumn": _("overload"), "column": "overload", "hide": hideOptions[Type].overload},
			{
				"collumn": _("doc_cargo_weight"),
				"column": "doc_cargo_weight",
				"hide": hideOptions[Type].doc_cargo_weight
			},
			{"collumn": _("doc_number"), "column": "doc_number", "hide": hideOptions[Type].doc_number},
			{"collumn": _("doc_date"), "column": "doc_date", "hide": hideOptions[Type].doc_date},
			{"collumn": _("cargo_name"), "column": "cargo_name", "hide": hideOptions[Type].cargo_name},
			{"collumn": _("capacity_for_oper_table"), "column": "capacity", "hide": hideOptions[Type].capacity},
			{"collumn": _("truck1_weight"), "column": "truck1_weight", "hide": hideOptions[Type].truck1_weight},
			{"collumn": _("truck2_weight"), "column": "truck2_weight", "hide": hideOptions[Type].truck2_weight},
            {"collumn": _("truck_diff"), "column": "truck_diff", "hide": hideOptions[Type].truck_diff},
			{"collumn": _("side_diff"), "column": "side_diff", "hide": hideOptions[Type].side_diff},
			{
				"collumn": _("offset_lengthwise"),
				"column": "offset_lengthwise",
				"hide": hideOptions[Type].offset_lengthwise
			},
			{"collumn": _("cross_offset"), "column": "cross_offset", "hide": hideOptions[Type].cross_offset},
			{"collumn": _("sender"), "column": "sender", "hide": hideOptions[Type].sender},
			{"collumn": _("reciever"), "column": "reciever", "hide": hideOptions[Type].reciever},
			{"collumn": _("transporter"), "column": "transporter", "hide": hideOptions[Type].transporter},
			{"collumn": _("departure_point"), "column": "departure_point", "hide": hideOptions[Type].departure_point},
			{
				"collumn": _("destination_point"),
				"column": "destination_point",
				"hide": hideOptions[Type].destination_point
			},
			{"collumn": _("cargo"), "column": "cargo", "hide": hideOptions[Type].cargo},
			{"collumn": _("axels_count"), "column": "axels_count", "hide": hideOptions[Type].axels_count},
			{"collumn": _("photo_path"), "column": "photo_path", "hide": hideOptions[Type].photo_path},
			{"collumn": _("wagon_type"), "column": "wagon_type", "hide": hideOptions[Type].wagon_type},
			{"collumn": _("autofilling"), "column": "autofilling", "hide": hideOptions[Type].autofilling},
			{"collumn": _("lastdateedited"), "column": "lastdateedited", "hide": hideOptions[Type].lastdateedited},
			{"collumn": _("lasttimeedited"), "column": "lasttimeedited", "hide": hideOptions[Type].lasttimeedited},
			{"collumn": _("lasttimeeditor"), "column": "lasttimeeditor", "hide": hideOptions[Type].lasttimeeditor},
			{"collumn": _("optional1"), "column": "optional1", "hide": hideOptions[Type].optional1},
			{"collumn": _("optional2"), "column": "optional2", "hide": hideOptions[Type].optional2},
			{"collumn": _("optional3"), "column": "optional3", "hide": hideOptions[Type].optional3},
			{"collumn": _("optional4"), "column": "optional4", "hide": hideOptions[Type].optional4},
			{"collumn": _("optional5"), "column": "optional5", "hide": hideOptions[Type].optional5}];

		const hidOptions = {
			view: "datatable",
			editable: true,
			scroll: "y",
			css: theme,
			id: dt1,
			drag: true,
			data: data,
			columns: [
				{id: "collumn", header: _("Column"), css: "rank", width: 250},
				{id: "column", hidden: true},
				{
					id: "hide", header: _("Hide"), width: 75, template: data => {
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
					var item = ($$(dt1).getItem(id.row));
					hideOptions[Type][item.column] = item.hide;
					newv => this.app.config.hideOptions = hideOptions;
					if (item.hide === false) {
						item.hide = true;
						$$("static_operations_truck").hideColumn(item.column);
						$$(dt1).updateItem(id, item);
					}
					else {
						item.hide = false;
						$$("static_operations_truck").showColumn(item.column);
						$$(dt1).updateItem(id, item);
					}
				}
			}
		};

		const popUp = {
			view: "window",
			css: theme,
			id: win1,
			height: 600,
			width: 350,
			move: true,
			head: {
				view: "toolbar", margin: -4, cols: [
					{view: "label", label: _("Table configurator"), width: 280},
					{
						view: "label",
						template: function (obj) {
							var html = "<div class='del_element'>";
							return html + "</div>";
						},
						click: function () {
							$$(win1).hide();
						}
					},
				]
			},
			body: {
				rows: [
					hidOptions,
					{
						view: "toolbar", margin: -4, cols: [
							{
								view: "button", id: close, value: _("Save"), click: function () {
									var report_columns = {};
									var i = 1;
									$$(dt1).eachRow(function (row) {
										const record = $$(dt1).getItem(row);
										// { id:row, title:"Film", year:2019 }
										if (record.hide !== true) {
											report_columns[record.column] = i;
											i = i + 1;
										}
										else {
											report_columns[record.column] = 0;
											i = i + 1;
										}
									});
									report_columns['user'] = User;
									setHidOptions(report_columns);
									$$(win1).hide();
								}
							}
						]

					}]
			}
		};

		var wagonNumberWindow = webix.ui({
			view: "window",
			css: theme,
			id: win2,
			height: 300,
			width: 300,
			move: true,
			head: {
				view: "toolbar", margin: -4, cols: [
					{view: "label", label: _("Enter the number of wagon"), width: 260},
					{
						view: "label",
						template: function (obj) {
							var html = "<div class='del_element'>";
							return html + "</div>";
						},
						click: function () {
							$$(win2).hide();
						}
					},
				]
			},
			body: {
				rows: [
					{
						cols: [
							{},
							{view: "label", label: _("Wagon number"), width: 130},
							{
								view: "text", width: 150, id: numberOfWagon,
								on: {
									"onEnter": function (state, editor, ignoreUpdate) {
										var flag = false;
										var wagonNumber = parseInt($$(numberOfWagon).getValue());
										if (wagonNumber.length !== 0 && !isNaN(wagonNumber)) {
											$$("static_operations_truck").eachRow(function (row) {
												const record = $$("static_operations_truck").getItem(row);
												if (parseInt(wagonNumber) === parseInt(record.wagon_number)) {
													if (!flag) {
														updateWeight(record.id, wagonNumber);
														if (next_wagon === false) $$(win2).hide();
														flag = true;
														$$(numberOfWagon).setValue("");
														referenceView.app.callEvent("currentView=static_truck");
													}
												}
											});
											if (!flag) {
												setWeight(wagonNumber);
												$$(numberOfWagon).setValue("");
												if (next_wagon === false) $$(win2).hide();
												referenceView.app.callEvent("currentView=static_truck");
											}
										}
										else {
											webix.message({type: "error", text: _("Enter the wagon number")});
										}
									}
								}
							},
							{}
						]
					},
					{
						view: "toolbar", margin: -4, cols: [
							{},
							{
								view: "button", width: 150, value: _("Approve"),
								click: function () {
									var flag = false;
									var wagonNumber = parseInt($$(numberOfWagon).getValue());
									if (wagonNumber.length !== 0 && !isNaN(wagonNumber)) {
										$$("static_operations_truck").eachRow(function (row) {
											const record = $$("static_operations_truck").getItem(row);
											if (parseInt(wagonNumber) === parseInt(record.wagon_number)) {
												if (!flag) {
													flag = true;
													updateWeight(record.id, wagonNumber);
													if (next_wagon === false) $$(win2).hide();
													$$(numberOfWagon).setValue("");
													referenceView.app.callEvent("currentView=static_truck");
												}
											}
										});
										if (!flag) {
											setWeight(wagonNumber);
											$$(numberOfWagon).setValue("");
											if (next_wagon === false) $$(win2).hide();
											referenceView.app.callEvent("currentView=static_truck");
										}
									}
									else {
										webix.message({type: "error", text: _("Enter the wagon number")});
									}
								}
							},
							{}
						]
					}]
			}
		})

		return {
			id: "static-truck-view", template: " ", hidden: hidden, rows: [
				{
					height: 10
				},
				{
					type: "wide",
					rows: [
						{
							height: 245,
							gravity: 2,
							type: "wide",
							cols: [
								{template: "", minWidth: 10},
								{
									rows: [{template: img, width: 440, data: {src: "data/images/wagon1.jpg"}},
										{
											cols: [
												{
													cols: [
														{label: _("cart1weigth"), view: "label", width: 55},
														{view: "text", width: 80, height: 30, id: "_cart1weigth", readonly: true},
														{gravity: 1},
														{gravity: 1}
													]
												},
												{width: 63},
												{
													cols: [
														{width: 55},
														{minWidth: 100},
														{gravity: 1},
														{gravity: 1}
													]
												}]
										}]
								},
								{
									rows: [
										{
											cols: [
												{width: 5},
												{
													template: img2,
													width: 154,
													data: {src: "data/images/wagon3.jpg"}
												},
												{width: 5}
											]
										},
										{
											cols: [
												{},
												{
													cols: [
														{
															label: _("offset1side"),
															view: "label",
															width: 15
														},
														{
															view: "text",
															width: 70,
															height: 30,
															id: "_offset1side",
															readonly: true
														},
													]
												},
												{
													cols: [
														{
															view: "text",
															width: 70,
															height: 30,
															id: "_offset2side",
															readonly: true
														},
														{
															label: _("offset2side"),
															view: "label",
															width: 17
														},
													]
												},
												{}]
										}]
								},
								{
									rows: [
										{
											id: "graphic", view: "d3-chart", resize: true, url: "data/flare.json",
											ready: function () {
												var margin = {top: 10, right: 20, bottom: 10, left: 20},
													width = this.$width - margin.left - margin.right,
													height = this.$height - margin.top - margin.bottom;

												var formatNumber = d3.format(".4f");
												var color = d3.scale.category20c();

												var x = d3.scale.linear()
													.domain([-1, 1])
													.range([0, width]);

												var y = d3.scale.linear()
													.domain([-1, 1])
													.range([height, 0]);

												var ease;

												var svg = d3.select(this.$view).append("svg")
													.attr("width", this.$width)
													.attr("height", this.$height)
													.append("g")
													.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

												svg.append("g")
													.attr("class", "axis axis--x")
													.attr("transform", "translate(0," + height / 2 + ")")
													.call(d3.svg.axis()
														.scale(x)
														.orient("middle"))
													.append("text")
													.attr("x", width)
													.attr("y", -3)
													.attr("dy", "-.35em")
													.style("font-weight", "bold")
													.style("text-anchor", "middle");

												svg.append("g")
													.attr("class", "axis axis--y")
													.attr("transform", "translate(" + width / 2 + "," + 0 + ")")
													.call(d3.svg.axis()
														.scale(y)
														.orient("left"))
													.append("text")
													.attr("x", 6)
													.attr("dy", ".35em")
													.style("font-weight", "bold");

												var lineEase = svg.append("path")
													.attr("class", "line")
													.style("stroke", "#000")
													.style("stroke-width", "1.5px");

												var circle = svg.append("circle")
													.attr("r", 7)
													.attr("cx", 0)
													.attr("cy", height)
													.style("fill", "#000000");

												referenceView.app.attachEvent("changePointColorBlack", function () {
													circle.style("fill", "#000000");
												});
												referenceView.app.attachEvent("changePointColorRed", function () {
													circle.style("fill", "#b3000c");
												});

												var timer;

												referenceView.app.attachEvent("chartStaticUpdateStop", function () {
													staticWagonTimer = false;
													clearInterval(timer);
												});

												referenceView.app.attachEvent("chartStaticUpdateStart", function () {
													var timeout = 1000 / config.counts;
													staticWagonTimer = true;
													timer = setInterval(function () {
														if (staticWagonTimer) {
															var _x = $$("x").getValue();
															var _y = $$("y").getValue();
															if (isNaN(_x) || _x === undefined || _x === "") _x = 0;
															if (isNaN(_y) || _y === undefined || _y === "") _y = 0;
															circle.attr("cx", x(_x)).attr("cy", y(_y));
														}
													}, timeout);
												});

												referenceView.app.callEvent("chartStaticUpdateStop");
												referenceView.app.callEvent("chartStaticUpdateStart");
											}
										},
										{
											cols: [
												{
													cols: [
														{
															label: _("offset_lengthwise"),
															view: "label",
															width: 140
														},
														{
															view: "text",
															minWidth: 80,
															height: 30,
															id: "_offset_lengthwise",
															readonly: true
														},
													]
												},
												{
													cols: [
														{
															label: _("cross_offset"),
															view: "label",
															minWidth: 140,
														},
														{
															view: "text",
															minWidth: 80,
															height: 30,
															id: "_cross_offset",
															readonly: true
														},
														{
															view: "text",
															minWidth: 80,
															height: 30,
															id: "_side_diff",
															hidden: true,
															value: 0
														}
													]
												}]
										},
									]
								},
								{template: "", minWidth: 10}
							]
						},
						{
							view: "toolbar", css: theme,
							elements: [
								{
									hidden: true,
									view: "button",
									type: "iconButton",
									icon: "wxi wxi-undo",
									width: 105,
									label: _("Undo"),
									click: function () {
										$$("static_operations_truck").undo();
									}
								},
								{
									view: "button",
									value: _("Set zero weights"),
									autowidth: true,
									type: "form",
									click: function () {
										if (config.configuration.weighing_allowed) {
											var _weigth = parseInt($$('weight').getValue());
											setZero1(_weigth);
										}
										else {
											webix.message({type: "error", text: _("Weighing is not allowed")});
										}
									}
								},
								{},
								{
									view: "switch",
									id: "taraControl",
									hidden: !access.tara_control,
									width: 180,
									value: 0,
									label: _("Tara control"),
									labelAlign: "left",
									labelPosition: "left",
									labelWidth: 110,
									on: {
										onChange: function (newState) {
											if ($$("brutto/netto").isVisible()) $$('brutto/netto').hide();
											else $$('brutto/netto').show();
										}
									}
								},
								{},
								{
									template: " ", autowidth: true, cols: [
										{
											label: _("Weight"),
											view: "label",
											width: setWidth(),
											css: {"font-size": "26pt !important"}
										},
										{
											view: "text",
											width: 80,
											height: 30,
											id: "weight",
											css: {"font-size": "22pt !important"},
                                            readonly:true
										},
									]
								},
								{
									id: "_bt_",
									view: "button",
									value: _("Set weigth platform"),
									width: 200,
									css: "bt_1",
									click: function (){
										if (config.configuration.weighing_allowed) {
											console.log(next_wagon);
											if (next_wagon) {
												var item = $$(datatable_name).getSelectedItem();
												if (item === undefined) {
													var width = $$("_bt_").getTopParentView()["$width"] / 2 + 60;
													var heigth = $$("_bt_").getTopParentView()["$height"] / 2 - 100;
													wagonNumberWindow.setPosition(width, heigth);
													wagonNumberWindow.show();
													$$(numberOfWagon).$view.querySelector("input").focus();
												}
												else {
													if ($$("taraControl").getValue() === 1) {
														setWeight(item.wagon_number)
														referenceView.app.callEvent("currentView=static_truck");
													}
													else {
														if (item.brutto === "" || item.brutto === undefined || item.brutto === null) {
															updateWeight(item.id, item.wagon_number);
															referenceView.app.callEvent("currentView=static_truck");
														}
														else {
															webix.message({
																type: "error",
																text: _("BRUTTO is already set")
															});
															$$(datatable_name).unselectAll();
														}
													}
												}
											}
											else {
												referenceView.app.callEvent("currentView=static");
												var id = $$('staticTruckLastID').getValue();
												var item = $$(datatable_name).getItem(id);
												updateWeight(item.id, item.wagon_number);
											}
										}
										else {
											webix.message({type: "error", text: _("Weighing is not allowed")});
										}
									}
								},
								{},
								{
									view: "switch",
									id: 'brutto/netto',
									minWidth: 180,
									value: _("NETTO"),
									label: _("BRUTTO/NETTO"),
									labelAlign: "left",
									labelPosition: "left",
									labelWidth: 110,
									hidden: true
								},
								{},
								{
									view: "button",
									value: _("Re-weigh"),
									id: "reweighbtn",
									hidden: !access.cancel_weighting,
									autowidth: true,
									type: "form",
									click: function () {
										if (config.configuration.weighing_allowed) {
											reweigh();
										}
										else {
											webix.message({type: "error", text: _("Weighing is not allowed")});
										}
									}
								},
								{
									view: "icon", icon: "wxi wxi-settings",
									tooltip: _("Go to table view settings"),
									hidden: !access.table_configuration,
									popup: popUp,
									click: function () {
										getHidOptionsForConfigurator();
									}
								},
								{width: 6}
							]
						},
					]
				},
				StaticTActionsTruck
			]
		};
	}

	init (view, url) {
		const weighing = this.app.config.weighing;
		const _ = this.app.getService("locale")._;
		const ip = this.app.config.remoteHOST;
		const User = this.app.config.user;
		const Type = "static.truck";

		function getHidOptions () {
			var _methodName = "getHidOptions";
			webix.ajax().post(
				ip, {"method": _methodName, "user": User, "params": {"type": Type}},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							var resultCollumn = [];
							var aData = ["write_date", "write_time", "wagon_number", "start_weight", "doc_start_weight", "brutto", "cargo_weight", "overload", "doc_cargo_weight", "doc_number", "doc_date", "cargo_name", "capacity", "truck1_weight", "side_diff", "offset_lengthwise", "cross_offset", "sender", "reciever", "transporter", "departure_point", "destination_point", "cargo", "axels_count", "photo_path", "train_number", "wagon_type", "optional1", "optional2", "optional3", "optional4", "optional5", "autofilling", "lastdateedited", "lasttimeedited", "lasttimeeditor"];
							delete data.params.collumns.id;
							for (var key in data.params.collumns) {
								resultCollumn.push({
									"collumn": _(data.params.collumns[key]),
									"column": data.params.collumns[key],
									"hide": false
								});
								delete aData[aData.indexOf(data.params.collumns[key])];
							}
							aData.forEach(function (item, i, arr) {
								resultCollumn.push({
									"collumn": _(item),
									"column": item,
									"hide": true
								});
							});

							resultCollumn.forEach(function (item, i, arr) {
								if (item.hide !== true) {
									$$("static_operations_truck").moveColumn(item.column, i + 2);
								}
								else {
									$$("static_operations_truck").hideColumn(item.column);
								}
							});
						}
					}
				});
		}

		this.app.callEvent("setExchange=nothing");
		if (weighing.current !== 3) {
			this.app.callEvent("setConnection=static.truck");
			this.app.callEvent("connection");
		}
		this.app.callEvent("chart3StaticCalibrationUpdateStop");
		this.app.callEvent("chart2StaticCalibrationUpdateStop");
		this.app.callEvent("chart1StaticCalibrationUpdateStop");
		getHidOptions();
	}

	destroy () {
		this.app.callEvent("chartStaticUpdateStop");
	}
}
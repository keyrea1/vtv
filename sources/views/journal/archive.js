import {JetView} from "webix-jet";
import AllTActions from "views/datatables/alltactions";
import WorkTable from "views/datatables/worktable";

export default class ArchiveView extends JetView {
	config () {
		const theme = this.app.config.theme;
		const _ = this.app.getService("locale")._;
		const ids = this.app.config.ids;
		const hideOptions = this.app.config.hideOptions;
		const ip = this.app.config.remoteHOST;
		const User = this.app.config.user;
		const Credentials = this.app.config.credentials;
		const ORGANIZATION = this.app.config.globals.organizationName;
		const WEIGHT = this.app.config.globals.hardware.typeOfScales;
		const SERIAL = this.app.config.globals.hardware.serialNumber;
		const access = this.app.config.globals.access;
		const Type = "archive";
		const datatable_name = "operations";

		var report_for_print = {};
		var pingTimer;
		var self = this;

		function sendPing () {
			var _methodName = "ping";
			webix.ajax().post(ip + "/ping/", {"method": _methodName});
		}

		function saveArchive (name) {
			var _methodName = "saveArchive";
			webix.ajax().post(ip, {"method": _methodName, "user": User, "params": {"name": name}},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							webix.message({type: "info", text: _("Saved to ") + _(data.params.message)});
						} else {
							webix.message({
								type: "error",
								text: _(data.params.message)
							});
						}
					} else {
						webix.message({
							type: "error",
							text: _(data.params.message)
						});
					}
				});
		}

		function getReport (obj) {
			var _methodName = "getReport";
			var width = 0;
			webix.ajax().post(
				ip,
				{"method": _methodName, "user": User, "params": {"id": obj}},
				function (text, xml, xhr) {
					var _data = JSON.parse(text);
					console.log(_data);
					if (_data.method === _methodName) {
						if (_data.answer === "ok") {
							report_for_print.name = _data.params.settings.name;
							report_for_print.statical = _data.params.settings.statical;
							if (report_for_print.statical) $$(table_for_report).define("footer", true);
							else $$(table_for_report).define("footer", true);
							report_for_print.printOrientation = _data.params.settings.orientation;
							self.printOrientation = report_for_print.printOrientation;
							report_for_print.one_wagon = _data.params.settings.one_wagon;
                            setTimeout(function () {
                                webix.extend($$(preview_for_report), webix.ProgressBar);

                                function show_progress_icon(delay) {
                                    $$(preview_for_report).disable();
                                    $$(preview_for_report).showProgress({
                                        type: "icon",
                                        delay: delay,
                                        hide: true
                                    });
                                    setTimeout(function () {
                                        $$(preview_for_report).enable();
                                    }, delay);
                                }

                                show_progress_icon(1000);
                            }, 100);
							if (report_for_print.one_wagon) {
                                $$(table_for_report).define("footer", false);
								preview_for_report.show();
								var resultCollumn = [];
								//strange logic, but works fine
								var aData = ["write_date", "write_time", "direction", "wagon_number", "start_weight",
									"doc_start_weight", "brutto", "cargo_weight", "overload", "doc_cargo_weight", "doc_number",
									"doc_date", "cargo_name", "capacity", "truck1_weight", "ft_axis_1", "ft_axis_2", "ft_axis_3",
									"ft_axis_4", "truck2_weight", "st_axis_1", "st_axis_2", "st_axis_3", "st_axis_4",
									"truck_diff", "side_diff", "offset_lengthwise", "cross_offset", "speed", "sender",
									"reciever", "transporter", "departure_point", "destination_point", "cargo", "user",
									"axels_count", "photo_path", "train_number", "wagon_type", "optional1", "optional2",
									"optional3", "optional4", "optional5", "weight_type", "autofilling", "lastdateedited",
									"lasttimeedited", "lasttimeeditor"];
								delete _data.params.columns.id;
								delete _data.params.columns.sender;
								delete _data.params.columns.reciever;
								delete _data.params.columns.transporter;
								delete _data.params.columns.departure_point;
								delete _data.params.columns.destination_point;
								for (var key in _data.params.columns) {
									resultCollumn.push({
										"collumn": _(_data.params.columns[key]),
										"column": _data.params.columns[key],
										"hide": false
									});
									//удаление элемента из массива
									delete aData[aData.indexOf(_data.params.columns[key])];
								}
								makeTalbeForPrintReportVisible();
								aData.forEach(function (item, i, arr) {
									$$(table_for_report).hideColumn(item);
								});
								$$(table_for_report).clearAll(true);
								resultCollumn.forEach(function (item, i, arr) {
									if (item.hide !== true) {
										$$(table_for_report).moveColumn(item.column, i + 1);
									}
								});
								var obj = $$(datatable_name).getSelectedItem();
								if (obj.sender === undefined || obj.sender === "") {
									var sender = 0;
									webix.message({
										type: "info",
										text: _("No sender for one-wagon report")
									});
								}
								if (obj.reciever === undefined || obj.reciever === "") {
									var reciever = 0;
									webix.message({
										type: "info",
										text: _("No reciever for one-wagon report")
									});
								}
								if (obj.transporter === undefined || obj.transporter === "") {
									var transporter = 0;
									webix.message({
										type: "info",
										text: _("No transporter for one-wagon report")
									});
								}
								if (obj.destination_point === undefined || obj.destination_point === "") {
									var destination_point = 0;
									webix.message({
										type: "info",
										text: _("No destination_point for one-wagon report")
									});
								}
								if (obj.departure_point === undefined || obj.departure_point === "") {
									var departure_point = 0;
									webix.message({
										type: "info",
										text: _("No departure_point for one-wagon report")
									});
								}
								if (obj === undefined || (sender === 0 && reciever === 0 && transporter === 0 && destination_point === 0 && departure_point === 0)) {
									webix.message({
										type: "error",
										text: _("Choose row for one-wagon report first")
									});
									$$(win1_preview_for_statical).hide();
									return false;
								} else {
									$$(one_wagon_block1).show();
									$$(one_wagon_block2).show();
									$$(_sender).setValue(obj.sender);
									$$(_reciever).setValue(obj.reciever);
									$$(_depPoint).setValue(obj.departure_point);
									$$(_destPoint).setValue(obj.destination_point);
									$$(_transporter).setValue(obj.transporter);
									var heigth = 100;
									$$(table_for_report).add(obj);
                                    $$(table_for_report).define("height", heigth);
									$$(table_for_report).resize();
									$$(header_for_print_report).setValue(report_for_print.name);
									$$(win1_reports).hide();
								}
							} else {
								var resultCollumn = [];
								//strange logic, but works fine
								var aData = ["write_date", "write_time", "direction", "wagon_number", "start_weight",
									"doc_start_weight", "brutto", "cargo_weight", "overload", "doc_cargo_weight", "doc_number",
									"doc_date", "cargo_name", "capacity", "truck1_weight", "ft_axis_1", "ft_axis_2", "ft_axis_3",
									"ft_axis_4", "truck2_weight", "st_axis_1", "st_axis_2", "st_axis_3", "st_axis_4", "truck_diff",
									"side_diff", "offset_lengthwise", "cross_offset", "speed", "sender", "reciever", "transporter",
									"departure_point", "destination_point", "cargo", "user", "axels_count", "photo_path",
									"train_number", "wagon_type", "optional1", "optional2", "optional3", "optional4", "optional5",
									"weight_type", "autofilling", "lastdateedited", "lasttimeedited", "lasttimeeditor"];
								delete _data.params.columns.id;
								for (var key in _data.params.columns) {
									resultCollumn.push({
										"collumn": _(_data.params.columns[key]),
										"column": _data.params.columns[key],
										"hide": false
									});
									//удаление элемента из массива
									delete aData[aData.indexOf(_data.params.columns[key])];
								}
								makeTalbeForPrintReportVisible();
								aData.forEach(function (item, i, arr) {
									$$(table_for_report).hideColumn(item);
								});
								$$(table_for_report).clearAll(true);
								resultCollumn.forEach(function (item, i, arr) {
									if (item.hide !== true) {
										$$(table_for_report).moveColumn(item.column, i + 1);
									}
								});
								var _heigth = 165;
								$$(datatable_name).eachRow(function (row) {
									$$(table_for_report).add($$(datatable_name).getItem(row));
									_heigth += 36;
								});
								$$(table_for_report).define("height", _heigth);
								$$(table_for_report).resize();
								preview_for_report.show();
								$$(header_for_print_report).setValue(report_for_print.name);
							}
						} else webix.message({
							type: "error",
							text: _(_data.params.message)
						});
					} else webix.message({
						type: "error",
						text: _(_data.params.message)
					});
				});
		}

		function reWeight (id, type) {
			var _methodName = "reWeigh";
			webix.ajax().post(
				ip,
				{
					"method": _methodName, "user": User, "params": {
						"type": type, "id": id, "user": User
					}
				},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							$$('operations').remove(id);
							webix.message({type: "default", text: _("Moved to operation table")});
						} else {
							webix.message({type: "error", text: _(data.params.message)});
						}
					}
				});
		}

		function getArchive (start, end) {
			var _methodName = "getArchive";
			webix.ajax().post(
				ip,
				{"method": _methodName, "user": User, "params": {"start": start, "end": end}},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
                            $$(datatable_name).clearAll();
                            data.params.forEach(function (item, i, arr) {
                                item.weight_type = _("arch" + item.type);
                            });
                            $$(datatable_name).parse(data.params);
                            webix.message({type: "info", text: _("Loaded from archive")});
                        }
						else if (data.answer === "error") {
							webix.message({type: "error", text: _(data.params.message)});
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
							var aData = ["write_date", "write_time", "direction", "wagon_number", "start_weight", "doc_start_weight",
								"brutto", "cargo_weight", "overload", "doc_cargo_weight", "doc_number", "doc_date", "cargo_name",
								"capacity", "truck1_weight", "ft_axis_1", "ft_axis_2", "ft_axis_3", "ft_axis_4", "truck2_weight",
								"st_axis_1", "st_axis_2", "st_axis_3", "st_axis_4", "truck_diff", "side_diff", "offset_lengthwise",
								"cross_offset", "speed", "sender", "reciever", "transporter", "departure_point", "destination_point",
								"cargo", "axels_count", "photo_path", "train_number", "wagon_type", "optional1", "optional2",
								"optional3", "optional4", "optional5", "weight_type", "autofilling", "user", "lastdateedited",
								"lasttimeedited", "lasttimeeditor"];
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
								} else if ($$(datatable_name).isColumnVisible(item.column)) {
									$$(datatable_name).hideColumn(item.column);
								}
							});
						}
					}
				});
		}

		function getHidOptionsForTableForPrint () {
			var _methodName = "getHidOptions";
			webix.ajax().post(
				ip, {"method": _methodName, "user": User, "params": {"type": Type}},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							var resultCollumn = [];
							var aData = ["write_date", "write_time", "direction", "wagon_number", "start_weight", "doc_start_weight",
								"brutto", "cargo_weight", "overload", "doc_cargo_weight", "doc_number", "doc_date", "cargo_name",
								"capacity", "truck1_weight", "ft_axis_1", "ft_axis_2", "ft_axis_3", "ft_axis_4", "truck2_weight",
								"st_axis_1", "st_axis_2", "st_axis_3", "st_axis_4", "truck_diff", "side_diff", "offset_lengthwise",
								"cross_offset", "speed", "sender", "reciever", "transporter", "departure_point", "destination_point",
								"cargo", "axels_count", "photo_path", "train_number", "wagon_type", "optional1", "optional2",
								"optional3", "optional4", "optional5", "weight_type", "autofilling", "user", "lastdateedited",
								"lasttimeedited", "lasttimeeditor"];
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
									$$(table_for_print).moveColumn(item.column, i + 2);
								} else if ($$(table_for_print).isColumnVisible(item.column)) {
									$$(table_for_print).hideColumn(item.column);
								}
							});
						}
					}
				});
		}

		function getHidOptionsForWorkTable () {
			var _methodName = "getHidOptions";
			webix.ajax().post(
				ip, {"method": _methodName, "user": User, "params": {"type": Type}},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							var resultCollumn = [];
							var aData = ["write_date", "write_time", "direction", "wagon_number", "start_weight", "doc_start_weight",
								"brutto", "cargo_weight", "overload", "doc_cargo_weight", "doc_number", "doc_date", "cargo_name",
								"capacity", "truck1_weight", "truck1_weight", "ft_axis_1", "ft_axis_2", "ft_axis_3", "ft_axis_4",
								"truck2_weight", "st_axis_1", "st_axis_2", "st_axis_3", "st_axis_4", "side_diff", "offset_lengthwise",
								"cross_offset", "speed", "sender", "reciever", "transporter", "departure_point", "destination_point",
								"cargo", "axels_count", "photo_path", "train_number", "wagon_type", "optional1", "optional2",
								"optional3", "optional4", "optional5", "weight_type", "autofilling", "user", "lastdateedited",
								"lasttimeedited", "lasttimeeditor"];
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
									$$("work-table").moveColumn(item.column, i + 2);
								} else if ($$("work-table").isColumnVisible(item.column)) {
									$$("work-table").hideColumn(item.column);
								}
							});
						}
					}
				});
		}

		function makeWorkTableVisible () {
			var _methodName = "getHidOptions";
			var resultCollumn = [];
			var aData = ["write_date", "write_time", "direction", "wagon_number", "start_weight", "doc_start_weight",
				"brutto", "cargo_weight", "overload", "doc_cargo_weight", "doc_number", "doc_date", "cargo_name", "capacity",
                "truck1_weight", "ft_axis_1", "ft_axis_2", "ft_axis_3", "ft_axis_4", "truck2_weight", "st_axis_1", "st_axis_2",
				"st_axis_3", "st_axis_4", "truck_diff", "side_diff", "offset_lengthwise", "cross_offset", "speed", "sender",
				"reciever", "transporter", "departure_point", "destination_point", "cargo", "axels_count", "photo_path",
				"train_number", "wagon_type", "optional1", "optional2", "optional3", "optional4", "optional5", "weight_type",
				"autofilling", "user", "lastdateedited", "lasttimeedited", "lasttimeeditor"];
			aData.forEach(function (item, i, arr) {
				resultCollumn.push({
					"collumn": _(item),
					"column": item,
					"hide": true
				});
			});
			resultCollumn.forEach(function (item, i, arr) {
				if (!$$("work-table").isColumnVisible(item.column)) {
					$$("work-table").showColumn(item.column);
				}
			});
		}

		function makeTalbeForPrintTableVisible () {
			var aData = ["write_date", "write_time", "direction", "wagon_number", "start_weight", "doc_start_weight",
				"brutto", "cargo_weight", "overload", "doc_cargo_weight", "doc_number", "doc_date", "cargo_name", "capacity",
                "truck1_weight", "ft_axis_1", "ft_axis_2", "ft_axis_3", "ft_axis_4", "truck2_weight", "st_axis_1", "st_axis_2",
				"st_axis_3", "st_axis_4", "truck_diff", "side_diff", "offset_lengthwise", "cross_offset", "speed", "sender",
				"reciever", "transporter", "departure_point", "destination_point", "cargo", "axels_count", "photo_path",
				"train_number", "wagon_type", "optional1", "optional2", "optional3", "optional4", "optional5", "weight_type",
				"autofilling", "user", "lastdateedited", "lasttimeedited", "lasttimeeditor"];
			aData.forEach(function (item, i, arr) {
				if (!$$(table_for_print).isColumnVisible(item)) {
					$$(table_for_print).showColumn(item);
				}
			});
		}

		function makeTalbeForPrintReportVisible () {
			var aData = ["write_date", "write_time", "direction", "wagon_number", "start_weight", "doc_start_weight",
				"brutto", "cargo_weight", "overload", "doc_cargo_weight", "doc_number", "doc_date", "cargo_name", "capacity",
                "truck1_weight", "ft_axis_1", "ft_axis_2", "ft_axis_3", "ft_axis_4", "truck2_weight", "st_axis_1", "st_axis_2",
				"st_axis_3", "st_axis_4", "truck_diff", "side_diff", "offset_lengthwise", "cross_offset", "speed", "sender",
				"reciever", "transporter", "departure_point", "destination_point", "cargo", "axels_count", "photo_path",
				"train_number", "wagon_type", "optional1", "optional2", "optional3", "optional4", "optional5", "weight_type",
				"autofilling", "user", "lastdateedited", "lasttimeedited", "lasttimeeditor"];
			aData.forEach(function (item, i, arr) {
				if (!$$(table_for_report).isColumnVisible(item)) {
					$$(table_for_report).showColumn(item);
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
							var aData = ["write_date", "write_time", "direction", "wagon_number", "start_weight", "doc_start_weight",
								"brutto", "cargo_weight", "overload", "doc_cargo_weight", "doc_number", "doc_date", "cargo_name",
								"capacity", "truck1_weight", "ft_axis_1", "ft_axis_2", "ft_axis_3", "ft_axis_4", "truck2_weight",
								"st_axis_1", "st_axis_2", "st_axis_3", "st_axis_4", "truck_diff", "side_diff", "offset_lengthwise",
								"cross_offset", "speed", "sender", "reciever", "transporter", "departure_point", "destination_point",
								"cargo", "axels_count", "photo_path", "train_number", "wagon_type", "optional1", "optional2",
								"optional3", "optional4", "optional5", "weight_type", "autofilling", "user", "lastdateedited",
								"lasttimeedited", "lasttimeeditor"];
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

		function tableParse (obj, height) {
			setTimeout(function () {
				$$(table_for_print).define("height", height);
				$$(table_for_print).resize();
				$$(table_for_print).clearAll();
				getHidOptionsForTableForPrint();
				makeTalbeForPrintTableVisible();
				$$(table_for_print).parse(obj);
			}, 1000);
		}

		//CSV
		webix.DataDriver.csv.cell = ", ";
		webix.DataDriver.csv.row = "|";
		webix.csv.delimiter.cols = ", ";
		webix.csv.delimiter.row = "| ";

		//IDS
		var dt1 = "dt1111" + ids.dt1;
		var win1 = "winasd1" + ids.win1;
		var win1_upload = "win03" + ids.win1;
		var win1_download = "win01" + ids.win1;
		var win1_save = "winSave01" + ids.win1;
		var uploadAPIarchive = "uploadAPIarchive" + ids.win1;
		var win1_reports = "win0asd2" + ids.win1;
		var win1_preview = "preview" + ids.win1;
		var win1_preview_for_statical = "win1_preview_for_statical" + ids.win1;
		var button_print = "button_print_archive" + ids.win1;
		var button_print2 = "button_print_archive2" + ids.win1;
		var printReport = "printReport" + ids.win1;
		var selectForm = "selectForm" + ids.win1;
		var form = "form" + ids.win1;
		var close = "close1111" + ids.close;
		var for_print_archive2 = "for_print_archive2" + ids.win1;
		var header_for_enter = "header_for_enter" + ids.win1;
		var header_for_print = "header_for_print" + ids.win1;
		var one_wagon_block1 = "one_wagon_block1" + ids.win1;
		var one_wagon_block2 = "one_wagon_block2" + ids.win1;
		var header_for_print_report = "header_for_print_report" + ids.win1;
		var for_print_archive = "for_print_archive" + ids.win1;
		var _sender = "_sender" + ids.win1;
		var _reciever = "_reciever" + ids.win1;
		var _depPoint = "_depPoint" + ids.win1;
		var _destPoint = "_destPoint" + ids.win1;
		var _transporter = "_transporter" + ids.win1;
		var popup = "popup" + ids.popup;
		var table_for_print = "work-table_for_print" + ids.dt1;
		var table_for_report = "work-table_for_print_2" + ids.dt1;
		var export_popup = Math.random() * 99999999 + "export_popup";
		ids.close = ids.close + 1;
		ids.win1 = ids.win1 + 1;
		ids.dt1 = ids.dt1 + 1;
		ids.popup = ids.popup + 1;
		newv => this.app.config.ids = ids;

		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth() + 1; //January is 0!
		if (dd < 10) dd = "0" + dd;
		if (mm < 10) mm = "0" + mm;
		var hr = today.getHours();
		if (hr < 10) hr = "0" + hr;
		var min = today.getMinutes();
		if (min < 10) min = "0" + min;
		var current_time = hr + ":" + min;
		var current_date = dd + "/" + mm + "/" + today.getFullYear() + ' ' + current_time;

		const data = [
			{"collumn": _("date"), "column": "write_date", "hide": hideOptions[Type].date},
			{"collumn": _("time"), "column": "write_time", "hide": hideOptions[Type].time},
			{"collumn": _("direction"), "column": "direction", "hide": hideOptions[Type].direction},
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
			{"collumn": _("overload"), "column": "overload", "hide": hideOptions[Type].cargo_weight},
			{
				"collumn": _("doc_cargo_weight"),
				"column": "doc_cargo_weight",
				"hide": hideOptions[Type].doc_cargo_weight
			},
			{"collumn": _("doc_number"), "column": "doc_number", "hide": hideOptions[Type].doc_number},
			{"collumn": _("doc_date"), "column": "doc_date", "hide": hideOptions[Type].doc_date},
			{"collumn": _("cargo_name"), "column": "cargo_name", "hide": hideOptions[Type].cargo_name},
			{"collumn": _("capacity"), "column": "capacity", "hide": hideOptions[Type].capacity},
            {"collumn": _("truck1_weight"), "column": "truck1_weight", "hide": hideOptions[Type].truck1_weight},
            {"collumn": _("ft_axis_1"), "column": "ft_axis_1", "hide": hideOptions[Type].ft_axis_1},
            {"collumn": _("ft_axis_2"), "column": "ft_axis_2", "hide": hideOptions[Type].ft_axis_2},
            {"collumn": _("ft_axis_3"), "column": "ft_axis_3", "hide": hideOptions[Type].ft_axis_3},
            {"collumn": _("ft_axis_4"), "column": "ft_axis_4", "hide": hideOptions[Type].ft_axis_4},
            {"collumn": _("truck2_weight"), "column": "truck2_weight", "hide": hideOptions[Type].truck2_weight},
            {"collumn": _("st_axis_1"), "column": "st_axis_1", "hide": hideOptions[Type].st_axis_1},
            {"collumn": _("st_axis_2"), "column": "st_axis_2", "hide": hideOptions[Type].st_axis_2},
            {"collumn": _("st_axis_3"), "column": "st_axis_3", "hide": hideOptions[Type].st_axis_3},
            {"collumn": _("st_axis_4"), "column": "st_axis_4", "hide": hideOptions[Type].st_axis_4},
			{"collumn": _("truck_diff"), "column": "truck_diff", "hide": hideOptions[Type].truck_diff},
			{"collumn": _("side_diff"), "column": "side_diff", "hide": hideOptions[Type].side_diff},
			{
				"collumn": _("offset_lengthwise"),
				"column": "offset_lengthwise",
				"hide": hideOptions[Type].offset_lengthwise
			},
			{"collumn": _("cross_offset"), "column": "cross_offset", "hide": hideOptions[Type].cross_offset},
			{"collumn": _("speed"), "column": "speed", "hide": hideOptions[Type].speed},
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
			{"collumn": _("optional1"), "column": "optional1", "hide": hideOptions[Type].optional1},
			{"collumn": _("optional2"), "column": "optional2", "hide": hideOptions[Type].optional2},
			{"collumn": _("optional3"), "column": "optional3", "hide": hideOptions[Type].optional3},
			{"collumn": _("optional4"), "column": "optional4", "hide": hideOptions[Type].optional4},
			{"collumn": _("optional5"), "column": "optional5", "hide": hideOptions[Type].optional5},
			{"collumn": _("weight_type"), "column": "weight_type", "hide": hideOptions[Type].weight_type},
			{"collumn": _("autofilling"), "column": "autofilling", "hide": hideOptions[Type].autofilling},
			{"collumn": _("user"), "column": "user", "hide": hideOptions[Type].user},
			{"collumn": _("lastdateedited"), "column": "lastdateedited", "hide": hideOptions[Type].lastdateedited},
			{"collumn": _("lasttimeedited"), "column": "lasttimeedited", "hide": hideOptions[Type].lasttimeedited},
			{"collumn": _("lasttimeeditor"), "column": "lasttimeeditor", "hide": hideOptions[Type].lasttimeeditor}];

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
						} else
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
						$$(datatable_name).hideColumn(item.column);
						$$(dt1).updateItem(id, item);
					} else {
						item.hide = false;
						$$(datatable_name).showColumn(item.column);
						$$(dt1).updateItem(id, item);
					}
				}
			}
		};

		const preview_for_report = webix.ui({
            view: "window",
            css: theme,
            id: win1_preview_for_statical,
            height: 720,
            width: 1280,
            move: true,
            head: {
                view: "toolbar", margin: -4, cols: [
                    {view: "label", label: _("Report"), width: 1240},
                    {
                        view: "label",
                        template: function (obj) {
                            var html = "<div class='del_element'>";
                            return html + "</div>";
                        },
                        click: function () {
                            $$(win1_preview_for_statical).hide();
                            $$(one_wagon_block1).hide();
                            $$(one_wagon_block2).hide();
                            $$(_sender).setValue("");
                            $$(_reciever).setValue("");
                            $$(_depPoint).setValue("");
                            $$(_destPoint).setValue("");
                            $$(_transporter).setValue("");
                        }
                    },
                ]
            },
            body: {
                view: "scrollview", id: for_print_archive, scroll: true, body: {
                    rows: [
                        {
                            view: "form", elements: [
                                {
                                    cols: [
                                        {height: 60},
                                        {
                                            rows: [
                                                {
                                                    cols: [
                                                        {},
                                                        {
                                                            id: header_for_print_report,
                                                            view: "label",
                                                            width: 350,
                                                            height: 30
                                                        },
                                                        {}
                                                    ]
                                                },
                                                {
                                                    cols: [
                                                        {},
                                                        {label: _("Type of weights"), view: "label", width: 120},
                                                        {label: WEIGHT, view: "label", width: 120},
                                                        {width: 10},
                                                        {label: _("Serial #"), view: "label", width: 130},
                                                        {label: SERIAL, view: "label", width: 130},
                                                        {width: 10},
                                                        {label: _("Operator"), view: "label", width: 90},
                                                        {label: Credentials, view: "label", width: 180},
                                                        {}
                                                    ]
                                                },
                                                {
                                                    cols: [
                                                        {},
                                                        {label: _("Date:"), view: "label", width: 235},
                                                        {label: current_date, view: "label", width: 150},
                                                        {label: _("Organization") + ":", view: "label", width: 110},
                                                        {label: ORGANIZATION, view: "label", width: 250},
                                                        {}
                                                    ]
                                                },
                                                {
                                                    id: one_wagon_block1, hidden: true, rows: [
                                                        {
                                                            cols: [
                                                                {width: 10},
                                                                {label: _("Sender"), view: "label", width: 160},
                                                                {label: "", view: "label", width: 120, id: _sender},
                                                                {}
                                                            ]
                                                        },
                                                        {
                                                            cols: [
                                                                {width: 10},
                                                                {label: _("Reciever"), view: "label", width: 160},
                                                                {label: "", view: "label", width: 120, id: _reciever},
                                                                {}
                                                            ]
                                                        },
                                                        {
                                                            cols: [
                                                                {width: 10},
                                                                {
                                                                    label: _("Departure point"),
                                                                    view: "label",
                                                                    width: 160
                                                                },
                                                                {label: "", view: "label", width: 160, id: _depPoint},
                                                                {}
                                                            ]
                                                        },
                                                        {
                                                            cols: [
                                                                {width: 10},
                                                                {
                                                                    label: _("Destination point"),
                                                                    view: "label",
                                                                    width: 160
                                                                },
                                                                {label: "", view: "label", width: 120, id: _destPoint},
                                                                {}
                                                            ]
                                                        },
                                                        {
                                                            cols: [
                                                                {width: 10},
                                                                {label: _("Trasnporter"), view: "label", width: 160},
                                                                {
                                                                    label: "",
                                                                    view: "label",
                                                                    width: 120,
                                                                    id: _transporter
                                                                },
                                                                {}
                                                            ]
                                                        }]
                                                },
                                                //VIEW FOR PRINTING FROM REPORT
                                                {
                                                    view: "datatable",
                                                    id: table_for_report,
                                                    css: "for_print",
                                                    editable: false,
													fixedRowHeight: false,
													rowLineHeight: 11,
                                                    resizeColumn: {headerOnly: true},
                                                    select: false,
                                                    scroll: true,
                                                    navigation: false,
                                                    hover: "myhover",
                                                    footer: true,
                                                    columns: [
                                                        {id: "id", header: "#", width: 34, sort: "int", footer: _("Summary")},
                                                        {
                                                            id: "write_date",
                                                            header: _("date"),
                                                            width: 59,
                                                            sort: "date",
                                                            format: webix.i18n.dateFormatStr
                                                        },
                                                        {id: "write_time", header: _("time"), width: 36},
                                                        {
                                                            id: "direction",
                                                            header: "",
                                                            css: "status",
                                                            sort: "text",
                                                            width: 26,
                                                            template: data => {
                                                                let icon = "";
                                                                if (data.direction === true) {
                                                                    icon = "arrow-right-small";
                                                                    return `<span class='webix_icon wxi wxi-${icon} ${data.status}'></span>`;
                                                                } else if (data.direction === false) {
                                                                    icon = "arrow-left-small";
                                                                    return `<span class='webix_icon wxi wxi-${icon} ${data.status}'></span>`;
                                                                } else return "";
                                                            }
                                                        },
                                                        {
                                                            id: "train_number",
                                                            header: _("train_number"),
                                                            sort: "int",
                                                            width: 80
                                                        },
                                                        {
                                                            id: "wagon_number",
                                                            header: _("wagon_number"),
                                                            sort: "int",
                                                            width: 65
                                                        },
                                                        {
                                                            id: "start_weight",
                                                            header: _("start_weight"),
                                                            width: 42,
															footer: { content:"summColumn" }
                                                        },
                                                        {
                                                            id: "doc_start_weight",
                                                            header: _("doc_start_weight"),
                                                            width: 42,
															footer: { content:"summColumn" }
                                                        },
                                                        {id: "brutto", header: _("brutto"), width: 45, footer: { content:"summColumn" }},
                                                        {id: "cargo_weight", header: _("cargo_weight"), width: 43, footer: { content:"summColumn" }},
                                                        {id: "capacity", header: _("capacity_short"), width: 45},
                                                        {id: "overload", header: _("overload"), width: 47},
                                                        {
                                                            id: "doc_cargo_weight",
                                                            header: _("doc_cargo_weight"),
                                                            width: 42,
															footer: { content:"summColumn" }
                                                        },
                                                        {
                                                            id: "doc_number",
                                                            header: _("doc_number"),
                                                            width: 70,
                                                            adjust: "data"
                                                        },
                                                        {
                                                            id: "doc_date",
                                                            header: _("doc_date"),
                                                            sort: "date",
                                                            format: webix.i18n.dateFormatStr,
                                                            width: 67
                                                        },
                                                        {id: "cargo_name", header: _("cargo_name"), adjust: "data"},
                                                        {
                                                            id: "truck1_weight",
                                                            header: _("truck1_weight"),
                                                            width: 41
                                                        },
                                                        {id: "ft_axis_1", header: _("_ft_axis_1"), width: 41},
                                                        {id: "ft_axis_2", header: _("_ft_axis_2"), width: 41},
                                                        {id: "ft_axis_3", header: _("_ft_axis_3"), width: 41},
                                                        {id: "ft_axis_4", header: _("_ft_axis_4"), width: 41},
                                                        {
                                                            id: "truck2_weight",
                                                            header: _("truck2_weight"),
                                                            width: 41
                                                        },
                                                        {id: "st_axis_1", header: _("_st_axis_1"), width: 41},
                                                        {id: "st_axis_2", header: _("_st_axis_2"), width: 41},
                                                        {id: "st_axis_3", header: _("_st_axis_3"), width: 41},
                                                        {id: "st_axis_4", header: _("_st_axis_4"), width: 41},
                                                        {id: "truck_diff", header: _("truck_diff_short"), width: 40},
                                                        {id: "side_diff", header: _("side_diff_short"), width: 40},
                                                        {
                                                            id: "offset_lengthwise",
                                                            header: _("offset_lengthwise_short"),
                                                            width: 40
                                                        },
                                                        {id: "cross_offset", header: _("cross_offset_short"), width: 35},
                                                        {id: "speed", header: _("speed"), width: 37},
                                                        {
                                                            id: "sender",
                                                            header: _("sender"),
                                                            sort: "string",
                                                            adjust: "data",
                                                            view: "list",
                                                        },
                                                        {
                                                            id: "reciever",
                                                            header: _("reciever"),
                                                            adjust: "data"
                                                        },
                                                        {
                                                            id: "transporter",
                                                            header: _("transporter"),
                                                            adjust: "data"
                                                        },
                                                        {
                                                            id: "departure_point",
                                                            header: _("departure_point"),
                                                            adjust: "data"
                                                        },
                                                        {
                                                            id: "destination_point",
                                                            header: _("destination_point"),
                                                            adjust: "data"
                                                        },
                                                        {id: "cargo", header: _("cargo"), adjust: "data"},
                                                        {id: "axels_count", header: _("axels_count"), width: 43},
                                                        {id: "photo_path", header: _("photo_path"), width: 71},
                                                        {id: "wagon_type", header: _("wagon_type"), adjust: "data"},
                                                        {
                                                            id: "optional1",
                                                            header: _("optional1"),
                                                            adjust: "data"
                                                        },
                                                        {
                                                            id: "optional2",
                                                            header: _("optional2"),
                                                            adjust: "data"
                                                        },
                                                        {
                                                            id: "optional3",
                                                            header: _("optional3"),
                                                            adjust: "data"
                                                        },
                                                        {
                                                            id: "optional4",
                                                            header: _("optional4"),
                                                            adjust: "data"
                                                        },
                                                        {
                                                            id: "optional5",
                                                            header: _("optional5"),
                                                            adjust: "data"
                                                        },
                                                        {id: "weight_type", header: _("weight_type"), width: 78},
                                                        {id: "autofilling", header: _("autofilling"), width: 72},
                                                        {id: "user", header: _("user_short"), width: 50},
                                                        {
                                                            id: "lastdateedited",
                                                            header: _("lastdateedited"),
                                                            width: 69
                                                        },
                                                        {
                                                            id: "lasttimeedited",
                                                            header: _("lasttimeedited"),
                                                            width: 66
                                                        },
                                                        {
                                                            id: "lasttimeeditor",
                                                            header: _("lasttimeeditor"),
                                                            width: 70
                                                        }]
                                                },
                                                {height: 10},
                                                {
                                                    id: one_wagon_block2, hidden: true, rows: [
                                                        {
                                                            cols: [
                                                                {},
                                                                {label: _("Wagon photo: "), view: "label", width: 120},
                                                                {}
                                                            ]
                                                        },
                                                        {height: 40},
                                                    ]
                                                },
                                                {height: 60},
                                                {
                                                    cols:
                                                        [
                                                            {label: _("Operator"), view: "label", width: 100},
                                                            {
                                                                label: "________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________",
                                                                view: "label",
                                                                width: 1000
                                                            },
                                                            {}
                                                        ]
                                                },
                                            ]
                                        },
                                        {},
                                    ]
                                },
                                {
                                    cols: [
                                        {},
                                        {
                                            view: "button",
                                            type: "form",
                                            value: _("Print"),
                                            id: button_print2,
                                            click: function () {
                                                var row0 = $$(header_for_print_report).getValue();
                                                var row1 = _("Type of weights") + " " + WEIGHT + " | " + _("Serial #") + " " + SERIAL + " | " + _("Operator") + " " + Credentials;
                                                var row2 = _("Date:") + " " + current_date + " | " + _("Organization") + ": " + ORGANIZATION;
                                                var header = "";
                                                var footer = "<br>" + "<div>" + _("Operator") + "________________________________________________________________________________________________________________________________________________________" + "</div>";
                                                if (report_for_print.one_wagon === true) {
                                                    var row3 = _("Sender") + ": " + $$(_sender).getValue();
                                                    var row4 = _("Reciever") + ": " + $$(_reciever).getValue();
                                                    var row5 = _("Departure point") + ": " + $$(_depPoint).getValue();
                                                    var row6 = _("Destination point") + ": " + $$(_destPoint).getValue();
                                                    var row7 = _("Trasnporter") + ": " + $$(_transporter).getValue();
                                                    //var logo = "<div style='position: absolute; top: 20px; right: 20px; display: block; height: 108px; width: 126px' class=" + '"logo_without_title"></div>';
                                                    header = "<div><h2>" + row0 + "</h2>"+ "</div>" + "<div><h3>" + row2 + "</h3></div>" + "<div>" + row1 + "</div>" +
                                                        '<div align="left">' + row3 + "</div>" + '<div align="left">' + row4 + "</div>" + '<div align="left">' + row5 + "</div>" + '<div align="left">' +
														row6 + "</div>" + '<div align="left">' + row7 + "</div>";
                                                    webix.print($$(table_for_report), {
                                                        mode: self.printOrientation,
                                                        margin: {
                                                            top: 30, bottom: 50, left: 60, right: 15
                                                        },
                                                        fit: "data",
                                                        trim: false,
                                                        docHeader: header,
                                                        docFooter: footer
                                                    });
                                                    $$(one_wagon_block1).hide();
                                                    $$(one_wagon_block2).hide();
                                                    $$(_sender).setValue("");
                                                    $$(_reciever).setValue("");
                                                    $$(_depPoint).setValue("");
                                                    $$(_destPoint).setValue("");
                                                    $$(_transporter).setValue("");
                                                } else {
                                                    header = "<div><h2>" + row0 + "</h2></div>" + "<div><h3>" + row2 + "</h3></div>" + "<div>" + row1 + "</div>";
                                                    webix.print($$(table_for_report), {
                                                        mode: self.printOrientation,
                                                        margin: {
                                                            top: 30, bottom: 50, left: 60, right: 15
                                                        },
														trim: false,
                                                        fit: "data",
                                                        docHeader: header,
                                                        docFooter: footer
                                                    });
                                                    $$(win1_preview_for_statical).hide();
                                                }
                                                $$(preview_for_report).hide();
                                            }
                                        },
                                        {}
                                    ]
                                },
                            ]
                        }]
                }
            }
        });

		//VIEW FOR PRINT FROM ARCHIVE
		const preview = {
			view: "window",
			css: theme,
			id: win1_preview,
			height: 690,
			width: 1280,
			move: true,
			head: {
				view: "toolbar", margin: -4, cols: [
					{view: "label", label: _("Report"), width: 1240},
					{
						view: "label", width: 40,
						template: function (obj) {
							var html = "<div class='del_element'>";
							return html + "</div>";
						},
						click: function () {
							$$(win1_preview).hide();
						}
					},
				]
			},
			body: {
				view: "scrollview", id: for_print_archive2, scroll: true, body: {
					rows: [
						{
							view: "form", elements: [
								{
									cols: [
										{height: 60},
										{
											rows: [
												{
													cols: [
														{},
														{id: header_for_enter, view: "text", width: 350, height: 30},
														{
															id: header_for_print,
															view: "label",
															width: 350,
															height: 30,
															hidden: true
														},
														{}
													]
												},
												{
													cols: [
														{},
														{label: _("Date:"), view: "label", width: 235},
														{label: current_date, view: "label", width: 150},
														{label: _("Organization") + ":", view: "label", width: 110},
														{label: ORGANIZATION, view: "label", width: 250},
														{}
													]
												},
                                                {
                                                    cols: [
                                                        {},
                                                        {label: _("Type of weights"), view: "label", width: 120},
                                                        {label: WEIGHT, view: "label", width: 120},
                                                        {width: 10},
                                                        {label: _("Serial #"), view: "label", width: 110},
                                                        {label: SERIAL, view: "label", width: 70},
                                                        {width: 10},
                                                        {label: _("Operator"), view: "label", width: 90},
                                                        {label: Credentials, view: "label", width: 120},
                                                        {}
                                                    ]
                                                },
												{
													view: "datatable",
													id: table_for_print,
													css: "for_print",
													editable: false,
                                                    fixedRowHeight: false,
                                                    rowLineHeight: 11,
													scroll: true,
													resizeColumn: {headerOnly: true},
													select: false,
													navigation: false,
													hover: "myhover",
                                                    footer:true,
													columns: [
														{id: "id", header: "#", width: 34, sort: "int", footer: _("Summary")},
														{
															id: "write_date",
															header: _("date"),
															width: 52,
															sort: "date",
															format: webix.i18n.dateFormatStr
														},
														{id: "write_time", header: _("time"), width: 36},
														{
															id: "direction",
															header: "",
															css: "status",
															sort: "text",
															width: 26,
															template: data => {
																let icon = "";
																if (data.direction === true) {
																	icon = "arrow-right-small";
																	return `<span class='webix_icon wxi wxi-${icon} ${data.status}'></span>`;
																} else if (data.direction === false) {
																	icon = "arrow-left-small";
																	return `<span class='webix_icon wxi wxi-${icon} ${data.status}'></span>`;
																} else return "";
															}
														},
														{
															id: "train_number",
															header: _("train_number"),
															sort: "int",
															width: 70
														},
														{
															id: "wagon_number",
															header: _("wagon_number"),
															sort: "int",
															width: 65
														},
														{
															id: "start_weight",
															header: _("start_weight"),
															width: 42,
															footer:{ content:"summColumn" }
														},
														{
															id: "doc_start_weight",
															header: _("doc_start_weight"),
															width: 42,
															footer:{ content:"summColumn" }
														},
														{id: "brutto", header: _("brutto"), width: 45, footer:{ content:"summColumn" }},
														{id: "cargo_weight", header: _("cargo_weight"), width: 43, footer:{ content:"summColumn" }},
														{id: "capacity", header: _("capacity_short"), width: 45},
														{id: "overload", header: _("overload"), width: 53},
														{
															id: "doc_cargo_weight",
															header: _("doc_cargo_weight"),
															width: 42,
															footer:{ content:"summColumn" }
														},
														{id: "doc_number", header: _("doc_number"), width: 70, adjust: "data"},
														{
															id: "doc_date",
															header: _("doc_date"),
															sort: "date",
															format: webix.i18n.dateFormatStr,
															width: 70
														},
														{id: "cargo_name", header: _("cargo_name"), adjust: "data"},
														{id: "truck1_weight", header: _("truck1_weight"), width: 41},
                                                        {id: "ft_axis_1", header: _("_ft_axis_1"), width: 41},
                                                        {id: "ft_axis_2", header: _("_ft_axis_2"), width: 41},
                                                        {id: "ft_axis_3", header: _("_ft_axis_3"), width: 41},
                                                        {id: "ft_axis_4", header: _("_ft_axis_4"), width: 41},
														{id: "truck2_weight", header: _("truck2_weight"), width: 41},
                                                        {id: "st_axis_1", header: _("_st_axis_1"), width: 41},
                                                        {id: "st_axis_2", header: _("_st_axis_2"), width: 41},
                                                        {id: "st_axis_3", header: _("_st_axis_3"), width: 41},
                                                        {id: "st_axis_4", header: _("_st_axis_4"), width: 41},
														{id: "truck_diff", header: _("truck_diff_short"), width: 40},
														{id: "side_diff", header: _("side_diff_short"), width: 40},
														{
															id: "offset_lengthwise",
															header: _("offset_lengthwise_short"),
															width: 40
														},
														{id: "cross_offset", header: _("cross_offset_short"), width: 35},
														{id: "speed", header: _("speed"), width: 37},
														{id: "sender", header: _("sender"), sort: "string", view: "list", adjust: "data"},
														{id: "reciever", header: _("reciever"), adjust: "data"},
														{id: "transporter", header: _("transporter"), adjust: "data"},
														{id: "departure_point", header: _("departure_point"), adjust: "data"},
														{id: "destination_point", header: _("destination_point"), adjust: "data"},
														{id: "cargo", header: _("cargo"), adjust: "data"},
														{id: "axels_count", header: _("axels_count"), width: 43},
														{id: "photo_path", header: _("photo_path"), width: 71},
														{id: "wagon_type", header: _("wagon_type"), adjust: "data"},
														{id: "optional1", header: _("optional1"), adjust: "data"},
														{id: "optional2", header: _("optional2"), adjust: "data"},
														{id: "optional3", header: _("optional3"), adjust: "data"},
														{id: "optional4", header: _("optional4"), adjust: "data"},
														{id: "optional5", header: _("optional5"), adjust: "data"},
														{id: "weight_type", header: _("weight_type"), width: 78},
														{id: "autofilling", header: _("autofilling"), width: 72},
														{id: "user", header: _("user_short"), width: 50},
														{
															id: "lastdateedited",
															header: _("lastdateedited"),
															width: 69
														},
														{
															id: "lasttimeedited",
															header: _("lasttimeedited"),
															width: 66
														},
														{
															id: "lasttimeeditor",
															header: _("lasttimeeditor"),
															width: 70
														}],
												},
												{height: 60},
												{
													cols:
														[
															{label: _("Operator"), view: "label", width: 100},
															{
																label: "_______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________",
																view: "label",
																width: 900
															},
															{}
														]
												},
											]
										},
										{},
									]
								},
								{
									cols: [
										{},
										{
											view: "button",
											type: "form",
											value: _("Print"),
											id: button_print,
											click: function () {
												var row0 = $$(header_for_enter).getValue();
												var row1 = _("Type of weights") + " " + WEIGHT + " | " + _("Serial #") + " " + SERIAL + " | " + _("Operator") + " " + Credentials;
												var row2 = _("Date:") + " " + current_date + " | " + _("Organization") + ": " + ORGANIZATION;
                                                var header = "<div><h2>" + row0 + "</h2></div>" + "<div><h3>" + row2 + "</h3></div>" + "<div>" + row1 + "</div>";
												var footer = "<br>" + "<div>" + _("Operator") + "_____________________________________________________________________________________________________________________________________________________________________________________" + "</div>";
												webix.print($$(table_for_print), {
													docHeader: header,
													docFooter: footer,
                                                    fit: "data",
                                                    margin: {
                                                        top: 30, bottom: 50, left: 60, right: 15
                                                    },
													mode: "landscape"
												});
												$$(header_for_enter).setValue("");
											}
										},
										{}
									]
								}
							]
						}]
				}
			}
		};

		const download = {
			view: "window",
			css: theme,
			id: win1_download,
			height: 600,
			width: 410,
			move: true,
			head: {
				view: "toolbar", margin: -4, cols: [
					{view: "label", label: _("Download data"), width: 370},
					{
						view: "label",
						template: function (obj) {
							var html = "<div class='del_element'>";
							return html + "</div>";
						},
						click: function () {
							$$(win1_download).hide();
						}
					},
				]
			},
			body: {
				rows: [
					{
						view: "form", scroll: false, width: 500, elements: [
							{
								cols: [
									{
										view: "datepicker",
										label: _("Start date"),
										timepicker: false,
										labelWidth: 150,
										width: 285,
										name: "start_date",
										stringResult: true,
										format: "%d %M %Y"
									},
									{
										view: "datepicker",
										type: "time",
										width: 85,
										name: "start_time",
										stringResult: true,
										format: "%H:%i"
									},
									{}
								]
							},
							{
								cols: [
									{
										view: "datepicker",
										timepicker: false,
										label: _("End date"),
										labelWidth: 150,
										width: 285,
										name: "end_date",
										stringResult: true,
										format: "%d %M %Y"
									},
									{
										view: "datepicker",
										type: "time",
										width: 85,
										name: "end_time",
										stringResult: true,
										format: "%H:%i"
									},
									{}
								]
							},
							{
								view: "button", type: "form", value: _("Download data"), click: function () {
									var startDate = this.getParentView().getValues().start_date;
									var startTime = this.getParentView().getValues().start_time;
									if (startTime === '' && startDate !== '') {
										startTime = '00:00'
									}
									if (startTime !== '' && startDate === '') {
										startTime = ''
									}
									var endDate = this.getParentView().getValues().end_date;
									var endTime = this.getParentView().getValues().end_time;
									if (endTime === '' && endDate !== '') {
										endTime = '23:59'
									}
									if (endTime !== '' && endDate === '') {
										endTime = ''
									}
									var start = startDate.split(' ')[0] + ' ' + startTime;
									if (start === ' ') {
										start = ''
									}
									var end = endDate.split(' ')[0] + ' ' + endTime;
									if (end === ' ') {
										end = ''
									}
									getArchive(start, end);
								}
							}
						]
					},
					{
						view: "toolbar", margin: -4, cols: [
							{
								view: "button", value: _("Close"), click: function () {
									$$(win1_download).hide();
								}
							}
						]
					}]
			}
		};

		const upload = {
			view: "window",
			css: theme,
			id: win1_upload,
			height: 600,
			width: 327,
			move: true,
			head: {
				view: "toolbar", margin: -4, cols: [
					{view: "label", label: _("Upload data"), width: 280},
					{
						view: "label",
						template: function (obj) {
							var html = "<div class='del_element'>";
							return html + "</div>";
						},
						click: function () {
							$$(win1_upload).hide();
						}
					},
				]
			},
			body: {
				rows: [
					{
						view: "form", scroll: false, width: 320, elements: [
							{
								label: _("Filename"),
								labelWidth: 100,
								view: "text",
								minWidth: 60,
								height: 30,
								name: "log_filename",
							},
							{
								view: "button", type: "form", value: _("Save data"), click: function () {
									var name = this.getParentView().getValues().log_filename;
									saveArchive(name);
								}
							}
						]
					},
					{
						view: "toolbar", margin: -4, cols: [
							{
								view: "button", value: _("Close"), click: function () {
									$$(win1_upload).hide();
								}
							}
						]
					}]
			}
		};

		const reports = {
			view: "window",
			css: theme,
			id: win1_reports,
			height: 600,
			width: 327,
			move: true,
			head: {
				view: "toolbar", margin: -4, cols: [
					{view: "label", label: _("Report choosing"), width: 280},
					{
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
				rows: [
					{
						view: "form", id: form, scroll: false, width: 320, elements: [
							{
								view: "select", width: 300, id: selectForm,
								label: _('Report'), labelWidth: 60, labelAlign: "left", options: ip + "/reports/"
							},
							{
								view: "button", type: "form", id: printReport, value: _("Preview"),
								click: function () {
									var checkForEmpty = $$(selectForm).getValue();
									if (checkForEmpty === "") {
										webix.message({
											type: "info",
											text: (_("No reports for printing"))
										});
									}
									else getReport($$(selectForm).getValue());
								}
							}
						]
					},
					{
						view: "toolbar", margin: -6, cols: [
							{
								view: "button", value: _("Close"), click: function () {
									$$(win1_reports).hide();
								}
							}
						]
					}]
			}
		};

		const tableConfigurator = {
			view: "window",
			css: theme,
			id: win1,
			height: 600,
			width: 350,
			move: true,
			head: {
				view: "toolbar", margin: -4, cols: [
					{view: "label", label: _("Table configurator: Archive"), width: 280},
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
										if (record.hide !== true) {
											report_columns[record.column] = i;
											i = i + 1;
										} else {
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

		const exportPopup = {
			view: "popup",
			id: export_popup,
			head: "Submenu",
			width: 120,
			body: {
				view: "list",
				data: [
					{
						view: "icon", tooltip: _("Export table to xlsx format"), value: _("To XLSX"),
						icon: "wxi wxi-xlsx-small"
					},
					{
						view: "icon", tooltip: _("Export table to pdf format"), value: _("To PDF"),
						icon: "wxi wxi-pdf-small"
					},
					{
						view: "icon", tooltip: _("Export table to csv format"), value: _("To CSV"),
						icon: "wxi wxi-csv-small"
					}
				],
				autoheight: true,
				select: true,
				on: {
					onItemClick: function (id, e, node) {
						var currentdate = new Date();
						var datetime = currentdate.getDate() + "." + (currentdate.getMonth() + 1) + "."
							+ currentdate.getFullYear() + " " + currentdate.getHours() + ":" + currentdate.getMinutes();
						var filename = "vtv datatable " + datetime;
						var item = this.getItem(id);
						console.log(item.value);
						if (item.value === _("To XLSX")) {
							$$("work-table").clearAll();
							$$(datatable_name).eachRow(function (row) {
								const record = $$(datatable_name).getItem(row);
								$$("work-table").add(record);
							});
							pingTimer = setInterval(function () {
								sendPing();
							}, 800);
							webix.toExcel($$("work-table"), {filename: filename});
							setTimeout(function () {
								clearInterval(pingTimer);
							}, 60000);
							webix.message({
								type: "info",
								text: (_("Export to") + " XLSX" + _("WAIT"))
							});
						} else if (item.value === _("To PDF")) {
							$$("work-table").clearAll();
							getHidOptionsForWorkTable();
							$$(datatable_name).eachRow(function (row) {
								const record = $$(datatable_name).getItem(row);
								$$("work-table").add(record);
							});
							pingTimer = setInterval(function () {
								sendPing();
							}, 800);
							webix.toPDF($$("work-table"), {filename: filename, autowidth: true});
							setTimeout(function () {
								clearInterval(pingTimer);
							}, 60000);
							webix.message({
								type: "info",
								text: (_("Export to") + " PDF" + _("WAIT"))
							});
							makeWorkTableVisible();
						} else if (item.value === _("To CSV")) {
							$$("work-table").clearAll();
							$$(datatable_name).eachRow(function (row) {
								const record = $$(datatable_name).getItem(row);
								$$("work-table").add(record);
							});
							pingTimer = setInterval(function () {
								sendPing();
							}, 800);
							webix.toCSV($$("work-table"), {filename: filename});
							setTimeout(function () {
								clearInterval(pingTimer);
							}, 60000);
							webix.message({
								type: "info",
								text: (_("Export to") + " CSV" + _("WAIT"))
							});
						}
					}
				}
			}
		};

		const main = {
			rows: [
				{height: 5},
				{
					id: uploadAPIarchive,
					hidden: true,
					view: "uploader",
					upload: ip + '/upload/archive',
					on: {
						onBeforeFileAdd: function (item) {
							var type = item.type.toLowerCase();
							if (type !== "dump") {
								webix.message(_("Only .DUMP files are supported"));
								return false;
							}
						},
						onFileUploadError: function (item) {
							webix.alert(_("Error during file upload"));
						},
						onFileUpload: function (file, response) {
							var today = new Date();
							var dd = today.getDate();
							var mm = today.getMonth(); //January is 0!
							var yyyy = today.getFullYear();
							if (mm === 0) {
								yyyy = yyyy - 1;
								mm = 12;
							}
							if (dd < 10) dd = "0" + dd;
							if (mm < 10) mm = "0" + mm;
							var current_date = yyyy + "-" + mm + "-" + dd + ' 00:00';
							webix.message(_("Upload successful"));
							getArchive(current_date, '');
						}
					},
					apiOnly: true
				},
				{
					view: "toolbar", css: theme,
					elements: [
						{
							view: "icon", tooltip: _("Export table to xlsx format"), hidden: !access.printing,
							icon: "wxi wxi-xlsx", popup: exportPopup
						},
						{
							view: "button",
							hidden: !access.printing,
							type: "image",
							label: _("Reports"),
							autowidth: true,
							image: "sources/styles/report.svg",
							popup: reports
						},
						{
							view: "icon", tooltip: _("Print table"), hidden: !access.printing,
							icon: "wxi wxi-print", popup: preview, click: function () {
                                var result = [];
                                var heigth = 123;
                                $$(datatable_name).eachRow(function (row) {
                                    const record = $$(datatable_name).getItem(row);
                                    if (record.type === "static.wagon") {
                                        record.weight_type = _("weighing-static-wagon");
                                    }
                                    else if (record.type === "static.truck") {
                                        record.weight_type = _("weighing-static-truck");
                                    }
                                    else if (record.type === "dynamic") {
                                        record.weight_type = _("weighing-dynamic");
                                    }
                                    result.push(record);
                                    heigth += 36;
                                });
                                tableParse(result, heigth);

                                setTimeout(function () {
                                    webix.extend($$(win1_preview), webix.ProgressBar);

                                    function show_progress_icon(delay) {
                                        $$(win1_preview).disable();
                                        $$(win1_preview).showProgress({
                                            type: "icon",
                                            delay: delay,
                                            hide: true
                                        });
                                        setTimeout(function () {
                                            $$(win1_preview).enable();
                                        }, delay);
                                    }

                                    show_progress_icon(1000);
                                }, 100);
                            }
						},
						{},
						{
							view: "button",
							type: "image",
							label: _("Download"),
							autowidth: true,
							image: "sources/styles/download.svg",
							popup: download,
						},
						{
							view: "button",
							type: "image",
							hidden: !access.save_archive,
							label: _("Upload"),
							autowidth: true,
							image: "sources/styles/upload.svg",
							on: {
								onItemClick: function (id) {
									$$(uploadAPIarchive).show();
									$$(uploadAPIarchive).fileDialog(this);
									$$(uploadAPIarchive).hide();
								}
							}
						},
						{},
						{
							view: "button",
							type: "image",
							hidden: !access.save_archive,
							label: _("_Save"),
							autowidth: true,
							image: "sources/styles/download.svg",
							popup: upload
						},
						{width: 3},
						{
							view: "button",
							value: _("Re-weigh"),
							hidden: !access.cancel_weighting,
							autowidth: true,
							type: "form",
							css: "webix_icon_button",
							click: function () {
								$$(datatable_name).editStop();
								var data = $$(datatable_name).getSelectedItem();
								console.log(data);
								if (data === undefined) {
									webix.message({
										type: "error",
										text: _("Choose row for re-weighing first")
									});
								} else {
									var id = data.id;
									reWeight(id, data.type);
								}
							}
						},
						{width: 3},
						{
							view: "icon", tooltip: _("Go to table view settings"),
							icon: "wxi wxi-settings", hidden: !access.table_configuration,
							popup: tableConfigurator,
							click: function () {
								getHidOptionsForConfigurator();
							}
						},
						{width: 6}
					]
				},
				{height: 5},
				AllTActions,
				WorkTable
			]
		};

		return {type: "wide", cols: [main]};
	}

	init (view, url) {
		const _ = this.app.getService("locale")._;
		const ip = this.app.config.remoteHOST;
		const User = this.app.config.user;
		const Type = "archive";
		const datatable_name = "operations";

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
							var aData = ["write_date", "write_time", "direction", "wagon_number", "start_weight", "doc_start_weight",
								"brutto", "cargo_weight", "overload", "doc_cargo_weight", "doc_number", "doc_date", "cargo_name",
								"capacity", "truck1_weight", "ft_axis_1", "ft_axis_2", "ft_axis_3", "ft_axis_4", "truck2_weight",
                                "st_axis_1", "st_axis_2", "st_axis_3", "st_axis_4", "truck_diff", "side_diff", "offset_lengthwise",
								"cross_offset", "sender", "reciever", "transporter", "departure_point", "destination_point",
								"cargo", "axels_count", "photo_path", "speed", "weight_type", "train_number", "wagon_type",
								"optional1", "optional2", "optional3", "optional4", "optional5", "autofilling", "user",
								"lastdateedited", "lasttimeedited", "lasttimeeditor"];
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
								} else {
									$$(datatable_name).hideColumn(item.column);
								}
							});
						}
					}
				});
		}

		function daysInMonth (month, year) {
			return new Date(year, month, 0).getDate();
		}

		function getArchive (start, end) {
			var _methodName = "getArchive";
			webix.ajax().post(
				ip,
				{"method": _methodName, "user": User, "params": {"start": start, "end": end}},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							$$(datatable_name).clearAll();
                            data.params.forEach(function (item, i, arr) {
                                item.weight_type = _("arch" + item.type);
                            });
							$$(datatable_name).parse(data.params);
							$$(datatable_name).sort("#id#", "asc", "int");
							webix.message({type: "info", text: _("Loaded from archive")});
						}
						else if (data.answer === "error") {
							webix.message({type: "error", text: _(data.params.message)});
						}
					}
				});
		}

		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth(); //January is 0!
		var yyyy = today.getFullYear();
		if (mm === 0) {
			yyyy = yyyy - 1;
			mm = 12;
		}
		var daysInPreviousMonth = daysInMonth(mm, yyyy);
		if (daysInPreviousMonth < dd) dd = daysInPreviousMonth;
		else {
			if (dd < 10) dd = "0" + dd;
		}
		if (mm < 10) mm = "0" + mm;
		var current_date = yyyy + "-" + mm + "-" + dd + ' 00:00';

		getArchive(current_date, '');
		getHidOptions();
	}
}

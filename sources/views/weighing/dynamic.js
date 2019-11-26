import {JetView} from "webix-jet";
import DynamicTActions from "views/datatables/dynamictactions";

export default class Dynamic extends JetView {
	config() {
		const lang = this.app.getService("locale").getLang();
		const theme = this.app.config.theme;
		const _ = this.app.getService("locale")._;
		const ids = this.app.config.ids;
		const hideOptions = this.app.config.hideOptions;
		const hidden = this.app.config.weighing["dynamichidden"];
		const ip = this.app.config.remoteHOST;
		const referenceView = this;
		const User = this.app.config.user;
		const access = this.app.config.globals.access;
		const Type = "dynamic";

		function reWeight (ids) {
			var _methodName = "reWeigh";
			var flag = true;
			ids.forEach(function (item, i, arr) {
				webix.ajax().post(
					ip,
					{
						"method": _methodName, "user": User, "params": {
							"type": "_dynamic", "id": item, "user": User
						}
					},
					function (text, xml, xhr) {
						var data = JSON.parse(text);
						console.log(data);
						if (data.method === _methodName) {
							if (data.answer === "ok") {
								$$('dynamic_operations').remove(item);
							}
							else {
								flag = false;
								webix.message({type: "error", text: _(data.params.message)});
							}
						}
					});
			});
			if (flag) webix.message({type: "default", text: _("Deleted")});
		}

		function setZero () {
			var _configuration = $$('mainTop').$scope.app.config.configuration;
			if (_configuration.weighing_allowed) {
				var _methodName = "setZero";
				webix.ajax().post(
					ip, {"method": "setZero", "user": User, "params": {"truck": [1, 2]}},
					function (text, xml, xhr) {
						var data = JSON.parse(text);
						if (data.method === _methodName) {
							if (data.answer === "ok") {
								webix.message({type: "default", text: _(data.params.message)});
							}
							else webix.message({
								type: "error",
								text: _(data.params.message)
							});
						}
						else webix.message({
							type: "error",
							text: _(data.params.message)
						});
					}
				);
			}
			else webix.message({
				type: "error", text: _("Weighing is not allowed")
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
								"optional3", "optional4", "optional5", "autofilling", "lastdateedited", "lasttimeedited", "lasttimeeditor"];
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
									$$("dynamic_operations").moveColumn(item.column, i + 2);
								}
								else if ($$("dynamic_operations").isColumnVisible(item.column)) {
									$$("dynamic_operations").hideColumn(item.column);
								}
							});
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
							var aData = ["write_date", "write_time", "direction", "wagon_number", "start_weight",
								"doc_start_weight", "brutto", "cargo_weight", "overload", "doc_cargo_weight", "doc_number",
								"doc_date", "cargo_name", "capacity", "truck1_weight", "ft_axis_1", "ft_axis_2", "ft_axis_3",
								"ft_axis_4", "truck2_weight", "st_axis_1", "st_axis_2", "st_axis_3", "st_axis_4", "truck_diff",
								"side_diff", "offset_lengthwise", "cross_offset", "speed", "sender", "reciever", "transporter",
								"departure_point", "destination_point", "cargo", "axels_count", "photo_path", "train_number",
								"wagon_type", "optional1", "optional2", "optional3", "optional4", "optional5", "autofilling",
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
							data = resultCollumn;
							$$(dt11).clearAll();
							$$(dt11).parse(data);
						}
					}
				});
		}

		function setWidth () {
			if (lang == "ru") {
				return 290;
			}
			else return 230;
		}

		var dt11 = "dt11" + ids.dt11;
		ids.dt11 = ids.dt11 + 1;
		var win11 = "win11" + ids.win11;
		ids.win11 = ids.win11 + 1;
		newv => this.app.config.ids = ids;

		const data = [
			{"collumn": _("date"), "column": "write_date", "hide": hideOptions[Type].date},
			{"collumn": _("time"), "column": "write_time", "hide": hideOptions[Type].time},
			{"collumn": _("direction"), "column": "direction", "hide": hideOptions[Type].direction},
			{"collumn": _("wagon_number"), "column": "wagon_number", "hide": hideOptions[Type].wagon_number},
			{"collumn": _("start_weight"), "column": "start_weight", "hide": hideOptions[Type].start_weight},
			{"collumn": _("doc_start_weight"), "column": "doc_start_weight", "hide": hideOptions[Type].doc_start_weight},
			{"collumn": _("brutto"), "column": "brutto", "hide": hideOptions[Type].brutto},
			{"collumn": _("cargo_weight"), "column": "cargo_weight", "hide": hideOptions[Type].cargo_weight},
			{"collumn": _("overload"), "column": "overload", "hide": hideOptions[Type].overload},
			{"collumn": _("doc_cargo_weight"), "column": "doc_cargo_weight", "hide": hideOptions[Type].doc_cargo_weight},
			{"collumn": _("doc_number"), "column": "doc_number", "hide": hideOptions[Type].doc_number},
			{"collumn": _("doc_date"), "column": "doc_date", "hide": hideOptions[Type].doc_date},
			{"collumn": _("cargo_name"), "column": "cargo_name", "hide": hideOptions[Type].cargo_name},
			{"collumn": _("capacity_for_oper_table"), "column": "capacity", "hide": hideOptions[Type].capacity},
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
			{"collumn": _("offset_lengthwise"), "column": "offset_lengthwise", "hide": hideOptions[Type].offset_lengthwise},
			{"collumn": _("cross_offset"), "column": "cross_offset", "hide": hideOptions[Type].cross_offset},
			{"collumn": _("speed"), "column": "speed", "hide": hideOptions[Type].speed},
			{"collumn": _("sender"), "column": "sender", "hide": hideOptions[Type].sender},
			{"collumn": _("reciever"), "column": "reciever", "hide": hideOptions[Type].reciever},
			{"collumn": _("transporter"), "column": "transporter", "hide": hideOptions[Type].transporter},
			{"collumn": _("departure_point"), "column": "departure_point", "hide": hideOptions[Type].departure_point},
			{"collumn": _("destination_point"), "column": "destination_point", "hide": hideOptions[Type].destination_point},
			{"collumn": _("cargo"), "column": "cargo", "hide": hideOptions[Type].cargo},
			{"collumn": _("axels_count"), "column": "axels_count", "hide": hideOptions[Type].axels_count},
			{"collumn": _("photo_path"), "column": "photo_path", "hide": hideOptions[Type].photo_path},
			{"collumn": _("train_number"), "column": "train_number", "hide": hideOptions[Type].train_number},
			{"collumn": _("wagon_type"), "column": "wagon_type", "hide": hideOptions[Type].wagon_type},
			{"collumn": _("lastdateedited"), "column": "lastdateedited", "hide": hideOptions[Type].lastdateedited},
			{"collumn": _("lasttimeedited"), "column": "lasttimeedited", "hide": hideOptions[Type].lasttimeedited},
			{"collumn": _("lasttimeeditor"), "column": "lasttimeeditor", "hide": hideOptions[Type].lasttimeeditor},
			{"collumn": _("optional1"), "column": "optional1", "hide": hideOptions[Type].optional1},
			{"collumn": _("optional2"), "column": "optional2", "hide": hideOptions[Type].optional2},
			{"collumn": _("optional3"), "column": "optional3", "hide": hideOptions[Type].optional3},
			{"collumn": _("optional4"), "column": "optional4", "hide": hideOptions[Type].optional4},
			{"collumn": _("optional5"), "column": "optional5", "hide": hideOptions[Type].optional5},
			{"collumn": _("autofilling"), "column": "autofilling", "hide": hideOptions[Type].autofilling}
		];

		const hidOptions = {
			view: "datatable",
			editable: true,
			scroll: "y",
			css: theme,
			id: dt11,
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
					var item = ($$(dt11).getItem(id.row));
					hideOptions[Type][item.column] = item.hide;
					newv => this.app.config.hideOptions = hideOptions;

					if (item.hide === false) {
						item.hide = true;
						$$("dynamic_operations").hideColumn(item.column);
						$$(dt11).updateItem(id, item);
					}
					else {
						item.hide = false;
						$$("dynamic_operations").showColumn(item.column);
						$$(dt11).updateItem(id, item);
					}
				}
			}
		};

		webix.protoUI({
			name: "hchart",
			$init: function () {
				this.uid = "chart" + webix.uid();
				this.$view.innerHTML = "<div id='" + this.uid + "' style='width:100%;height:100%'></div>";

				this.chart = null;
				this.$ready.push(this.render);
			},
			render: function () {
				var uid = "#" + this.uid;
				var config = this.config.settings;
				$(function () {
					$(uid).highcharts(config);
				});
			}
		}, webix.ui.view);

		const popUp = {
			view: "window",
			css: theme,
			id: win11,
			height: 600,
			width: 350,
			move: true,
			head: {
				view: "toolbar", margin: -4, cols: [
					{view: "label", label: _("Table configurator: Dynamics"), width: 280},
					{
						view: "label", click: function () { $$(win11).hide(); },
						template: function (obj) {
							var html = "<div class='del_element'>";
							return html + "</div>";
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
								view: "button", value: _("Save"), click: function () {
									var report_columns = {};
									var i = 1;
									$$(dt11).eachRow(function (row) {
										const record = $$(dt11).getItem(row);
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
									$$(win11).hide();
								}
							}
						]

					}]
			}
		};

		const main = {
			id: "dynamic-view", template: " ", value: "DYNAMIC", hidden: hidden, rows: [
				{template: " ", height: 5},
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
								$$("dynamic_operations").undo();
							}
						},
						{
							view: "button",
							value: _("Set zero weights"),
							autowidth: true,
							hidden: true,
							type: "form",
							click: function () {
								if (config.configuration.weighing_allowed) {
									setZero();
								}
								else {
									webix.message({type: "error", text: _("Weighing is not allowed")});
								}
							}
						},
						{},
						{
							view: "switch",
							id: "taraControl2",
							hidden: !access.tara_control,
							width: 180,
							value: 0,
							label: _("Tara control"),
							labelAlign: "left",
							labelPosition: "left",
							labelWidth: 110,
							on: {
								onChange: function (newState) {
									if ($$("brutto/tara2").isVisible()) $$('brutto/tara2').hide();
									else $$('brutto/tara2').show();
								}
							}
						},
						{},
						{
							template: " ", autowidth: true, cols: [
								{
									label: _("Speed, kM/h"),
									view: "label",
									width: setWidth(),
									css: {"font-size": "28pt !important"}
								},
								{
									view: "text",
									width: 80,
									height: 30,
									id: "_speed",
									css: {"font-size": "23pt !important"}
								},
							]
						},
						{},
						{
							view: "switch",
							id: "brutto/tara2",
							width: 180,
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
							hidden: !access.cancel_weighting,
							autowidth: true,
							type: "form",
							click: function () {
								{
									webix.modalbox({
										title: _("Really reweigh whole train?"),
										buttons: [_("Yes"), _("No")],
										width: 500,
										text: "",
										callback: function (result) {
											if (result === '0') {
												var ids = [];
												var data = $$('dynamic_operations').getSelectedItem();
												if (data !== undefined) {
													$$('dynamic_operations').eachRow(function (row) {
														const record = $$('dynamic_operations').getItem(row);
														if (record.train_number === data.train_number) {
															ids.push(record.id);
														}
													});
													reWeight(ids);
												}
												else {
													webix.message({
														type: "error",
														text: _("Choose row for re-weighing first")
													});
												}
											}
										}
									});
								}
							}
						},
						{width: 3},
						{
							view: "icon", tooltip: _("Go to table view settings"),
							icon: "wxi wxi-settings",
							hidden: !access.table_configuration,
							popup: popUp,
							click: function () {
								getHidOptionsForConfigurator();
							}
						},
						{width: 6}
					]
				},
				{template: " ", height: 5},
				{
					id: 3,
					height: 400,
					template: "<div id='section3' style='height: 400px; min-width: 310px'></div>",
					hidden: true
				},
				DynamicTActions
			]
		};

		return main;
	}

	init(view, url) {
		const weighing = this.app.config.weighing;
		const _ = this.app.getService("locale")._;
		const ip = this.app.config.remoteHOST;
		const User = this.app.config.user;
		const Type = "dynamic";

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
								"capacity","truck1_weight", "ft_axis_1", "ft_axis_2", "ft_axis_3", "ft_axis_4", "truck2_weight", "st_axis_1",
								"st_axis_2", "st_axis_3", "st_axis_4", "truck_diff", "side_diff", "offset_lengthwise",
								"cross_offset", "speed", "sender", "reciever", "transporter", "departure_point", "destination_point",
								"cargo", "axels_count", "photo_path", "train_number", "wagon_type", "optional1", "optional2",
								"optional3", "optional4", "optional5", "autofilling", "lastdateedited", "lasttimeedited", "lasttimeeditor"];
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
										$$("dynamic_operations").moveColumn(item.column, i + 2);
									}
									else {
										$$("dynamic_operations").hideColumn(item.column);
									}
								});
						}
					}
				});
		}

		getHidOptions();
	}

}

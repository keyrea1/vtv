import {JetView} from "webix-jet";

export default class Auto_calibration extends JetView {
	config() {
		const _ = this.app.getService("locale")._;
		const lang = this.app.getService("locale").getLang();
		const theme = this.app.config.theme;
		const ip = this.app.config.remoteHOST;

		function setZero() {
			var _methodName = "setZero";
			webix.ajax().post(
				ip,
				{ "method": "setZero", "user": User, "params": {"truck": [1, 2]} },
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					var method = data.method;
					if (method == _methodName) {
						var answer = data.answer;
						if (answer === "ok") {
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

		var axials_count = [1,2,3,4,5,6,7,8];
		var loco_positopn = [_("forward"),_("backward")];
		var calibration = false;
		var referenceView = this;

		return {
			view: "scrollview", scroll: "y", hidden: true, id:"auto-calibration", body: {
				rows: [
					{
						cols:[
							{width: 20},
							{
								view: "button", value: _("Add"), tooltip: _("Add calibration point"),
								autowidth: true,
								click: function () {
									var _i = 1;
									var lastItemI;
									var ids = ($$("dyn_calibration").collectValues("id"));
									ids.forEach(function (item, i, arr) {
										console.log(ids)
										lastItemI = item["id"];
										console.log(lastItemI)
										if (_i <= lastItemI) {
											_i = lastItemI + 1;
										}
									});
									$$("dyn_calibration").add({id: _i, weight: 0, "axials_count": 1, "center_distance":0, "truck_distance":0, "koef":0, "weightKG":0, "percent_weight":0});
								}
							},
							{},
							{
								cols: [
									{label: _("Speed"), view: "label", width: 200, align: "right", css: {"font-size": "20pt !important"}},
									{view: "text", width: 60, height: 30, id: "_speed", value: "0"}
								]
							},
							{},
							{
								view: "button",
								value: _("Set zero weights"),
								autowidth: true,
								type: "form",
								click: function () {
									setZero();
								}
							},
							{width: 20}
						]
					},
					{
						cols: [
							{width: 20},
							{
								view: "datatable",
								id: "dyn_calibration",
								editable: true,
								height: 260,
								resizeColumn: {headerOnly: true},
								select: "row",
								navigation: true,
								hover: "myhover",
								columns: [
									{id: "id", header: "#", adjust: true, sort: "int"},
									{
										id: "weight", header: _("weight"), width: 100,
										editor: "text", format: function (value) {
											return webix.i18n.numberFormat(value);
										},
										editParse: function (value) {
											return webix.Number.parse(value, {
												groupSize: webix.i18n.groupSize,
												groupDelimiter: webix.i18n.groupDelimiter,
												decimalSize: webix.i18n.decimalSize,
												decimalDelimiter: webix.i18n.decimalDelimiter
											});
										},
										editFormat: function (value) {
											return webix.i18n.numberFormat(value);
										}
									},
									{
										id: "axials_count", header: _("axials_count"),
										adjust: true, editor: "combo", collection: axials_count
									},
									{
										id: "center_distance", header: _("center_distance"),
										adjust: true, fillspace: true, editor: "text", format: function (value) {
											return webix.i18n.numberFormat(value);
										},
										editParse: function (value) {
											return webix.Number.parse(value, {
												groupSize: webix.i18n.groupSize,
												groupDelimiter: webix.i18n.groupDelimiter,
												decimalSize: webix.i18n.decimalSize,
												decimalDelimiter: webix.i18n.decimalDelimiter
											});
										},
										editFormat: function (value) {
											return webix.i18n.numberFormat(value);
										}
									},
									{
										id: "truck_distance", header: _("truck_distance"),
										adjust: true, editor: "text", format: function (value) {
											return webix.i18n.numberFormat(value);
										},
										editParse: function (value) {
											return webix.Number.parse(value, {
												groupSize: webix.i18n.groupSize,
												groupDelimiter: webix.i18n.groupDelimiter,
												decimalSize: webix.i18n.decimalSize,
												decimalDelimiter: webix.i18n.decimalDelimiter
											});
										},
										editFormat: function (value) {
											return webix.i18n.numberFormat(value);
										}
									},
									{
										id: "koef", header: _("koef"),
										adjust: true, editor: "text", format: function (value) {
											return webix.i18n.numberFormat(value);
										},
										editParse: function (value) {
											return webix.Number.parse(value, {
												groupSize: webix.i18n.groupSize,
												groupDelimiter: webix.i18n.groupDelimiter,
												decimalSize: webix.i18n.decimalSize,
												decimalDelimiter: webix.i18n.decimalDelimiter
											});
										},
										editFormat: function (value) {
											return webix.i18n.numberFormat(value);
										}
									},
									{
										id: "weightKG", header: _("weightKG"),
										adjust: true, editor: "text", format: function (value) {
											return webix.i18n.numberFormat(value);
										},
										editParse: function (value) {
											return webix.Number.parse(value, {
												groupSize: webix.i18n.groupSize,
												groupDelimiter: webix.i18n.groupDelimiter,
												decimalSize: webix.i18n.decimalSize,
												decimalDelimiter: webix.i18n.decimalDelimiter
											});
										},
										editFormat: function (value) {
											return webix.i18n.numberFormat(value);
										}
									},
									{
										id: "percent_weight", header: _("%"),
										adjust: true, editor: "text", format: function (value) {
											return webix.i18n.numberFormat(value);
										},
										editParse: function (value) {
											return webix.Number.parse(value, {
												groupSize: webix.i18n.groupSize,
												groupDelimiter: webix.i18n.groupDelimiter,
												decimalSize: webix.i18n.decimalSize,
												decimalDelimiter: webix.i18n.decimalDelimiter
											});
										},
										editFormat: function (value) {
											return webix.i18n.numberFormat(value);
										}
									}],
							},
							{width: 20},
						]
					},
					{
						cols: [
							{width: 20},
							{
								view: "datatable",
								id: "loco_table",
								data: [{
									id: _("locomotive"),
									loco_position: _("forward"),
									axials_count: 1,
									center_distance: 0,
									truck_distance: 0
								}],
								editable: true,
								minWidth: 750,
								height: 110,
								resizeColumn: {headerOnly: true},
								select: "row",
								navigation: true,
								hover: "myhover",
								columns: [
									{id: "id", header: _("locomotive"), adjust: true, fillspace: true},
									{
										id: "loco_position", header: _("loco_position"), adjust: true,
										editor: "select", options: loco_positopn
									},
									{
										id: "axials_count", header: _("axials_count"),
										adjust: true, editor: "combo", collection: axials_count
									},
									{
										id: "center_distance", header: _("center_distance"),
										width: 200, editor: "text", format: function (value) {
											return webix.i18n.numberFormat(value);
										},
										editParse: function (value) {
											return webix.Number.parse(value, {
												groupSize: webix.i18n.groupSize,
												groupDelimiter: webix.i18n.groupDelimiter,
												decimalSize: webix.i18n.decimalSize,
												decimalDelimiter: webix.i18n.decimalDelimiter
											});
										},
										editFormat: function (value) {
											return webix.i18n.numberFormat(value);
										}
									},
									{
										id: "truck_distance", header: _("truck_distance"),
										adjust: true, editor: "text", format: function (value) {
											return webix.i18n.numberFormat(value);
										},
										editParse: function (value) {
											return webix.Number.parse(value, {
												groupSize: webix.i18n.groupSize,
												groupDelimiter: webix.i18n.groupDelimiter,
												decimalSize: webix.i18n.decimalSize,
												decimalDelimiter: webix.i18n.decimalDelimiter
											});
										},
										editFormat: function (value) {
											return webix.i18n.numberFormat(value);
										}
									},
								],
								on: {
									"onItemClick": function (id, e, trg) {
										if (id.column === "save") {
											var obj = ($$("leftPlatform").getItem(id.row));
											webix.message(_("Ssaved"));
											return false; // here it blocks the default behavior
										}
									}
								}
							},
							{width: 10},
							{
								rows: [
									{
										cols: [
											{},
											{label: _("Average"), view: "label", minWidth: 60},
											{}
										]
									},
									{
										cols: [
											{label: _("Coof"), view: "label", minWidth: 20, align: "right"},
											{view: "text", minWidth: 60, height: 30, id: "avrg_coof"}
										]
									},
									{
										cols: [
											{label: _("Percent"), view: "label", minWidth: 20,	labelWidth: 40, align: "right"},
											{view: "text", minWidth: 60, height: 30, id: "avrg_percent"}
										]
									},
								]
							},
							{width: 20}
						]
					},
					{
						cols: [
							{},
							{
								view: "button",
								id: "auto_calibr_starter",
								value: _("Start"),
								css: "bt_1",
								width: 200,
								type: "form",
								click: function () {
								var _config = $$('mainTop').$scope.app.config.configuration;
								if (_config.weighing_allowed === true){
									    if (calibration){
									    	calibration = false;
									    	referenceView.app.callEvent("setExchange=nothing");
									    	$$('auto_calibr_starter').setValue(_("Start"));
									    }
									    else {
									    	calibration = true;
									    	referenceView.app.callEvent("setConnection=calibration.auto");
									    	referenceView.app.callEvent("connection");
									    	$$('auto_calibr_starter').setValue(_("Stop"));
									    }
									}
								}
							},
							{},
						]
					},
					{height: 20},
				]
			}
		};
	}

	ready(){
		var data = [
			{"id":1, "weight":0, "axials_count": 1, "center_distance":0, "truck_distance":0, "koef":0, "weightKG":0, "percent_weight":0},
			{"id":2, "weight":0, "axials_count": 1, "center_distance":0, "truck_distance":0, "koef":0, "weightKG":0, "percent_weight":0},
			{"id":3, "weight":0, "axials_count": 1, "center_distance":0, "truck_distance":0, "koef":0, "weightKG":0, "percent_weight":0},
			{"id":4, "weight":0, "axials_count": 1, "center_distance":0, "truck_distance":0, "koef":0, "weightKG":0, "percent_weight":0},
			{"id":5, "weight":0, "axials_count": 1, "center_distance":0, "truck_distance":0, "koef":0, "weightKG":0, "percent_weight":0},
		];
		$$("dyn_calibration").parse(data, "json");
		//this.app.callEvent("setExchange=nothing");
	}
}
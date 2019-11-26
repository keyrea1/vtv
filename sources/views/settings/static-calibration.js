import {JetView} from "webix-jet";

export default class StaticCalibration extends JetView {
	config() {
		const _ = this.app.getService("locale")._;
		const theme = this.app.config.theme;
		const ip = this.app.config.remoteHOST;
		const ids = this.app.config.ids;
		const configuration = this.app.config.configuration;
		const referenceView = this;
		const User = this.app.config.user;

		var win1_upload = "win03calibration" + ids.win1;
		ids.win1 = ids.win1 + 1;
		newv => this.app.config.ids = ids;

		var number = [1, 2, 3, 4, 5, 6, 7, 8];
		var discrete = [
			{id: 10, value: 10},
			{id: 20, value: 20},
			{id: 50, value: 50},
			{id: 100, value: 100}
		];

		function getCalibrationPoints () {
			var _methodName = "getCalibrationPoints";
			webix.ajax().post(
				ip, {"method": _methodName, "user": User, "params": []},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							var params = data.params;
							$$("leftPlatform").clearAll();
							$$("leftPlatform").parse(params["1"]);
							$$("rightPlatform").clearAll();
							$$("rightPlatform").parse(params["2"]);
						}
						else webix.message({type: "error", text: _(data.params.message)});
					}
				});
		}

		function getKleimo () {
			var _methodName = "getKleimo";
			webix.ajax().post(
				ip, {"method": _methodName, "user": User, "params": []},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							$$("kleimo").setValue(data.params);
						}
						else webix.message({type: "error", text: _(data.params.message)});
					}
				});
		}

		function setKleimo (kleimo) {
			var _methodName = "setKleimo";
			webix.ajax().post(
				ip, {"method": _methodName, "user": User, "params": [kleimo]},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							$$("kleimo").setValue(kleimo);
							webix.message({type: "info", text: _(data.params.message)});
						}
						else webix.message({type: "error", text: _(data.params.message)});
					}
				});
		}

		function getCalibrationParams () {
			var _methodName = "getCalibrationParams";
			webix.ajax().post(
				ip, {"method": "getCalibrationParams", "user": User, "params": []},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							$$("discrete").setValue(data.params.discrete);
							$$("discrete2").setValue(data.params.discrete2);
							$$("discrete_threshold").setValue(data.params.discrete_threshold);
							$$("brb").setValue(data.params.BRB);
							$$("brw").setValue(data.params.BRW);
							$$("brh").setValue(data.params.BRH);
							$$("adcData1").parse(data.params.adcData1, "json");
							$$("adcData2").parse(data.params.adcData2, "json");
						}
						else {
							webix.message({type: "error", text: _(data.params.message)});
						}
					}
				});
		}

		function setZero1 () {
			var _methodName = "setZero1";
			webix.ajax().post(
				ip, {"method": "setZero", "user": User, "params": {"truck": [1]}},
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

		function setZero2 () {
			var _methodName = "setZero2";
			webix.ajax().post(
				ip, {"method": "setZero", "user": User, "params": {"truck": [2]}},
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

		function getCalibrationPointsLeft () {
			var _methodName = "getCalibrationPoints";
			webix.ajax().post(
				ip, {"method": "getCalibrationPoints", "user": User, "params": []},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							var params = data.params;
							$$("leftPlatform").clearAll();
							$$("leftPlatform").parse(params["1"]);
						}
						else {
							webix.message({
								type: "error",
								text: _("Error while weighing. Standby")
							});
						}
					}
				});
		}

		function delCalibrationPointsLeft (obj) {
			var _methodName = "delCalibrationPoints";
			webix.ajax().post(
				ip, {"method": _methodName, "user": User, "params": {1: obj.weight}},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							$$("leftPlatform").remove(obj.id);
							webix.message({type: "success", text: _(data.params.message)});
						}
						else webix.message({type: "error", text: _(data.params.message)});
					}
					else webix.message({type: "error", text: _(data.params.message)});
				});
		}

		function setCalibrationPointsLeft (obj, _id) {
			var _methodName = "setCalibrationPoints";
			webix.ajax().post(
				ip, {"method": _methodName, "user": User, "params": {1: parseInt(obj.weight)}},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							webix.message({type: "success", text: _(data.params.message)});
							obj.save = 1;
							$$("leftPlatform").updateItem(_id, obj);
						}
						else webix.message({type: "error", text: _(data.params.message)});
					}
					else webix.message({type: "error", text: _(data.params.message)});
				});
		}

		function delCalibrationPointsRight (obj) {
			var _methodName = "delCalibrationPoints";
			webix.ajax().post(ip, {"method": _methodName, "user": User, "params": {2: obj.weight}},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							$$("rightPlatform").remove(obj.id);
							webix.message({type: "success", text: _(data.params.message)});
						}
						else webix.message({type: "error", text: _(data.params.message)});
					}
					else webix.message({type: "error", text: _(data.params.message)});

				});
		}

		function getCalibrationPointsRight () {
			var _methodName = "getCalibrationPoints";
			webix.ajax().post(
				ip, {"method": "getCalibrationPoints", "user": User, "params": []},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							var params = data.params;
							$$("rightPlatform").clearAll();
							$$("rightPlatform").parse(params["2"]);
						}
						else {
							webix.message({
								type: "error",
								text: _("Error while weighing. Standby")
							});
						}
					}
				});
		}

		function setCalibrationPointsRight (obj, _id) {
			var _methodName = "setCalibrationPoints";
			webix.ajax().post(
				ip, {"method": _methodName, "user": User, "params": {2: parseInt(obj.weight)}},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							webix.message({type: "success", text: _(data.params.message)});
							obj.save = 1;
							$$("rightPlatform").updateItem(_id, obj);
						}
						else webix.message({type: "error", text: _(data.params.message)});
					}
					else webix.message({type: "error", text: _(data.params.message)});
				});
		}

		function setCalibrationParams () {
			var _methodName = "setCalibrationParams";
			var adcData1 = [];
			$$("adcData1").eachRow(function (row) {
				const record = $$("adcData1").getItem(row);
				// { id:row, title:"Film", year:2019 }
				adcData1.push({"id": record.id, "number": record.number, "inversion": record.inversion});
			});

			var adcData2 = [];
			$$("adcData2").eachRow(function (row) {
				const record = $$("adcData2").getItem(row);
				// { id:row, title:"Film", year:2019 }
				adcData2.push({"id": record.id, "number": record.number, "inversion": record.inversion});
			});
			webix.ajax().post(
				ip,
				{
					"method": "setCalibrationParams", "user": User,
					"params": {
						"discrete": $$("discrete").getValue(),
						"discrete2": $$("discrete2").getValue(),
						"discrete_threshold": $$("discrete_threshold").getValue(),
						"BRH": $$("brh").getValue(),
						"BRB": $$("brb").getValue(),
						"BRW": $$("brw").getValue(),
						"adcData1": adcData1,
						"adcData2": adcData2
					}
				},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							var params = data.params;
							webix.message({type: "success", text: _(data.params.message)});
							var kleimo = Math.random() * 99999999;
							kleimo = Math.floor(kleimo) + "";
							if (User !== 3) setKleimo(kleimo);
							else $$("kleimo").setValue(kleimo);
						}
						else webix.message({type: "error", text: _(data.params.message)});
					}
					else webix.message({type: "error", text: _(data.params.message)});
				});
		}

		function saveCalibration (name) {
			var _methodName = "saveCalibration";
			webix.ajax().post(ip, {"method": _methodName, "user": User, "params": {"name": name}},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							webix.message({type: "info", text: _("Saved to ") + _(data.params.message)});
						}
						else {
							webix.message({
								type: "error",
								text: _(data.params.message)
							});
						}
					}
					else {
						webix.message({
							type: "error",
							text: _(data.params.message)
						});
					}
				});
		}

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
						click: function () { $$(win1_upload).hide(); }
					},
				]
			},
			body: {
				rows: [
					{
						view: "form", scroll: false, width: 320, elements: [
							{
								label: _("Filename"), labelWidth: 100, view: "text", minWidth: 60, height: 30, name: "log_filename",
							},
							{
								view: "button", type: "form", value: _("Save data"), click: function () {
									var name = this.getParentView().getValues().log_filename;
									saveCalibration(name);
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

		return {
			view: "scrollview", id: "static-calibration", scroll: "y", body: {
				view: "form", elementsConfig: {labelPosition: "top"},
				rules: {
					$all: webix.rules.isNotEmpty
				},
				elements: [
					{
						cols: [
							{
								rows: [
									{
										cols: [
											{template: "", minWidth: 40},
											{label: _("leftPlatform"), view: "label", minWidth: 190},
											{view: "text", minWidth: 80, id: "_leftweigth", readonly:true},
											{template: "", minWidth: 40}
										]
									},
									{
										view: "d3-chart", resize: true, url: "data/flare.json", minHeight: 300,
										ready: function () {

											var margin = {top: 10, right: 10, bottom: 10, left: 10},
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
												.attr("cx", 0.5)
												.attr("cy", 0.5)
												.attr("r", 2.5);

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
												.attr("cy", height);

											var timer = setInterval(function () {
												circle.attr("cx", x($$("_x1").getValue())).attr("cy", y($$("_y1").getValue()));
											}, 40);
											referenceView.app.attachEvent("chart1StaticCalibrationUpdateStop", function () {
												clearInterval(timer);
											});
										}
									}]
							},
							{
								rows: [
									{
										cols: [
											{template: "", minWidth: 40},
											{label: _("Weight"), view: "label", width: 50},
											{view: "text", minWidth: 70, height: 30, id: "_weigth", readonly:true},
											{template: "", minWidth: 40}
										]
									},
									{
										view: "d3-chart", resize: true, url: "data/flare.json",
										ready: function () {
											var margin = {top: 10, right: 10, bottom: 10, left: 10},
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
												.attr("cy", height);

											var timer = setInterval(function () {
												circle.attr("cx", x($$("__x").getValue())).attr("cy", y($$("__y").getValue()));
											}, 40);
											referenceView.app.attachEvent("chart2StaticCalibrationUpdateStop", function () {
												clearInterval(timer);
											});
										}
									}]
							},
							{
								rows: [
									{
										cols: [
											{minWidth: 40},
											{label: _("rightPlatform"), view: "label", minWidth: 200},
											{view: "text", minWidth: 80, id: "_rightweigth", readonly:true},
											{minWidth: 40}
										]
									},
									{
										view: "d3-chart", resize: true, url: "data/flare.json",
										ready: function () {

											var margin = {top: 10, right: 10, bottom: 10, left: 10},
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
												.attr("cy", height);

											var timer = setInterval(function () {
												circle.attr("cx", x($$("_x2").getValue())).attr("cy", y($$("_y2").getValue()));
											}, 40);
											referenceView.app.attachEvent("chart3StaticCalibrationUpdateStop", function () {
												clearInterval(timer);
											});
										}
									}]
							},
						]
					},
					{
						cols: [
							{},
							{
								rows: [
									{
										view: "button",
										value: _("Set zero weights"),
										autowidth: true,
										height: 50,
										type: "form",
										click: function () {
											setZero1();
										}
									},
									{},
									{
										view: "button", value: _("Add"), tooltip: _("Add calibration point"),
										autowidth: true,
										click: function () {
											var _i = 1;
											var lastItemI;
											var ids = ($$("leftPlatform").collectValues("id"));
											ids.forEach(function (item, i, arr) {
												lastItemI = item["value"];
												if (_i <= lastItemI) {
													_i = lastItemI + 1;
												}
											});
											var _id = _i + 1;
											$$("leftPlatform").add({id: _id, weight: 0});
										}
									},
								]
							},
							{width: 10},
							{
								view: "datatable",
								id: "leftPlatform",
								editable: true,
								scroll: "y",
								height: 270,
								width: 178,
								resizeColumn: {headerOnly: true},
								select: "row",
								navigation: true,
								hover: "myhover",
								columns: [
									{
										id: "del", header: "", width: 40,
										template: function (obj) {
											return "<div class='del_element'></div>";
										}
									},
									{id: "id", header: "#", width: 40, sort: "int", hidden: true},
									{
										id: "weight", header: _("weight"), width: 74,
										editor: "text", format: function (value) {
											return webix.i18n.intFormat(value);
										},
										editFormat: function (value) {
											return webix.i18n.intFormat(value);
										}
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
									}],
								on: {
									"onItemClick": function (id, e, trg) {
										var _i = 1;
										var elements = 0;
										var lastItemI;
										var ids = ($$("leftPlatform").collectValues("id"));

										ids.forEach(function (item, i, arr) {
											elements += 1;
											lastItemI = item["value"];
											if (_i < lastItemI) {
												_i = lastItemI + 1;
											}
										});

										if (id.column === "save") {
											$$("leftPlatform").editStop();
											var obj = ($$("leftPlatform").getItem(id.row));
											var flag = true;
											$$("leftPlatform").eachRow(function (row) {
												const record = $$("leftPlatform").getItem(row);
												console.log(record);
												if (parseInt(obj.weight) === parseInt(record.weight) && record.id !== obj.id && record.save === 1) {
													flag = false;
												}
											});
											if (elements > 1) {
												if (obj.save !== 1) {
													if (flag) {
														setCalibrationPointsLeft(obj, id.row);
													}
													else {
														webix.message({type: "error", text: _("Calibration point already exists")});
													}
												}
											}
											else if (obj.save !== 1) {
												setCalibrationPointsLeft(obj, id.row);
											}
										}
										else if (id.column === "del") {
											var _obj = $$("leftPlatform").getItem(id.row);
											delCalibrationPointsLeft(_obj);
											getCalibrationPointsLeft();
											return false; // here it blocks the default behavior
										}
									}
								}
							},
							{width: 5},
							{
								view: "datatable",
								id: "adcData1",
								editable: true,
								scroll: false,
								height: 270,
								width: 270,
								select: "row",
								navigation: true,
								hover: "myhover",
								columns: [
									{
										id: "id", header: "", width: 30,
									},
									{
										id: "raw", header: _("raw"), width: 70,
										editor: "text"
									},
									{
										id: "offset", header: _("offset"), width: 60,
										editor: "text"
									},
									{
										id: "number", header: _("number"), width: 60,
										editor: "combo", collection: number
									},
									{
										id: "inv", header: _("inversion"), css: "status", width: 50,
										template: data => {
											let icon = "";
											if (data.inversion === true) {
												icon = "refresh-arrow";
											}
											else {
												icon = "straight-arrow";
											}
											return `<span class='webix_icon wxi wxi-${icon}'></span>`;
										}
									}
								],
								on: {
									"onItemClick": function (id, e, trg) {
										if (id.column === "inv") {
											$$("adcData1").editStop();
											var obj = ($$("adcData1").getItem(id.row));
											if (obj.inversion === true) obj.inversion = false;
											else obj.inversion = true;
											$$("adcData1").updateItem(id, obj);
										}
									}
								}
							},
							{
								view: "datatable",
								id: "adcData2",
								editable: true,
								scroll: false,
								height: 270,
								width: 270,
								select: "row",
								navigation: true,
								hover: "myhover",
								columns: [
									{
										id: "id", header: "", width: 30,
										adjust: true
									},
									{
										id: "raw", header: _("raw"), width: 70,
										editor: "text"
									},
									{
										id: "offset", header: _("offset"), width: 60,
										editor: "text",
									},
									{
										id: "number", header: _("number"), width: 60,
										editor: "combo", collection: number
									},
									{
										id: "inv", header: _("inversion"), css: "status", width: 50,
										template: data => {
											let icon = "";
											if (data.inversion === true) {
												icon = "refresh-arrow";
											}
											else {
												icon = "straight-arrow";
											}
											return `<span class='webix_icon wxi wxi-${icon}'></span>`;
										}
									}
								],
								on: {
									"onItemClick": function (id, e, trg) {
										if (id.column === "inv") {
											$$("adcData2").editStop();
											var obj = ($$("adcData2").getItem(id.row));
											if (obj.inversion === true) obj.inversion = false;
											else obj.inversion = true;
											$$("adcData2").updateItem(id, obj);
										}
									}
								}
							},
							{width: 5},
							{
								view: "datatable",
								id: "rightPlatform",
								editable: true,
								scroll: "y",
								height: 270,
								width: 178,
								resizeColumn: {headerOnly: true},
								select: "row",
								navigation: true,
								hover: "myhover",
								columns: [
									{
										id: "del", header: "", width: 40,
										template: function (obj) {
											return "<div class='del_element'></div>";
										}
									},
									{id: "id", header: "#", width: 40, sort: "int", hidden: true},
									{
										id: "weight", header: _("weight"), width: 74,
										editor: "text", format: function (value) {
											return webix.i18n.intFormat(value);
										},
										editFormat: function (value) {
											return webix.i18n.intFormat(value);
										}
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
									}],
								on: {
									"onItemClick": function (id, e, trg) {
										var _i = 1;
										var elements = 0;
										var lastItemI;
										var ids = ($$("rightPlatform").collectValues("id"));

										ids.forEach(function (item, i, arr) {
											elements += 1;
											lastItemI = item["value"];
											if (_i < lastItemI) {
												_i = lastItemI + 1;
											}
										});

										if (id.column === "save") {
											$$("rightPlatform").editStop();
											var obj = ($$("rightPlatform").getItem(id.row));
											var flag = true;
											$$("rightPlatform").eachRow(function (row) {
												const record = $$("rightPlatform").getItem(row);
												if (parseInt(obj.weight) === parseInt(record.weight) && record.id !== obj.id && record.save === 1) {
													flag = false;
												}
											});
											if (elements > 1) {
												if (obj.save !== 1) {
													if (flag) {
														setCalibrationPointsRight(obj, id.row);
													}
													else {
														webix.message({type: "error", text: _("Calibration point already exists")});
													}
												}
											}
											else if (obj.save !== 1) {
												setCalibrationPointsRight(obj, id.row);
											}
										}
										else if (id.column === "del") {
											var obj = $$("rightPlatform").getItem(id.row);
											delCalibrationPointsRight(obj);
											getCalibrationPointsRight();
											return false; // here it blocks the default behavior
										}
									}
								}
							},
							{width: 10},
							{
								rows: [
									{
										view: "button",
										value: _("Set zero weights"),
										autowidth: true,
										height: 50,
										type: "form",
										click: function () {
											setZero2();
										}
									},
									{},
									{
										view: "button", value: _("Add"), tooltip: _("Add calibration point"),
										autowidth: true,
										click: function () {
											var _i = 1;
											var lastItemI;
											var ids = ($$("rightPlatform").collectValues("id"));
											ids.forEach(function (item, i, arr) {
												lastItemI = item["value"];
												if (_i <= lastItemI) {
													_i = lastItemI + 1;
												}
											});
											var _id = _i + 1;
											$$("rightPlatform").add({id: _id, weight: 0});
										}
									},
								]
							},
							{}
						]
					},
					{
						cols: [
							{},
							{
								rows:
									[
										{label: _("BRB"), view: "label", minWidth: 100},
										{
											cols: [
												{
													id: "brb",
													name: "brb",
													min: 0,
													max: 15000,
													view: "slider",
													width: 200,
													value: configuration["brb"],
													on: {
														"onAfterRender": function () {
															$$("_brb").bind($$("brb"));
														},
														"onSliderDrag": function () {
															var new_value = this.getValue();
															$$("_brb").setValue(new_value);
															configuration["brb"] = new_value;
														}
													}
												},
												{
													id: "_brb", view: "text", minWidth: 80, height: 20,
													on: {
														"onChange": function (new_value, oldv) {
															$$("brb").setValue(new_value);
															configuration["brb"] = new_value;
														}
													}
												},
												{label: _("mm"), view: "label", minWidth: 30}]
										}
									]
							},
							{},
							{
								rows:
									[
										{label: _("BRH"), view: "label", width: 90},
										{
											cols: [
												{
													id: "brh",
													name: "brh",
													min: 0,
													max: 6000,
													view: "slider",
													minWidth: 200,
													value: configuration["brh"],
													on: {
														"onAfterRender": function () {
															$$("_brh").bind($$("brh"));
														},
														"onSliderDrag": function () {
															var new_value = this.getValue();
															$$("_brh").setValue(new_value);
															configuration["brh"] = new_value;
														}
													}
												},
												{
													id: "_brh", view: "text", minWidth: 80, height: 30,
													on: {
														"onChange": function (new_value, oldv) {
															$$("brh").setValue(new_value);
															configuration["brh"] = new_value;
														}
													}
												},
												{label: _("mm"), view: "label", minWidth: 30}]
										}
									]
							},
							{},
							{
								rows:
									[
										{label: _("BRW"), view: "label", width: 90},
										{
											cols: [
												{
													id: "brw",
													name: "brw",
													min: 0,
													max: 10000,
													view: "slider",
													minWidth: 200,
													value: configuration["brw"],
													on: {
														"onAfterRender": function () {
															$$("_brw").bind($$("brw"));
														},
														"onSliderDrag": function () {
															var new_value = this.getValue();
															$$("_brw").setValue(new_value);
															configuration["brw"] = new_value;
														}
													}
												},
												{
													id: "_brw", view: "text", minWidth: 80, height: 30,
													on: {
														"onChange": function (new_value, oldv) {
															$$("brw").setValue(new_value);
															configuration["brw"] = new_value;
														}
													}
												},
												{label: _("mm"), view: "label", minWidth: 30}]
										}
									]
							},
							{}
						]
					},
					{},
					{
						cols: [
							{},
							{
								view: "select", width: 100,
								label: _('Discrete'), name:"Discrete", labelAlign: "left", id: "discrete",
								value: 1, options: discrete
							},
							{width: 20},
							{label: _("Discrete threshold"), view: "label", width: 140},
							{id: "discrete_threshold", name:"discrete_threshold", view: "text", width: 110, height: 30, value: 10},
							{width: 20},
							{
								view: "select", width: 120,
								label: _('Discrete2'), name:"Discrete2", labelAlign: "left", id: "discrete2",
								value: 1, options: discrete
							},
							{}
						]
					},
					{
						cols: [
							{},
							{view: "label", width: 100, label: _("Kleimo"), labelAlign: "left"},
							{view: "text", id: "kleimo", width: 120, value: "", labelAlign: "left", readonly: 0}
						]
					},
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
							{
								id: "uploadAPI",
								hidden: false,
								minWidth: 300,
								value: _("Load configuration file"),
								view: "uploader",
								upload: ip + '/upload/calibration',
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
										webix.message(_("Upload successful"));
										getCalibrationParams();
										getCalibrationPoints();
									}
								}
							},
							{},
							{},
							{
								view: "button",
								type: "image",
								label: _("Save to file"),
								autowidth: true,
								image: "sources/styles/download.svg",
								popup: upload
							},
							{
								view: "button", value: _("Save"),
								autowidth: true, type: "form",
								click: function () {
									setCalibrationParams();
								}
							}
						]
					},
					{
						view: "text",
						minWidth: 80,
						height: 30,
						id: "__x",
						hidden: true,
						value: 0,
					},
					{
						view: "text",
						minWidth: 80,
						height: 30,
						id: "__y",
						hidden: true,
						value: 0,
					},
					{
						view: "text",
						minWidth: 80,
						height: 30,
						id: "_x1",
						hidden: true,
						value: 0,
					},
					{
						view: "text",
						minWidth: 80,
						height: 30,
						id: "_y1",
						hidden: true,
						value: 0,
					},
					{
						view: "text",
						minWidth: 80,
						height: 30,
						id: "_x2",
						hidden: true,
						value: 0,
					},
					{
						view: "text",
						minWidth: 80,
						height: 30,
						id: "_y2",
						hidden: true,
						value: 0,
					}
				]
			}

		};
	}

	init() {
		this._defaults = {
		    brw:1520,
            brh:4110,
            brb:8904,
            Discrete:10,
            Discrete2:10,
            discrete_threshold:1000,
			lang: "en",

			update_speed: 5,

		};
	}

	ready() {
		const _ = this.app.getService("locale")._;
		const ip = this.app.config.remoteHOST;
		const User = this.app.config.user;

		function getCalibrationPoints() {
			var _methodName = "getCalibrationPoints";
			webix.ajax().post(
				ip, {"method": "getCalibrationPoints", "user": User, "params": []},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							var params = data.params;
							$$("leftPlatform").parse(params["1"]);
							$$("rightPlatform").parse(params["2"]);
						}
						else webix.message({type: "error", text: _(data.params.message)});
					}
				});
		}

		function getCalibrationParams() {
			var _methodName = "getCalibrationParams";
			webix.ajax().post(
				ip, {"method": "getCalibrationParams", "user": User, "params": []},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							$$("discrete").setValue(data.params.discrete);
							$$("discrete2").setValue(data.params.discrete2);
							$$("discrete_threshold").setValue(data.params.discrete_threshold);
							$$("brb").setValue(data.params.BRB);
							$$("brw").setValue(data.params.BRW);
							$$("brh").setValue(data.params.BRH);
							$$("adcData1").parse(data.params.adcData1, "json");
							$$("adcData2").parse(data.params.adcData2, "json");
						}
						else {
							webix.message({type: "error", text: _(data.params.message)});
						}
					}
				});
		}

		function getKleimo() {
			var _methodName = "getKleimo";
			webix.ajax().post(
				ip, {"method": _methodName, "user": User, "params": []},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							$$("kleimo").setValue(data.params);
						}
						else if(data.params === "No kleimo") webix.message({type: "info", text: _(data.params)});
						else webix.message({type: "error", text: _(data.params.message)});
					}
				});
		}

		getKleimo();
		this.app.callEvent("setExchange=nothing");
		this.app.callEvent("setConnection=calibration.static");
		this.app.callEvent("connection");
		getCalibrationPoints();
		getCalibrationParams();
	}
}
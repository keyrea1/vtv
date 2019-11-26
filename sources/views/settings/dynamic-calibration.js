import {JetView} from "webix-jet";

export default class DynamicCalibration extends JetView {
	config () {
		const _ = this.app.getService("locale")._;
		const lang = this.app.getService("locale").getLang();
		const theme = this.app.config.theme;
		const ip = this.app.config.remoteHOST;
		const configuration = this.app.config.configuration;
		const User = this.app.config.user;
		const referenceView = this;

		//datatable vars
		var axials_count = [1, 2, 3, 4, 5, 6, 7, 8];
		var loco_positopn = [_("forward"), _("backward")];

		//chart vars
		var chart = {};
		var series;
		var series2;
		var series3;

		var calibration = false;

		referenceView.app.attachEvent('chartCalibrationDynamicUpdate', function () {
			if (calibration) {
				var _methodName = 'getCharts';
				webix.ajax().post(
					ip, {'method': _methodName, 'user': User, 'params': []},
					function (text, xml, xhr) {
						var data = JSON.parse(text);
						if (data.method === _methodName) {
							if (data.answer === 'ok') {
								if (data.params.chart1 !== null) {
									var i = 0;
									for (i; i < data.params.chart1.length; i += 1) {
										chart.series[0].addPoint(data.params.chart1[i], false)
									}
								}
								if (data.params.chart2 !== null) {
									i = 0;
									for (i; i < data.params.chart2.length; i += 1) {
										chart.series[1].addPoint(data.params.chart2[i], false)
									}
								}
								if (data.params.chart3) {
									i = 0;
									for (i; i < data.params.chart3.length; i += 1) {
										chart.series[2].addPoint(data.params.chart3[i], false)
									}
								}
								chart.redraw();
							} else {
								webix.message({
									type: 'error',
									text: _(data.params.message)
								})
							}
						} else {
							webix.message({
								type: 'error',
								text: _(data.params.message)
							})
						}
					})
			}
		});

		referenceView.app.attachEvent('chartCalibrationDynamicEnable', function () {
			calibration = true;
		});

		referenceView.app.attachEvent('chartCalibrationDynamicDisable', function () {
			calibration = false;
		});

		referenceView.app.attachEvent('chartCalibrationDynamicClear', function () {
			try {
				chart.series[3].remove(true);
				chart.series[2].remove(true);
				chart.series[1].remove(true);
				chart.series[0].remove(true);
				chart = {};
			}
			catch (e) {
				console.log(e)
			}

		});

		function setConfiguration (platform, speedthreshold, zerothreshold, calming) {
			var _methodName = "setConfigurationDynamic";
			webix.ajax().post(
				ip,
				{
					"method": _methodName, "user": User,
					params: {
						"platform": platform,
						"speedthreshold": speedthreshold,
						"zerothreshold": zerothreshold,
						"calming": calming
					}
				},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							webix.message({
								type: "default",
								text: _(data.params.message)
							});
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

		function setZero () {
			var _methodName = "setZero";
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

		return {
			view: "scrollview", scroll: "y", hidden: true, id: "dynamic-calibration", body: {
				rows: [
					{
						cols: [
							{width: 20},
							{height: 400, template: "<div id='section3' style='height: 400px; min-width: 310px'></div>"},
							{
								view: "text", minWidth: 60, height: 30, id: "_xx1", hidden: true, value: 0
							},
							{
								view: "text", minWidth: 60, height: 30, id: "_xx2", hidden: true, value: 0
							},
							{
								view: "text", minWidth: 60, height: 30, id: "_xx3", hidden: true, value: 0
							},
							{
								view: "text", minWidth: 60, height: 30, id: "_yy1", hidden: true, value: 0
							},
							{
								view: "text", minWidth: 60, height: 30, id: "_yy2", hidden: true, value: 0
							},
							{
								view: "text", minWidth: 60, height: 30, id: "_yy3", hidden: true, value: 0
							},
							{width: 20}
						]
					},
					{
						cols: [
							{width: 20},
							{
								view: "button",
								value: _("Set zero weights"),
								autowidth: true,
								type: "form",
								click: function () {
									setZero();
								}
							},
							{},
							{
								cols: [
									{label: _("Speed"), view: "label", width: 200, align: "right", css: {"font-size": "20pt !important"}},
									{view: "text", width: 60, height: 30, id: "__speed", value: "0"},
									{},
									{
										hidden: true,
										label: _("Axials"),
										view: "label",
										width: 200,
										align: "right",
										css: {"font-size": "20pt !important"}
									},
									{hidden: true, view: "text", width: 60, height: 30, id: "__axials", value: "0"},
									{}
								]
							},
							{},
							{width: 20}
						]
					},
					{
						cols: [
							{},
							{
								view: "button",
								id: "dynamic_calibr_starter",
								value: _("Start"),
								css: "bt_1",
								width: 200,
								type: "form",
								click: function () {
									var mode = $$('dynamic_calibr_starter').getValue();
									const config = $$('mainTop').$scope.app.config.configuration;
									if (config.weighing_allowed) {
										if (mode === _("Start")) {
											webix.delay(() => {
												chart = Highcharts.stockChart('section3', {
													yAxis: {
														minorTickInterval: "auto"
													},
													//legend: {
													//	enabled: true,
													//	align: 'right',
													//	backgroundColor: '#FCFFC5',
													//	borderColor: 'black',
													//	borderWidth: 2,
													//	layout: 'vertical',
													//	verticalAlign: 'top',
													//	y: 100,
													//	shadow: true
														//},
													chart: {
														//marginRight: 180,
														animation: false
													},

													boost: {
														useGPUTranslations: true
													},

													rangeSelector: {
														buttons: [{
															count: 1,
															type: 'minute',
															text: '1M'
														}, {
															count: 5,
															type: 'minute',
															text: '5M'
														}, {
															type: 'all',
															text: 'All'
														}],
														inputEnabled: false,
														selected: 0
													},

													exporting: {
														enabled: true
													},

													series: [
														{
															name: _('Weight unfiltered'),
															dataGrouping: {
																enabled: false
															}
														},
														{
															name: _('Weight acceleration (/10)'),
															dataGrouping: {
																enabled: false
															}
														},
														{
															name: _('Filtered weight'),
															dataGrouping: {
																enabled: false
															}
														}]
												})
											});
											$$("mode").disable();
											$$("switcher").disable();
											referenceView.app.callEvent("chartCalibrationDynamicEnable");
											referenceView.app.callEvent("setConnection=calibration.dynamic");
											referenceView.app.callEvent("connection");
											referenceView.app.callEvent("currentView=calibration_dynamic");
											$$('dynamic_calibr_starter').disable();
											setTimeout(function() { $$('dynamic_calibr_starter').enable(); }, 2000);
										}
										else if (mode === _("In progress")) {
											referenceView.app.callEvent("chartCalibrationDynamicDisable");
											$$('dynamic_calibr_starter').setValue(_("Stop calibration"));
											referenceView.app.callEvent("setExchange=nothing");
											$$('dynamic_calibr_starter').disable();
											setTimeout(function() { $$('dynamic_calibr_starter').enable(); }, 2000);
										}
										else {
											$$("mode").enable();
											$$("switcher").enable();
											referenceView.app.callEvent("chartCalibrationDynamicClear");
											referenceView.app.callEvent("currentView=calibration");
											$$('dynamic_calibr_starter').setValue(_("Start"));
											$$('dynamic_calibr_starter').disable();
											setTimeout(function() { $$('dynamic_calibr_starter').enable(); }, 2000);
										}
									}
									else webix.message({
										type: "error",
										text: _("Weighing is not allowed")
									});
								}
							},
							{},
						]
					},
					{
						rows: [
							{
								hidden: true, cols: [
									{width: 20},
									{
										rows:
											[
												{
													label: _("Speed threshold"),
													view: "label",
													minWidth: 20,
													gravity: 3
												},
												{
													cols:
														[
															{
																name: 'dynamics_speedthreshold',
																min: 0,
																max: 200,
																view: "slider",
																minWidth: 200,
																gravity: 3,
																value: configuration['dynamics']['speedthreshold'],
																step: 5,
																id: "speedthreshold",
																on: {
																	"onAfterRender": function () {
																		$$("_speedthreshold").bind($$("speedthreshold"));
																	},
																	"onSliderDrag": function () {
																		var new_value = this.getValue();
																		$$("_speedthreshold").setValue(new_value);
																		configuration['dynamics']['speedthreshold'] = new_value;
																	}
																}
															},
															{
																view: "text",
																minWidth: 60,
																height: 30,
                                                                //value: 100,
																id: "_speedthreshold",
																on: {
																	"onChange": function (new_value, oldv) {
																		$$("speedthreshold").setValue(new_value);
																		configuration['dynamics']['speedthreshold'] = new_value;
																	}
																}
															},
															{
																label: _("pts."),
																view: "label",
																minWidth: 25,
																gravity: 1
															}
														]
												},
											]
									},
									{width: 50},
									{
										rows: [{
											label: _("Zero threshold"),
											view: "label",
											minWidth: 25,
											gravity: 3
										},
											{
												cols:
													[
														{
															name: 'dynamics_zerothreshold',
															id: "zerothreshold",
															min: 0,
															max: 100,
															view: "slider",
															minWidth: 200,
															value: configuration['dynamics']['zerothreshold'],
															step: 1,
															gravity: 3,
															on: {
																"onAfterRender": function () {
																	$$("_zerothreshold").bind($$("zerothreshold"));
																},
																"onSliderDrag": function () {
																	var new_value = this.getValue();
																	$$("_zerothreshold").setValue(new_value);
																	configuration['dynamics']['zerothreshold'] = new_value;
																}
															}
														},
														{
															id: "_zerothreshold",
															view: "text",
                                                            //value: 100,
															minWidth: 60,
															height: 20,
															on: {
																"onChange": function (new_value, oldv) {
																	$$("zerothreshold").setValue(new_value);
																	configuration['dynamics']['zerothreshold'] = new_value;
																}
															}
														},
														{label: _("pts."), view: "label", minWidth: 25, gravity: 1}
													]
											}
										]
									},
									{}
								]
							},
							{
								cols: [
									{},
									{ hidden: true,
										rows:
											[
												{label: _("Calming"), view: "label", minWidth: 20, gravity: 3},
												{
													cols:
														[
															{
																name: 'dynamics_calming',
																min: 0,
																max: 200,
																view: "slider",
																minWidth: 200,
																gravity: 3,
																value: configuration['dynamics']['calming'],
																step: 5,
																id: "calming",
																on: {
																	"onAfterRender": function () {
																		$$("_calming").bind($$("calming"));
																	},
																	"onSliderDrag": function () {
																		var new_value = this.getValue();
																		$$("_calming").setValue(new_value);
																		configuration['dynamics']['calming'] = new_value;
																	}
																}
															},
															{
																view: "text",
																minWidth: 60,
																//value: 100,
																height: 30,
																id: "_calming",
																on: {
																	"onChange": function (new_value, oldv) {
																		$$("calming").setValue(new_value);
																		configuration['dynamics']['calming'] = new_value;
																	}
																}
															},
															{
																label: _("pts."),
																view: "label",
																minWidth: 25,
																gravity: 1
															}
														]
												},
											]
									},
									//{width: 50},
									{
										rows: [{label: _("Platform"), view: "label", minWidth: 20, gravity: 3},
											{
												cols:
													[
														{
															name: 'dynamics_platform',
															id: "platform",
															min: 2000,
															max: 6000,
															view: "slider",
															minWidth: 200,
															value: configuration['dynamics']['platform'],
															step: 1,
															gravity: 3,
															on: {
																"onAfterRender": function () {
																	$$("_platformd").bind($$("platform"));
																},
																"onSliderDrag": function () {
																	var new_value = this.getValue();
																	$$("_platformd").setValue(new_value);
																	configuration['dynamics']['platform'] = new_value;
																}
															}
														},
														{
															id: "_platformd",
															view: "text",
															minWidth: 60,
															height: 20,
															on: {
																"onChange": function (new_value, oldv) {
																	$$("platform").setValue(new_value);
																	configuration['dynamics']['platform'] = new_value;
																}
															}
														},
														{
															label: _("pts."),
															view: "label",
															minWidth: 25,
															gravity: 1
														}
													]
											}
										]
									},
									{},
								]
							},]
					},
					{
						cols: [
							{width: 20},
							{},
							{},
							{
								view: "button", value: _("Save"),
								autowidth: true, type: "form",
								click: function () {
									newv => this.app.config.configuration = configuration;
									var platform = $$('_platformd').getValue();
									var speedthreshold = $$('_speedthreshold').getValue();
									var zerothreshold = $$('_zerothreshold').getValue();
									var calming = $$('_calming').getValue();
									setConfiguration(platform, speedthreshold, zerothreshold, calming);
								}
							},
						]
					},
					{height: 20},
				]
			}
		};
	}

	init () {
		this.app.callEvent("setExchange=nothing");
		this._lang = this.app.getService("locale").getLang();
		const ip = this.app.config.remoteHOST;
		const _ = this.app.getService("locale")._;
		const User = this.app.config.user;

		function getDynamicConfiguration () {
			var _methodName = "getConfigurationDynamic";
			webix.ajax().post(
				ip,
				{"method": _methodName, "user": User, params: []},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method == _methodName) {
						if (data.answer === "ok") {
							$$('_platformd').setValue(data.params.platform);
							$$('_speedthreshold').setValue(data.params.speedthreshold);
							$$('_zerothreshold').setValue(data.params.zerothreshold);
							$$('_calming').setValue(data.params.calming);
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

		getDynamicConfiguration();
	}

	ready () {
		var data = [
			{
				"id": 1,
				"weight": 0,
				"axials_count": 1,
				"center_distance": 0,
				"truck_distance": 0,
				"koef": 0,
				"weightKG": 0,
				"percent_weight": 0
			},
			{
				"id": 2,
				"weight": 0,
				"axials_count": 1,
				"center_distance": 0,
				"truck_distance": 0,
				"koef": 0,
				"weightKG": 0,
				"percent_weight": 0
			},
			{
				"id": 3,
				"weight": 0,
				"axials_count": 1,
				"center_distance": 0,
				"truck_distance": 0,
				"koef": 0,
				"weightKG": 0,
				"percent_weight": 0
			},
			{
				"id": 4,
				"weight": 0,
				"axials_count": 1,
				"center_distance": 0,
				"truck_distance": 0,
				"koef": 0,
				"weightKG": 0,
				"percent_weight": 0
			},
			{
				"id": 5,
				"weight": 0,
				"axials_count": 1,
				"center_distance": 0,
				"truck_distance": 0,
				"koef": 0,
				"weightKG": 0,
				"percent_weight": 0
			},
		];
		//this.app.callEvent("setExchange=nothing");
	}
}
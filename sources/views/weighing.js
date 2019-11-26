import {JetView} from "webix-jet";
import {getLangsList} from "models/langslist";
import Static_truck from "views/weighing/static-truck";
import Static_wagon from "views/weighing/static-wagon";
import Dynamic from "views/weighing/dynamic";

export default class WeighingView extends JetView {
	config() {
		const _ = this.app.getService("locale")._;
		const theme = this.app.config.theme;
		const configuration = this.app.config.configuration;
		const weighing = this.app.config.weighing;
		const globals = this.app.config.globals._package;
		const User = this.app.config.user;
		const ip = this.app.config.remoteHOST;

		var referenceView = this;
		var switcher = true;
		var _switcher;
		let dynMode = false;
		var dynamicChartEnabled = false;

		//weighing logic
		var _static;
		var _static_type;
		var _static_name;

		//chart vars
		var chartShow = false;
		var chart = {};
		if (globals.static_wagon !== true) {
			configuration.wagon_weighing = 0;
			newv => this.app.config.configuration = configuration;
		}

		if (configuration.wagon_weighing) {
			_static = Static_wagon;
			_static_type = 2;
			_static_name = "static-wagon-view";
		} else {
			_static = Static_truck;
			_static_type = 1;
			_static_name = "static-truck-view";
		}

		weighing.static_name = _static_name;
		newv => this.app.config.weighing = weighing;

		_switcher = "static";
		switcher = false;

		referenceView.app.attachEvent('chartWeighingDynamicUpdate', function () {
			if (dynamicChartEnabled) {
				var _methodName = 'getCharts';
				webix.ajax().post(
					ip, {'method': _methodName, 'user': User, 'params': []},
					function (text, xml, xhr) {
						var data = JSON.parse(text);
						if (data.method === _methodName) {
							if (data.answer === 'ok') {
								if (dynamicChartEnabled) {
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
									if (data.params.chart3 !== null) {
										i = 0;
										for (i; i < data.params.chart3.length; i += 1) {
											chart.series[2].addPoint(data.params.chart3[i], false)
										}
									}
									chart.redraw();
								}
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

		var main2 = [
			{
				view: "toolbar", css: theme, id: "main",
				elements: [
					{view: "label", label: _("Weighing"), width: 150},
					{
						id: "switcher", view: "segmented", minWidth: 333,
						options: [
							{id: "static", value: _("static")},
							{id: "dynamic", value: _("dynamic"), hidden: !globals.dynamic},
						],
						value: _switcher,
						on: {
							onChange: function () {
								if (!switcher) {
									if (_static_name === "static-wagon-view") {
										referenceView.app.callEvent("chartStaticWagonUpdateStop");
									} else {
										referenceView.app.callEvent("chartStaticUpdateStop");
									}
									referenceView.app.callEvent("setExchange=nothing");
									referenceView.app.callEvent("setMessage=waiting");
									switcher = true;
									$$("1").show();
									$$("2").show();
									$$(_static_name).hide();
									$$("dynamic-view").show();
									weighing["statichidden"] = true;
									weighing["dynamichidden"] = false;
									weighing["current"] = 3;
									newv => this.app.config.weighing = weighing;
								} else {
									referenceView.app.callEvent("setExchange=nothing");
									if (_static_name === "static-wagon-view") {
										referenceView.app.callEvent("setConnection=static.wagon");
										referenceView.app.callEvent("chartStaticWagonUpdateStart");
									} else {
										referenceView.app.callEvent("setConnection=static.truck");
										referenceView.app.callEvent("chartStaticUpdateStart");
									}
									referenceView.app.callEvent("connection");
									switcher = false;
									$$("1").hide();
									$$("2").hide();
									$$("1").setValue(_("Start"));
									dynMode = false;
									$$(_static_name).show();
									$$("dynamic-view").hide();
									weighing["current"] = _static_type;
									weighing["dynamichidden"] = true;
									weighing["statichidden"] = false;
									newv => this.app.config.weighing = weighing;
								}
							},
							onItemClick: function () {
								console.log('onItemClick');
							}
						}
					},
					{
						view: "icon", tooltip: _("Open chart for dynamic"), id: 2,
						icon: "wxi wxi-chart", hidden: true,
						on: {
							onItemClick: function () {
								if (!chartShow) {
									referenceView.app.callEvent("currentView=dynamic_chart");
									$$("3").show();
									chartShow = !chartShow;
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
								} else {
									referenceView.app.callEvent("currentView=dynamic");
									chartShow = !chartShow;
									$$("3").hide();
									chart.series[3].remove(true);
									chart.series[2].remove(true);
									chart.series[1].remove(true);
									chart.series[0].remove(true);
								}
							}
						}
					},
					{
						id: 1, view: "button",
						value: _("Start"),
						autowidth: true,
						css: "bt_1",
						hidden: true,
						click: function () {
							if (referenceView.app.config.configuration.weighing_allowed) {
								if (dynMode) {
									$$(2).enable();
									$$("switcher").enable();
									dynamicChartEnabled = false;
									referenceView.app.callEvent("setExchange=nothing");
									referenceView.app.callEvent("setExchange=nothing");
									$$('1').setValue(_("Start"));
									dynMode = false;
									$$('1').disable();
									setTimeout(function() { $$('1').enable(); }, 2000);
								} else {
									$$(2).disable();
									$$("switcher").disable();
									dynamicChartEnabled = true;
									if (chartShow) referenceView.app.callEvent("setConnection=dynamic.chart");
									else referenceView.app.callEvent("setConnection=dynamic");
									referenceView.app.callEvent("connection");
									$$('1').setValue(_("Stop"));
									dynMode = true;
									$$('1').disable();
									setTimeout(function() { $$('1').enable(); }, 2000);
								}
							} else {
								webix.message({
									type: "error", text: _("Weighing is not allowed")
								});
							}
						}
					},
					{
						id: "dynModeActivatebtn", view: "icon", icon: "mdi mdi-check",
						tooltip: _("Activate/Deactivate Dynamic mode"), hidden: true,
						animate: {type: "flip", subtype: "vertical"},
						click: function () {
							if (switcher === false) {
								if (dynMode === true) {
									webix.message({type: "error", text: _("Dynamic mode deactivated")});
									dynMode = false;
								} else {
									webix.message({type: "success", text: _("Dynamic mode activated")});
									dynMode = true;
								}
							} else if (dynMode === true) {
								webix.message({type: "error", text: _("Dynamic mode deactivated")});
								dynMode = false;
							} else {
								webix.message({type: "debug", text: _("Switch to dynamic mode first")});
							}
						}
					},
					{width: 6}
				]
			},
			_static,
			Dynamic
		];
		return {id: "main2", type: "wide", rows: main2};
	}

	ready() {
		const ip = this.app.config.remoteHOST;
		const weighing = this.app.config.weighing;
		const configuration = this.app.config.configuration;
		var _static_name;

		if (configuration.wagon_weighing) {
			_static_name = "static-wagon-view";
		} else {
			_static_name = "static-truck-view";
		}

		function closeCalibrationWindows() {
			try {
				var lockWindowName = $$("lockWindow").getValue();
				if ($$(lockWindowName).isVisible() === true) $$(lockWindowName).destructor();
			} catch (e) {
				//console.log(e);
			}
			try {
				var warningWindowName = $$("warningWindow").getValue();
				if ($$(warningWindowName).isVisible() === true) $$(warningWindowName).destructor();
			} catch (e) {
				//console.log(e);
			}
		}

		closeCalibrationWindows();
		this.app.callEvent("setExchange=nothing");
		this.app.callEvent("connection");
		$$("1").hide();
		$$("dynamic-view").hide();
		$$(_static_name).show();
	}
}

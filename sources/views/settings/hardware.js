import {JetView} from "webix-jet";
import {getLangsList} from "models/langslist";

import "locales/webix/ru.js";

export default class HardwareView extends JetView {
	config() {
		const _ = this.app.getService("locale")._;
		const lang = this.app.getService("locale").getLang();
		const theme = this.app.config.theme;
		const configuration = this.app.config.configuration;
		const ip = this.app.config.remoteHOST;
		const ids = this.app.config.ids;
		const User = this.app.config.user;
		const globals = this.app.config.globals._package;

		var win1_upload = "win03calibration" + ids.win1;
		ids.win1 = ids.win1 + 1;
		newv => this.app.config.ids = ids;

		function getHardware() {
			var _methodName = "getHardware";
			webix.ajax().post(
				ip,
				{ "method": _methodName, "user": User, params: [] },
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							$$('wagon_weighing').setValue(!data.params.wagon_weighing);
							$$('platform_for_dynamic').setValue(data.params.platform_for_dynamic);
							$$('maximum_weight_at_zeroing').setValue(data.params.maximum_weight_at_zeroing);
							$$('display_com_port').setValue(data.params.display_com_port);
							$$('display_baud_rate').setValue(data.params.display_baud_rate);
							$$('display_turned').setValue(data.params.display_turned);
							$$('gost').setValue(data.params.gost);
							$$('longitudinal').setValue(data.params.longitudinal);
							$$('transverse').setValue(data.params.transverse);
							$$('threshold').setValue(data.params.threshold);
							$$('period').setValue(data.params.period);
							configuration.wagon_weighing = !data.params.wagon_weighing;
							configuration.platform_for_dynamic = data.params.platform_for_dynamic;
							configuration.maximum_weight_at_zeroing = data.params.maximum_weight_at_zeroing;
							configuration.gost = data.params.gost;
							configuration.offset_lengthwise = data.params.longitudinal;
							configuration.cross_offset = data.params.transverse;
							configuration.auto_zero_correction.threshold = data.params.threshold;
							configuration.auto_zero_correction.period = data.params.period;
							newv => xx.app.config.configuration = configuration;
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

		function setHardware(rfid, lights, lights_com_port, lights_baud_rate, dosator, drivers, drivers_type) {
			var _methodName = "setHardware";
			webix.ajax().post(
				ip,
				{
					"method": _methodName, "user": User,
					params: {"rfid": rfid, "lights_com_port": lights_com_port, "lights_baud_rate": lights_baud_rate, "dosator": dosator, "drivers": drivers, "drivers_type": drivers_type}
				},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							if (wagon_weighing === true) wagon_weighing = 0;
							else wagon_weighing = 1;
							configuration.wagon_weighing = wagon_weighing;
							newv => this.app.config.configuration = configuration;
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

		function setWidth(lang) {
			if (lang === 'ru') {
				return 200;
			}
			else return 100;
		}

		var comport_options = [
			{id: 1, value: "COM1"},
			{id: 2, value: "COM3"},
			{id: 2, value: "COM5"},
			{id: 2, value: "COM6"},
			{id: 2, value: "COM7"},
			{id: 2, value: "COM8"},
			{id: 2, value: "COM9"},
			{id: 3, value: "COM10"}
		];

		var baudrate_options = [
			{id: 1, value: "110"},
			{id: 2, value: "300"},
			{id: 3, value: "600"},
			{id: 4, value: "1200"},
			{id: 5, value: "2400"},
			{id: 6, value: "4800"},
			{id: 7, value: "9600"},
			{id: 8, value: "14400"},
			{id: 9, value: "19200"},
			{id: 10, value: "38400"},
			{id: 11, value: "57600"},
			{id: 12, value: "115200"},
			{id: 13, value: "128000"},
			{id: 14, value: "256000"}
		];

		return {
			view: "scrollview", scroll: "y", body: {
				rows: [
					{
						view: "form", elementsConfig: {labelPosition: "top"}, rules: {$all: webix.rules.isNotEmpty},
						elements: [
							{template: _("Weighing"), type: "section"},
							{
								cols: [
									{
										view: "switch",
										name: 'wagon_weighing',
										id: 'wagon_weighing',
										hidden: !globals.static_wagon,
										width: 300,
										labelAlign: "right",
										labelPosition: "right",
										label: _("Truck/Wagon"),
										value: configuration['wagon_weighing'],
										labelWidth: setWidth(lang)
									},
									{width: 10},
									{
										view: "switch",
										name: 'platform_for_dynamic',
										id: 'platform_for_dynamic',
										hidden: !globals.static_wagon,
										width: 400,
										labelWidth: 300,
										labelAlign: "right",
										labelPosition: "right",
										label: _("Left/Right"),
										value: configuration['platform_for_dynamic'],
										on: {
											onChange: function (newState) {
												configuration['platform_for_dynamic'] = newState;
											}
										}
									},
							{minWidth: 50, gravity: 1},
							]},
							{label: _("Maximum weight at zeroing"), view: "label", minWidth: 250, gravity: 3},
							{
								cols:
									[
										{
											name: 'maximum_weight_at_zeroing',
											id: 'maximum_weight_at_zeroing',
											min: 0,
											max: 2000,
											view: "slider",
											minWidth: 200,
											value: configuration['maximum_weight_at_zeroing'],
											step: 1,
											gravity: 1,
											on: {
												"onAfterRender": function () {
													$$("_maximum_weight_at_zeroing").bind($$("maximum_weight_at_zeroing"));
												},
												"onSliderDrag": function () {
													var new_value = this.getValue();
													$$("_maximum_weight_at_zeroing").setValue(new_value);
													configuration['maximum_weight_at_zeroing'] = new_value;
												}
											}
										},
										{
											view: "text", minWidth: 60, height: 30, id: "_maximum_weight_at_zeroing",
											on: {
												"onChange": function (new_value, oldv) {
													$$("maximum_weight_at_zeroing").setValue(new_value);
													configuration['maximum_weight_at_zeroing'] = new_value;
												}
											}
										},
										{label: _("kG"), view: "label", minWidth: 20},
										{gravity: 9}
									]
							},
							{template: _("Display"), type: "section"},
							{
								cols: [
									{
										view: "select", width: 150,
										label: _('COM Port'), labelAlign: "left", id: "display_com_port",
										value: 1, options: comport_options
									},
									{width: 20},
									{
										view: "select", width: 150,
										label: _('Baud Rate'), labelAlign: "left", id: "display_baud_rate",
										value: 1, options: baudrate_options
									},
									{width: 20},
									{
										view: "switch",
										name: 'turn_on_board',
										id: "display_turned",
										minWidth: 400,
										value: configuration['display'],
										label: _("Turn on"),
										labelAlign: "left",
										labelPosition: "top",
										labelWidth: 84,
										on: {
											onChange: function (newState) {
												configuration['display'] = newState;
												if (newState === 1){
													webix.message({
														type: "info",
														text: (_("Display connected"))
													});
												}
											}
										}
									},
									{}
								]
							},
							{height: 10},
							{template: _("Allowable DH offset"), type: "section"},
							{
								view: "switch",
								name: 'gost',
								id: "gost",
								minWidth: 400,
								labelAlign: "left",
								labelPosition: "right",
								label: _("GOST 22235-76/TU #CM943"),
								value: configuration['gost'],
								labelWidth: 200,
								gravity: 1,
								on: {
									onChange: function (newState) {
										configuration['gost'] = newState;
									}
								}
							},
							{
								cols: [
									{
										gravity: 3, rows:
											[
												{label: _("Longitudinal"), view: "label", minWidth: 100},
												{
													cols: [
														{
															id: "longitudinal",
															name: 'offset_lengthwise',
															min: 0,
															max: 4500,
															view: "slider",
															minWidth: 200,
															value: configuration['offset_lengthwise'],
															on: {
																"onAfterRender": function () {
																	$$("_longitudinal").bind($$("longitudinal"));
																},
																"onSliderDrag": function () {
																	var new_value = this.getValue();
																	$$("_longitudinal").setValue(new_value);
																	configuration['offset_lengthwise'] = new_value;
																}
															}
														},
														{
															id: "_longitudinal", view: "text", minWidth: 60, height: 20,
															on: {
																"onChange": function (new_value, oldv) {
																	$$("longitudinal").setValue(new_value);
																	configuration['offset_lengthwise'] = new_value;
																}
															}
														},
														{label: _("mm"), view: "label", minWidth: 30}]
												}
											]
									},
									{minWidth: 50, gravity: 1},
									{
										gravity: 3, rows:
											[
												{label: _("Transverse"), view: "label", width: 90},
												{
													cols: [
														{
															name: 'cross_offset',
															min: 0,
															max: 4500,
															view: "slider",
															minWidth: 200,
															value: configuration['cross_offset'],
															id: "transverse",
															on: {
																"onAfterRender": function () {
																	$$("_transverse").bind($$("transverse"));
																},
																"onSliderDrag": function () {
																	var new_value = this.getValue();
																	$$("_transverse").setValue(new_value);
																	configuration['cross_offset'] = new_value;
																}
															}
														},
														{
															id: "_transverse", view: "text", minWidth: 60, height: 30,
															on: {
																"onChange": function (new_value, oldv) {
																	$$("transverse").setValue(new_value);
																	configuration['cross_offset'] = new_value;
																}
															}
														},
														{label: _("mm"), view: "label", minWidth: 30}]
												}
											]
									},
									{},
									{minWidth: 144, gravity: 3},
									{gravity: 5}
								]
							},
							{template: _("Auto zero correction"), type: "section"},
							{
								cols: [
									{
										rows:
											[
												{label: _("Threshold"), view: "label", minWidth: 20, gravity: 3},
												{
													cols:
														[
															{
																min: 0,
																name: 'auto_zero_correction_threshold',
																max: 200,
																view: "slider",
																minWidth: 200,
																gravity: 3,
																value: configuration['auto_zero_correction']['threshold'],
																step: 5,
																id: "threshold",
																on: {
																	"onAfterRender": function () {
																		$$("_threshold").bind($$("threshold"));
																	},
																	"onSliderDrag": function () {
																		var new_value = this.getValue();
																		$$("_threshold").setValue(new_value);
																		configuration['auto_zero_correction']['threshold'] = new_value;
																	}
																}
															},
															{
																view: "text",
																minWidth: 60,
																height: 30,
																id: "_threshold",
																on: {
																	"onChange": function (new_value, oldv) {
																		$$("threshold").setValue(new_value);
																		configuration['auto_zero_correction']['threshold'] = new_value;
																	}
																}
															},
															{label: _("kG"), view: "label", minWidth: 20, gravity: 1}
														]
												},
											]
									},
									{minWidth: 50, gravity: 1},
									{
										rows: [{label: _("Period"), view: "label", minWidth: 20, gravity: 3},
											{
												cols:
													[
														{
															name: 'auto_zero_correction_period',
															id: "period",
															min: 0,
															max: 60,
															view: "slider",
															minWidth: 200,
															value: configuration['auto_zero_correction']['period'],
															step: 1,
															gravity: 3,
															on: {
																"onAfterRender": function () {
																	$$("_period").bind($$("period"));
																},
																"onSliderDrag": function () {
																	var new_value = this.getValue();
																	$$("_period").setValue(new_value);
																	configuration['auto_zero_correction']['period']= new_value;
																}
															}
														},
														{
															id: "_period", view: "text", minWidth: 60, height: 20,
															on: {
																"onChange": function (new_value, oldv) {
																	$$("period").setValue(new_value);
																	configuration['auto_zero_correction']['period']= new_value;
																}
															}
														},
														{label: _("s"), view: "label", minWidth: 20, gravity: 1},
													]
											}
										]
									},
									{width: 20},
									{
										view: "switch",
										name: 'turn_on_zero_correction',
										id: "turn_on_zero_correction",
										minWidth: 400,
										value: configuration['turn_on_zero_correction'],
										label: _("Turn on"),
										labelAlign: "left",
										labelPosition: "top",
										labelWidth: 84,
										on: {
											onChange: function (newState) {
												configuration['turn_on_zero_correction'] = newState;
												if (newState === 1){
													webix.message({
														type: "info",
														text: (_("Zero_correction switched"))
													});
												}
											}
										}
									},
									{}
								]
							},
							{},
							{
								margin: 10, cols: [
									{},
									{
										view: "button", value: _("Default settings"),
										autowidth: true,
										click: function () {
											this.getFormView().setValues(this.$scope._defaults);
											webix.message(_("Set to defaults"));
										}
									},
									{
										view: "button", value: _("Save"),
										autowidth: true, type: "form",
										click: function () {
											newv => this.app.config.configuration = configuration;
											var maximum_weight_at_zeroing = $$('maximum_weight_at_zeroing').getValue();
											var display_com_port = $$('display_com_port').getValue();
											var display_baud_rate = $$('display_baud_rate').getValue();
											var display_turned = $$('display_turned').getValue();
											var wagon_weighing = $$('wagon_weighing').getValue();
											if (wagon_weighing === 1) wagon_weighing = false;
											else wagon_weighing = true;
											var platform_for_dynamic = configuration['platform_for_dynamic'];
											if (platform_for_dynamic === 1) platform_for_dynamic = true;
											else platform_for_dynamic = false;
											var gost = $$('gost').getValue();
											var longitudinal = $$('longitudinal').getValue();
											var transverse = $$('transverse').getValue();
											if ($$("turn_on_zero_correction").getValue() === 0) {
												var threshold = 0;
												var period = 0;
											}
											else {
												var threshold = $$('threshold').getValue();
												var period = $$('period').getValue();
											}

											setConfiguration(wagon_weighing, platform_for_dynamic, maximum_weight_at_zeroing, display_com_port, display_baud_rate, display_turned, gost, longitudinal, transverse, threshold, period);
										}
									},
								]
							}
						]
					}]
			}
		};
	}
	init(){
		this.app.callEvent("setExchange=nothing");
		this._lang = this.app.getService("locale").getLang();
		const ip = this.app.config.remoteHOST;
		const _ = this.app.getService("locale")._;
		const User = this.app.config.user;

		function getConfiguration() {
			var _methodName = "getConfiguration";
			webix.ajax().post(
				ip,
				{ "method": _methodName, "user": User, params: [] },
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							$$('wagon_weighing').setValue(!data.params.wagon_weighing);
							$$('platform_for_dynamic').setValue(data.params.platform_for_dynamic);
							$$('maximum_weight_at_zeroing').setValue(data.params.maximum_weight_at_zeroing);
							$$('display_com_port').setValue(data.params.display_com_port);
							$$('display_baud_rate').setValue(data.params.display_baud_rate);
							$$('display_turned').setValue(data.params.display_turned);
							$$('gost').setValue(data.params.gost);
							$$('longitudinal').setValue(data.params.longitudinal);
							$$('transverse').setValue(data.params.transverse);
							$$('threshold').setValue(data.params.threshold);
							$$('period').setValue(data.params.period);
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

		this._defaults = {
			wagon_weighing: true,
			offset_lengthwise: 100,
			cross_offset: 100,
			capacity: 300,
			side_diff: 100,
			min_speed: 5,
			max_speed: 40,
			maximum_weight_at_zeroing: 100,
			additional_scoreboard: false,
			gost: true,
			auto_zero_correction_threshold: 40,
			auto_zero_correction_period: 4,
			dynamics_speedthreshold: 90,
			dynamics_zerothreshold: 18,
			dynamics_calming: 1,
			dynamics_platform: 4110
		};

		this.app.callEvent("chart3StaticCalibrationUpdateStop");
		this.app.callEvent("chart2StaticCalibrationUpdateStop");
		this.app.callEvent("chart1StaticCalibrationUpdateStop");

		getConfiguration();
	}
}

import {JetView} from 'webix-jet'
import {getLangsList} from 'models/langslist'
import Static_calibration from 'views/settings/static-calibration'
import Dynamic_calibration from 'views/settings/dynamic-calibration'
import Auto_calibration from 'views/settings/autocalibration'

import 'locales/webix/ru.js'

export default class CalibrationView extends JetView {
	config() {
		const _ = this.app.getService('locale')._;
		const lang = this.app.getService('locale').getLang();
		const theme = this.app.config.theme;
		const counts = this.app.config.counts;
		const User = this.app.config.user;
		const ip = this.app.config.remoteHOST;
		const ids = this.app.config.ids;
		const configuration = this.app.config.configuration;

		var passForCalibration = "passForCalibration" + ids.win1;
		var _lockWindow = "_lockWindow" + ids.win1;
		var _warningWindow = "_warningWindow" + ids.win1;
		var _lockWindowBlockingLabel = "_lockWindowBlockingLabel" + ids.win1;
		newv => this.app.config.ids = ids;
		$$("lockWindow").setValue(_lockWindow);
		$$("lockWindowBlockingLabel").setValue(_lockWindowBlockingLabel);
		$$("warningWindow").setValue(_warningWindow);
		$$("passForCalibration").setValue(passForCalibration);

		let switcher = true;
		var referenceView = this;

		var warningWindow = webix.ui({
			id: _warningWindow,
			view: "window",
			head: _("Blocking"),
			width: 500,
			height: 500,
			body: {
				cols: [
					{},
					{
						rows: [
							{},
							{
								cols: [
									{},
									{
										view: "label",
										label: _("Warning: for correct calibration turn off the auto zero correction"),
										width: 500
									},
									{}
								]
							},
							{
								cols: [
									{},
									{},
									{}]
							},
							{},
						]
					},
					{}
				]
			},
		});

		var lockWindow = webix.ui({
			id: _lockWindow,
			view: "window",
			head: {
				view: "toolbar", margin: -4, cols: [
					{id: _lockWindowBlockingLabel, view: "label", label: _("Blocking")},
					{
						view: "label",
						template: function (obj) {
							var html = "<div class='del_element'>";
							return html + "</div>";
						},
						click: function () {
							referenceView.app.show("/top/settings/interface");
							$$(_lockWindow).hide();
						}
					},
				]
			},
			width: 400,
			height: 500,
			modal: true,
			body: {
				cols: [
					{},
					{
						rows: [
							{},
							{
								cols: [
									{},
									{view: "label", label: _("Enter the password: "), width: 150},
									{
										view: "text", type: "password", width: 150, id: passForCalibration,
										on: {
											"onEnter": function (state, editor, ignoreUpdate) {
												var password = $$(passForCalibration).getValue();
												if (password.length !== 0) {
													if (password === '357854' || password === '122111') {
														lockWindow.destructor();
														var threshold = configuration.auto_zero_correction.threshold;
														if (threshold > 0) {
															var width = $$("static-calibration")["$width"];
															var height = $$("static-calibration")["$height"];
															var posX = $$("sidemenu")["$width"] + 10;
															var posY = 120;
															warningWindow.define("width", width);
															warningWindow.define("height", height);
															warningWindow.setPosition(posX, posY);
															warningWindow.show();
															warningWindow.resize();
														}
													} else webix.message({type: "error", text: _("Wrong password")});
												} else webix.message({type: "error", text: _("Enter the password")});
											}
										}
									},
									{}
								]
							},
							{
								cols: [
									{},
									{
										view: "button", width: 150, value: _("Approve"),
										click: function () {
											var password = $$(passForCalibration).getValue();
											if (password.length !== 0) {
												if (password === '357854' || password === '122111') {
													lockWindow.destructor();
													var threshold = configuration.auto_zero_correction.threshold;
													if (threshold > 0) {
														var width = $$("static-calibration")["$width"];
														var height = $$("static-calibration")["$height"];
														var posX = $$("sidemenu")["$width"] + 10;
														var posY = 120;
														warningWindow.define("width", width);
														warningWindow.define("height", height);
														warningWindow.setPosition(posX, posY);
														warningWindow.show();
														warningWindow.resize();
													}
												} else webix.message({type: "error", text: _("Wrong password")});
											} else {
												webix.message({type: "error", text: _("Enter the password")});
											}
										}
									},
									{width: 10},
									{
										view: "button", width: 150, value: _("Cancel"),
										click: function () {
											referenceView.app.show("/top/settings/interface");
											$$(_lockWindow).hide();
										}
									},
									{}]
							},
							{},
						]
					},
					{}
				]
			},
			on: {
				"onKeyPress": function (code, e) {
					console.log(code);
					console.log(e);
				}
			}
		});

		return {
			rows: [
				{
					id: 'mode', view: 'segmented', minWidth: 333,
					options: [
						{id: 'static', value: _('sstatic')},
						{id: 'dynamic', value: _('ddynamic')},
						{id: 'auto', value: _('autocalibration')}
					],
					on: {
						onChange: function () {
							if ($$('mode').getValue() === 'dynamic') {
								referenceView.app.callEvent('setExchange=nothing');
								switcher = false;
								$$('static-calibration').hide();
								$$('auto-calibration').hide();
								$$('dynamic-calibration').show();
							} else if ($$('mode').getValue() === 'static') {
								referenceView.app.callEvent('setExchange=nothing');
								referenceView.app.callEvent('setConnection=calibration.static');
								referenceView.app.callEvent('connection');
								switcher = true;
								$$('dynamic-calibration').hide();
								$$('auto-calibration').hide();
								$$('static-calibration').show();
							} else {
								referenceView.app.callEvent('setExchange=nothing');
								switcher = true;
								$$('dynamic-calibration').hide();
								$$('auto-calibration').show();
								$$('static-calibration').hide();
							}
						}
					}
				},
				Static_calibration,
				Dynamic_calibration,
				Auto_calibration
			]
		}
	}

	ready() {
		var width = $$("static-calibration")["$width"];
		var height = $$("static-calibration")["$height"];
		var posX = $$("sidemenu")["$width"] + 10;
		var posY = 120;
		var _lockWindow = $$("lockWindow").getValue();
		var _lockWindowBlockingLabel = $$("lockWindowBlockingLabel").getValue();
		var _passForCalibration = $$("passForCalibration").getValue();
		$$(_lockWindow).define("width", width);
		$$(_lockWindowBlockingLabel).define("width", width - 40);
		$$(_lockWindow).define("height", height);
		$$(_lockWindow).setPosition(posX, posY);
		$$(_lockWindow).show();
		$$(_lockWindow).resize();
		$$(_passForCalibration).$view.querySelector("input").focus();
	}
}

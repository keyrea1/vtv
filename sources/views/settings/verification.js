import {JetView} from "webix-jet";
import {getLangsList} from "models/langslist";
import Static_verification from "views/settings/static-verification";
import Dynamic_verification from "views/settings/dynamic-verification";

import "locales/webix/ru.js";

export default class VerificationView extends JetView {
	config(){
		const _ = this.app.getService("locale")._;
		const lang = this.app.getService("locale").getLang();
		const theme = this.app.config.theme;
		const globals = this.app.config.globals._package;
		const config = $$('mainTop').$scope.app.config.configuration;
		const referenceView = this;
		let switcher = true;

		return {
			rows:[
				{
					view: "segmented", minWidth: 333,
					options: [
						{id: "0", value: _("sstatic")},
						{id: "all", value: _("ddynamic"), hidden: !globals.dynamic}
					],
					on: {
						onChange: function () {
							if (switcher === true) {
								switcher = false;
								referenceView.app.callEvent("setExchange=nothing");
								$$("static-verification").hide();
								$$("dynamic-verification").show();
							}
							else {
								switcher = true;
								referenceView.app.callEvent("setExchange=nothing");
        						if (config.wagon_weighing) {
        						    referenceView.app.callEvent("setConnection=verification.wagon");
        						}
        						else {
        						    referenceView.app.callEvent("setConnection=verification.truck");
        						}
        						referenceView.app.callEvent("connection");
								$$("dynamic-verification").hide();
								$$("static-verification").show();
							}
						},
					}
				},
				Static_verification,
				Dynamic_verification
			]
		};
	}

	init(){
		this.app.callEvent("setExchange=nothing");
		this.app.callEvent("chart3StaticCalibrationUpdateStop");
		this.app.callEvent("chart2StaticCalibrationUpdateStop");
		this.app.callEvent("chart1StaticCalibrationUpdateStop");
	}
}

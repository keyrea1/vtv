import {JetView} from "webix-jet";

export default class _This extends JetView {
	config(){
		const _ = this.app.getService("locale")._;
		const theme = this.app.config.theme;

		const main = {
			rows:[
				{
					view:"toolbar", css:theme,
					elements:[
						{ view:"label", label:_("Dosing"), width:150 },
						{ minWidth:4 },
						{
							view:"segmented", minWidth:333,
							options:[
								{ id:"all", value:_("All") },
								{ id:"0", value:_("Untracked") },
							],
							on:{
								onChange:newv => this.app.callEvent("tactions:filter",[newv])
							}
						},
						{ width:6 }
					]
				},
				{},
				{cols:[{}, {template: _("Developing...")}, {}]},
				{}
			]
		};

		return {
			type:"wide", cols:[
				main
			]
		};
	}

	ready(){
		this.app.callEvent("setExchange=nothing");
		this.app.callEvent("chartStaticUpdateStop");
		this.app.callEvent("chartStaticWagonUpdateStop");
		this.app.callEvent("chart3StaticCalibrationUpdateStop");
		this.app.callEvent("chart2StaticCalibrationUpdateStop");
		this.app.callEvent("chart1StaticCalibrationUpdateStop");
		this.app.callEvent("setExchange=nothing");
	}
}
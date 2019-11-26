import {JetView, plugins} from "webix-jet";

export default class JournalView extends JetView {
	config(){
		const _ = this.app.getService("locale")._;
		const access = this.app.config.globals.access;

		return {
			type:"wide",
			cols:[
				{
					localId:"inner:layout", rows:[
						{
							view:"tabbar", localId:"tabbar",
							height:43,
							options:[
								{ id:"prearchive", value:_("prearchive"), width:170, hidden: true },
								{ id:"archive", value:_("archive"), width:170, hidden: !access.explore_weight_arch },
								{ id:"log-journal", value:_("events"), width:170, hidden: !access.explore_logs },
							]
						},
						{ $subview:true }
					]
				}
			]
		};
	}

	init(){
		this.use(plugins.Menu,this.$$("tabbar"));

		this.app.callEvent("setExchange=nothing");
		this.app.callEvent("chartStaticTruckUpdateStop");
		this.app.callEvent("chartStaticWagonUpdateStop");
		this.app.callEvent("chart3StaticCalibrationUpdateStop");
		this.app.callEvent("chart2StaticCalibrationUpdateStop");
		this.app.callEvent("chart1StaticCalibrationUpdateStop");
		this.app.callEvent("setMessage=Waiting");
		this.app.callEvent("chartWeighingDynamicClear");
	}
}

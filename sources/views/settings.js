import {JetView, plugins} from "webix-jet";

export default class SettingsView extends JetView {
    config() {
        const _ = this.app.getService("locale")._;
        const access = this.app.config.globals.access;
        const globals = this.app.config.globals._package;

        function closeCalibrationWindows() {
            try {
                var lockWindowName = $$("lockWindow").getValue();
                if ($$(lockWindowName).isVisible() === true) $$(lockWindowName).destructor();
            }
            catch (e) {
                //console.log(e);
            }
            try {
            	var warningWindowName = $$("warningWindow").getValue();
            	if ($$(warningWindowName).isVisible() === true) $$(warningWindowName).destructor();
			}
			catch (e) {
                //console.log(e);
            }
        }

        return {
            type: "wide",
            cols: [
                {
                    localId: "inner:layout", rows: [
                        {
                            view: "tabbar", id:"switcher", localId: "tabbar",
                            height: 43,
                            options: [
                                {id: "interface", value: _("Main"), width: 170},
                                {
                                    id: "configuration",
                                    value: _("Configuration"),
                                    hidden: !access.configuration,
                                    width: 170
                                },
                                {id: "hardware", value: _("Hardware"), width: 170, hidden: true},
                                {
                                    id: "calibration",
                                    value: _("Calibration"),
                                    hidden: !access.calibration,
                                    width: 170
                                },
                                {
                                    id: "verification",
                                    value: _("Verification"),
                                    width: 170,
                                    hidden: !access.verification
                                },
                                {id: "cameras", value: _("Cameras"), hidden: !globals.recognition, width: 170},
                                {id: "access", value: _("Access"), width: 170, hidden: !access.add_user}
                            ],
                            on: {
                                onChange: function () {
																	var _configuration = $$('mainTop').$scope.app.config.configuration;
																	var current_view = _configuration.current_view;
																	if (current_view === "calibration_dynamic") {
																		webix.message({
																			type: "error",
																			text: _("Calibration must be stop first")
																		});
																		$$("switcher").setValue("calibration");
																	}
																	else closeCalibrationWindows();
                                },

                            }
                        },
                        {$subview: true}
                    ]
                }
            ]
        };
    }

    init() {
        this.use(plugins.Menu, this.$$("tabbar"));
        this.app.callEvent("chartStaticTruckUpdateStop");
        this.app.callEvent("chartStaticWagonUpdateStop");
        this.app.callEvent("chart3StaticCalibrationUpdateStop");
        this.app.callEvent("chart2StaticCalibrationUpdateStop");
        this.app.callEvent("chart1StaticCalibrationUpdateStop");
        this.app.callEvent("setMessage=Waiting");
			  this.app.callEvent("chartWeighingDynamicClear");
    }
}

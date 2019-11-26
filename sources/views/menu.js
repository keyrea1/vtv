import {JetView, plugins} from "webix-jet";

export default class MenuView extends JetView {
	config() {
		const _ = this.app.getService("locale")._;
		const theme = this.app.config.theme;
		const screen = this.app.config.size;
		const globals = this.app.config.globals;
		const access = globals.access;
		const _package = globals._package;

		var log_access = access.explore_logs || access.explore_weight_arch;
		// MENU ELEMENTS
		var weighing = {id: "weighing", value: _("Weighing"), icon: "wxi wxi-subway"};
		var dosing = { id: "dosing", value: _("Dosing"), icon: "wxi wxi-dosing" };
		var settings = { id: "settings", value: _("Settings"), icon: "wxi wxi-gears" };
		var report_builder = { id: "report-builder", value: _("Report Builder"), icon: "wxi wxi-result" };
		var protocol_builder = { id: "protocol-builder", value: _("Protocol Builder"), icon: "wxi wxi-transfer" };
		var journal = { id: "journal", value: _("Events"), icon: "wxi wxi-leads" };
		var menu_elements = [];

		if (log_access) {
			if (_package.dosing) menu_elements = [weighing, dosing, settings, report_builder, protocol_builder, journal];
			else menu_elements = [weighing, settings, report_builder, protocol_builder, journal];
		}
		else {
			if (_package.dosing) menu_elements = [weighing, dosing, settings, report_builder, protocol_builder];
			else  menu_elements = [weighing, settings, report_builder, protocol_builder];
		}

		var menu = {
			id: "sidemenu",
			view: "sidebar",
			css: theme,
			borderless: true,
			width: 240,
			collapsed: (screen !== "wide"),
			data: menu_elements,
			on: {
				"onItemClick": function (id, e, node) {
					var _configuration = $$('mainTop').$scope.app.config.configuration;
					var current_view = _configuration.current_view;
					if (current_view === "dynamic_chart") {
						webix.message({
							type: "error",
							text: _("Close the chart first")
						});
						return false;
					}
          if (current_view === "static_truck") {
            webix.message({
              type: "error",
              text: _("Finish current weighing first")
            });
            return false;
          }
					else if (current_view === "calibration_dynamic") {
						webix.message({
							type: "error",
							text: _("Stop the calibration first")
						});
						return false;
					}
				}
			}
		};

		return menu;
	}

	init(sidebar){
		const access = this.app.config.globals.access;

		var url = "journal/archive";
		var log_access = access.explore_logs || access.explore_weight_arch;
		if (log_access){
			if (access.explore_weight_arch) url = "journal/archive";
			else url = "journal/log-journal"
		}

		this.use(plugins.Menu,{
			id:sidebar,
			urls:{
				"logout": "top/weighing",
				"lock": "top/weighing",
				"settings":"settings/interface",
				"journal":url
			}
		});
		this.on(this.app,"menu:toggle",() => sidebar.toggle());
	}

	urlChange(ui,url){
		if (!ui.find(opts => url[1].page === opts.id).length)
			ui.unselect();
	}
}

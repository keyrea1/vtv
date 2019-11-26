import {JetView} from "webix-jet";

export default class PopUp extends JetView {
	config() {
		const ids = this.app.config.ids;
		const _ = this.app.getService("locale")._;
		const theme = this.app.config.theme;
		const hideOptions = this.app.config.hideOptions;

		var dt1 = "dt1" + ids.dt1;
		ids.dt1 = ids.dt1 + 1;
		var win1 = "win1" + ids.win1;
		ids.win1 = ids.win1 + 1;
		var close = "close" + ids.close;
		ids.close = ids.close + 1;
		newv => this.app.config.ids = ids;

		const data = [
			{"collumn": _("date"), "column": "date", "hide": hideOptions.date},
			{"collumn": _("time"), "column": "time", "hide": hideOptions.time},
			{"collumn": _("wagon_number"), "column": "wagon_number", "hide": hideOptions.wagon_number},
			{"collumn": _("start_weight"), "column": "start_weight", "hide": hideOptions.start_weight},
			{"collumn": _("doc_start_weight"), "column": "doc_start_weight", "hide": hideOptions.doc_start_weight},
			{"collumn": _("brutto"), "column": "brutto", "hide": hideOptions.brutto},
			{"collumn": _("cargo_weight"), "column": "cargo_weight", "hide": hideOptions.cargo_weight},
			{"collumn": _("doc_cargo_weight"), "column": "doc_cargo_weight", "hide": hideOptions.doc_cargo_weight},
			{"collumn": _("doc_number"), "column": "doc_number", "hide": hideOptions.doc_number},
			{"collumn": _("doc_date"), "column": "doc_date", "hide": hideOptions.doc_date},
			{"collumn": _("cargo_name"), "column": "cargo_name", "hide": hideOptions.cargo_name},
			{"collumn": _("capacity"), "column": "capacity", "hide": hideOptions.capacity},
			{"collumn": _("truck1_weight"), "column": "truck1_weight", "hide": hideOptions.truck1_weight},
			{"collumn": _("truck2_weight"), "column": "truck2_weight", "hide": hideOptions.truck2_weight},
			{"collumn": _("truck_diff"), "column": "truck_diff", "hide": hideOptions.truck_diff},
			{"collumn": _("side_diff"), "column": "side_diff", "hide": hideOptions.side_diff},
			{"collumn": _("offset_lengthwise"), "column": "offset_lengthwise", "hide": hideOptions.offset_lengthwise},
			{"collumn": _("cross_offset"), "column": "cross_offset", "hide": hideOptions.cross_offset},
			{"collumn": _("speed"), "column": "speed", "hide": hideOptions.speed},
			{"collumn": _("sender"), "column": "sender", "hide": hideOptions.sender},
			{"collumn": _("reciever"), "column": "reciever", "hide": hideOptions.reciever},
			{"collumn": _("transporter"), "column": "transporter", "hide": hideOptions.transporter},
			{"collumn": _("departure_point"), "column": "departure_point", "hide": hideOptions.departure_point},
			{"collumn": _("destination_point"), "column": "destination_point", "hide": hideOptions.destination_point},
			{"collumn": _("cargo"), "column": "cargo", "hide": hideOptions.cargo},
			{"collumn": _("axels_count"), "column": "axels_count", "hide": hideOptions.axels_count},
			{"collumn": _("photo_path"), "column": "photo_path", "hide": hideOptions.photo_path},
			{"collumn": _("wagon_type"), "column": "wagon_type", "hide": hideOptions.wagon_type},
			{"collumn": _("optional1"), "column": "optional1", "hide": hideOptions.optional1},
			{"collumn": _("optional2"), "column": "optional2", "hide": hideOptions.optional2},
			{"collumn": _("optional3"), "column": "optional3", "hide": hideOptions.optional3},
			{"collumn": _("optional4"), "column": "optional4", "hide": hideOptions.optional4},
			{"collumn": _("optional5"), "column": "optional5", "hide": hideOptions.optional5}];

		const hidOptions = {
			view: "datatable",
			editable: true,
			css: theme,
			id: dt1,
			data: data,
			columns: [
				{id: "collumn", header: _("Column"), css: "rank", width: 170},
				{id: "column", hidden: true},
				{
					id: "hide",
					header: _("Hide"),
					width: 75,
					template: "{common.checkbox()}",
					editor: "checkbox",
					checkValue: true,
					uncheckValue: false
				},
			],
			select: "row",
			on: {
				"onCheck": function (row, column, state) {
					$$(dt1).select(row, false);
					let item = $$(dt1).getSelectedItem();
					hideOptions[item.column] = item.hide;
					newv => this.app.config.hideOptions = hideOptions;
					if (item.hide === true) {
						$$("operations").hideColumn(item.column);
					}
					else {
						$$("operations").showColumn(item.column);
					}
				}
			}
		};

		const popUp = {
			view: "window",
			css: theme,
			id: win1,
			height: 600,
			width: 250,
			top: -100,
			left: -400,
			move: true,
			head: {
				view: "toolbar", margin: -4, cols: [
					{view: "label", label: _("Table configurator")},
					{
						view: "icon", icon: "mdi mdi-close", click: function () {
							$$(win1).hide();
						}
					}]
			},
			body: {
				rows: [
					hidOptions,
					{
						view: "toolbar", margin: -4, cols: [
							{
								view: "button", id: close, value: _("Close"), click: function () {
									$$(win1).hide();
								}
							}
						]

					}]
			}
		};

		return popUp;
	}
}
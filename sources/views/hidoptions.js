import {JetView} from "webix-jet";

export default class HidOptions extends JetView {
	config() {
		const _ = this.app.getService("locale")._;
		const theme = this.app.config.theme;
				const hideOptions = this.app.config.hideOptions;
const data = [
			{"collumn":_("id"),"hide":hideOptions.id},
			{"collumn":_("date"),"column":"date","hide":hideOptions.date},
			{"collumn":_("time"),"column":"time","hide":hideOptions.time},
			{"collumn":_("direction"),"column":"direction","hide":hideOptions.direction},
			{"collumn":_("wagon_number"),"column":"wagon_number","hide":hideOptions.wagon_number},
			{"collumn":_("start_weight"),"column":"start_weight","hide":hideOptions.start_weight},
			{"collumn":_("doc_start_weight"),"column":"doc_start_weight","hide":hideOptions.doc_start_weight},
			{"collumn":_("brutto"),"column":"brutto","hide":hideOptions.brutto},
			{"collumn":_("cargo_weight"),"column":"cargo_weight","hide":hideOptions.cargo_weight},
			{"collumn":_("doc_cargo_weight"),"column":"doc_cargo_weight","hide":hideOptions.doc_cargo_weight},
			{"collumn":_("doc_number"),"column":"doc_number","hide":hideOptions.doc_number},
			{"collumn":_("doc_date"),"column":"doc_date","hide":hideOptions.doc_date},
			{"collumn":_("cargo_name"),"column":"cargo_name","hide":hideOptions.cargo_name},
			{"collumn":_("capacity"),"column":"capacity","hide":hideOptions.capacity},
			{"collumn":_("truck1_weight"),"column":"truck1_weight","hide":hideOptions.truck1_weight},
			{"collumn":_("truck2_weight"),"column":"truck2_weight","hide":hideOptions.truck2_weight},
			{"collumn":_("truck_diff"),"column":"truck_diff","hide":hideOptions.truck_diff},
			{"collumn":_("side_diff"),"column":"side_diff","hide":hideOptions.side_diff},
			{"collumn":_("offset_lengthwise"),"column":"offset_lengthwise","hide":hideOptions.offset_lengthwise},
			{"collumn":_("cross_offset"),"column":"cross_offset","hide":hideOptions.cross_offset},
			{"collumn":_("speed"),"column":"speed","hide":hideOptions.speed},
			{"collumn":_("sender"),"column":"sender","hide":hideOptions.sender},
			{"collumn":_("reciever"),"column":"reciever","hide":hideOptions.reciever},
			{"collumn":_("transporter"),"column":"transporter","hide":hideOptions.transporter},
			{"collumn":_("departure_point"),"column":"departure_point","hide":hideOptions.departure_point},
			{"collumn":_("destination_point"),"column":"destination_point","hide":hideOptions.destination_point},
			{"collumn":_("cargo"),"column":"cargo","hide":hideOptions.cargo},
			{"collumn":_("axels_count"),"column":"axels_count","hide":hideOptions.axels_count},
			{"collumn":_("photo_path"),"column":"photo_path","hide":hideOptions.photo_path},
			{"collumn":_("train_number"),"column":"train_number","hide":hideOptions.train_number},
			{"collumn":_("wagon_type"),"column":"wagon_type","hide":hideOptions.wagon_type},
			{"collumn":_("optional1"),"column":"optional1","hide":hideOptions.optional1},
			{"collumn":_("optional2"),"column":"optional2","hide":hideOptions.optional2},
			{"collumn":_("optional3"),"column":"optional3","hide":hideOptions.optional3},
			{"collumn":_("optional4"),"column":"optional4","hide":hideOptions.optional4},
			{"collumn":_("optional5"),"column":"optional5","hide":hideOptions.optional5},
			{"collumn":_("autofilling"),"column":"autofilling","hide":hideOptions.autofilling}];

		return {
			view: "datatable",
			editable: true,
			css:theme,
			data: data,
			id: "HidOptions",
			columns: [
				{id: "collumn", header: _("Column"), css: "rank", width: 170},
				{id: "column", hidden: true},
				{id: "hide", header: _("Hide"), width: 75, template:"{common.checkbox()}", editor: "checkbox", checkValue:true, uncheckValue:false},
			],
			select: "row",
			on:{"onCheck": function(row, column, state){
				$$("dt1").select(row, false);
				let item = $$("dt1").getSelectedItem();
				hideOptions[item.column] = item.hide;
				newv => this.app.config.hideOptions = hideOptions;
				if (item.hide === true){
					$$("operations").hideColumn(item.column);
				}
				else {
					$$("operations").showColumn(item.column);
				}}}
		};
	}
}
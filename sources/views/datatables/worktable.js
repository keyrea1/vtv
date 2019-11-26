import {JetView} from "webix-jet";

export default class WorkTable extends JetView {
	config() {
		const _ = this.app.getService("locale")._;
		const dateFormat = webix.Date.dateToStr(this.app.config.dateFormat);
		const theme = this.app.config.theme;
		const ids = this.app.config.ids;
		const configuration = this.app.config.configuration;

		return {
			view:"datatable",
			id:"work-table",
			hidden: true,
			editable:false,
			resizeColumn:{headerOnly:true},
			select:"row",
			navigation: true,
			hover: "myhover",
			columns: [
				{ id:"id", header:"#", width:40, sort:"int"},
				{ id:"write_date", header:_("date"), fillspace:1, minWidth:90, sort:"date", format:dateFormat},
				{ id:"write_time", header:_("time"), adjust: true},
				{ id:"direction", header: "", css: "status", sort: "text", width: 45,
					template: data => {
						let icon = "";
						if (data.direction === "true") {
							icon = "arrow-right";
							return `<span class='webix_icon wxi wxi-${icon} ${data.status}'></span>`;
						}
						else if (data.direction === "false") {
							icon = "arrow-left";
							return `<span class='webix_icon wxi wxi-${icon} ${data.status}'></span>`;
						}
						else return "";
					}
				},
				{id:"train_number", header:_("train_number"), sort:"int", adjust:"header"},
				{id:"wagon_number", header: _("wagon_number"), sort:"int", adjust:"header"},
				{id:"start_weight", header:_("start_weight"), adjust:true, width:70},
				{id:"doc_start_weight", header:_("doc_start_weight"), adjust:"header"},
				{id:"brutto", header:_("brutto"), adjust:true},
				{id:"cargo_weight", header: _("cargo_weight"), adjust: true},
				{id:"capacity", header:_("capacity"), adjust:true},
				{id:"overload", header:_("overload"), adjust:true,
                    template: data => {
                        let icon = "";
                        if (data.doc_start_weight !== "" && data.doc_start_weight !== null && data.doc_start_weight !== undefined && !isNaN(data.doc_start_weight)) {
                            data.overload = -data.capacity + data.doc_start_weight;
                            return data.overload;
                        }
                        //else if (data.start_weight !== "" && data.start_weight !== null && data.start_weight !== undefined && !isNaN(data.start_weight)) {
                        //    data.overload = -data.capacity + data.start_weight;
                        //    return data.overload;
                        //}
                        else return "";
                    }
                },
				{id:"doc_cargo_weight", header:_("doc_cargo_weight"), adjust:true},
				{id:"doc_number", header:_("doc_number"), adjust:true},
				{id:"doc_date", header: _("doc_date"),sort: "date", format: dateFormat, adjust: true},
				{id:"cargo_name", header:_("cargo_name"), adjust:true},
                {id: "truck1_weight", header: _("truck1_weight"), adjust: true},
                {id: "ft_axis_1", header: _("ft_axis_1"), adjust: true},
                {id: "ft_axis_2", header: _("ft_axis_2"), adjust: true},
                {id: "ft_axis_3", header: _("ft_axis_3"), adjust: true},
                {id: "ft_axis_4", header: _("ft_axis_4"), adjust: true},
                {id: "truck2_weight", header: _("truck2_weight"), adjust: true},
                {id: "st_axis_1", header: _("st_axis_1"), adjust: true},
                {id: "st_axis_2", header: _("st_axis_2"), adjust: true},
                {id: "st_axis_3", header: _("st_axis_3"), adjust: true},
                {id: "st_axis_4", header: _("st_axis_4"), adjust: true},
				{id:"truck_diff", header:_("truck_diff"), adjust:true},
				{id:"side_diff", header:_("side_diff"), adjust:true},
				{id:"offset_lengthwise", header:_("offset_lengthwise"), adjust:true},
				{id:"cross_offset", header:_("cross_offset"), adjust:true},
				{id:"speed", header:_("speed"), adjust:true},
				{id:"sender", header:_("sender"), sort: "string", view:"list", adjust:true},
				{id:"reciever", header:_("reciever"), adjust:true},
				{id:"transporter", header:_("transporter"), adjust:true},
				{id:"departure_point", header:_("departure_point"), adjust:true},
				{id:"destination_point", header: _("destination_point"), adjust:true},
				{id:"cargo", header:_("cargo"), adjust:true},
				{id:"axels_count", header:_("axels_count"), adjust:true},
				{id:"photo_path", header:_("photo_path"), adjust:true},
				{id:"wagon_type", header:_("wagon_type"), adjust:true},
				{id:"optional1", header:_("optional1"), adjust:true},
				{id:"optional2", header:_("optional2"), adjust:true},
				{id:"optional3", header:_("optional3"), adjust:true},
				{id:"optional4", header:_("optional4"), adjust:true},
				{id:"optional5", header: _("optional5"), adjust: true},
				{id:"weight_type", header:_("weight_type"), adjust:true},
				{id:"autofilling", header:_("autofilling"), adjust:true},
				{id:"user", header:_("user"), adjust:true},
				{id:"lastdateedited", header:_("lastdateedited"), adjust:true},
				{id:"lasttimeedited", header:_("lasttimeedited"), adjust:true},
				{id:"lasttimeeditor", header:_("lasttimeeditor"), adjust:true}]
		};
	}
	init (grid) {
		const _ = this.app.getService("locale")._;
		const list_length = this.app.config.listLength;
		//grid.sync(alloperations, function(){});
	}
}

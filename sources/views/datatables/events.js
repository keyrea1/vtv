import {JetView} from "webix-jet";

export default class EventsView extends JetView {
	config() {
		const _ = this.app.getService("locale")._;
		const dateFormat = webix.Date.dateToStr(this.app.config.dateFormat);
		const theme = this.app.config.theme;

		return {
			view:"datatable",
			id:"events",
			editable:false,
			resizeColumn:{headerOnly:true},
			select:"row",
			navigation: true,
			hover: "myhover",
			columns: [
				{ id: "id", header:"#", width:40, sort:"int", hidden: true },
				{ id: "date", header:_("date"), minWidth:90, sort:"date", format:dateFormat },
				{ id: "time", header:_("time"), adjust: true },
				{ id: "source", header:[_("source"),{content:"textFilter"}], adjust:"header"},
				{	id: "name", header: _("name"), adjust:"data"},
				{ id: "user", header: [_("user"),{content:"textFilter"}], adjust:true, width:70,},
				{ id: "details", header: _("details"), minWidth: 200, adjust:"data", fillspace: true},
				{
					id:"weight", header:_("weight"), adjust:"header",
					format:function(value){return webix.i18n.intFormat(value);},
					editFormat:function(value){return webix.i18n.intFormat(value);}
				},
				{ id: "camera1", header:[{text:_("Photo"), colspan:4}, _("Camera 1")], adjust:"header",},
				{ id: "camera2", header: [null, _("Camera 2")], adjust:"header"},
				{ id: "camera3", header: [null, _("Camera 3")], adjust:"header"},
				{ id: "camera4", header: [null, _("Camera 4")], adjust:"header"}
			]
		};
	}

	init(grid){
		const _ = this.app.getService("locale")._;
		const ip = this.app.config.remoteHOST;
		const User = this.app.config.user;
		const datatable_name = "events";

		webix.extend($$(datatable_name), webix.ProgressBar);

		function show_progress_icon(delay) {
			$$(datatable_name).disable();
			$$(datatable_name).showProgress({
				type: "icon",
				delay: delay,
				hide: true
			});
			setTimeout(function(){
				$$(datatable_name).enable();
			}, delay);
		}
		show_progress_icon(4000);

		function getLogs(start, end) {
			var _methodName = "getLogs";
			webix.ajax().post(ip, {"method": _methodName, "user": User, "params": {"start": start, "end": end}},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							console.log(data);
							$$("events").clearAll();
							$$("events").parse(data.params, "json");
							webix.message({type: "info", text: _("Loaded from server")});
						}
						else {
							webix.message({
								type: "error",
								text: _(data.params.message)
							});
						}
					}
				});
		}

		var events_set = [
			{id: 1, date: "14.01.2019", time: "14:14:14", source: "User", name: "Clear data event launched", user: "operator1", details: "Flushing of log journal event data"},
			{id: 2, date: "14.01.2019", time: "14:14:14", source: "User", name: "Logout", user: "operator1", details: "Ivanov"},
			{id: 3, date: "14.01.2019", time: "14:14:14", source: "System", name: "Calibration mode entered", user: "operator1"},
			{id: 4, date: "24.01.2019", time: "14:14:14", source: "System", name: "Calibration launched", user: "operator1"},
			{id: 5, date: "24.01.2019", time: "14:14:14", source: "User", name: "Authorization", user: "operator1", details: "Static calibration"},
			{id: 6, date: "24.01.2019", time: "14:14:14", source: "Hardware", name: "Speed limit exceeded", user: "operator1", details: "Kolescnikov"},
			{id: 7, date: "24.01.2019", time: "14:14:14", source: "User", name: "Weight limit excedeed", user: "operator1", details: "70 kM/H"},
			{id: 8, date: "24.01.2019", time: "14:14:14", source: "System", name: "Archive data deleted", user: "operator1", details: "Weighing of 170 tonns"},
			{id: 9, date: "24.01.2019", time: "14:14:14", source: "System", name: "Access level changed", user: "operator1", details: "Deleting archive"},
			{id: 10, date: "24.01.2019", time: "14:14:14", source: "User", name: "Authorization", user: "operator1", details: "User Petrov gain edit weight access to user Fedorov"},
		];
		//getLogs("", "");
		//$$("events").parse(events_set, "json");
	}
}

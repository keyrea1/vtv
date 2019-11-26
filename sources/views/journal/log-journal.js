import {JetView} from "webix-jet";
import Events from "views/datatables/events";

export default class LogsView extends JetView{
	config(){
		const theme = this.app.config.theme;
		const _ = this.app.getService("locale")._;
		const ids = this.app.config.ids;
		const ip = this.app.config.remoteHOST;
		const access = this.app.config.globals.access;
		const User = this.app.config.user;

		var dt1 = "dt11111" + ids.dt1;
		ids.dt1 = ids.dt1 + 1;
		var win1 = "win11111" + ids.win1;
		var win1_download = "win011" + ids.win1;
		var win1_upload = "win03" + ids.win1;
		ids.win1 = ids.win1 + 1;
		var close = "close11111" + ids.close;
		var close_download = "close021" + ids.close;
		ids.close = ids.close + 1;
		newv => this.app.config.ids = ids;

		const exportPopup = {
			view: "popup",
			head: "Submenu",
			width: 120,
			body: {
				view: "list",
				data: [
					{
						view: "icon", tooltip: _("Export table to xlsx format"), value: _("To XLSX"),
						icon: "wxi wxi-xlsx-small"
					},
					{
						view: "icon", tooltip: _("Export table to csv format"),value: _("To CSV"),
						icon: "wxi wxi-csv-small"
					}
				],
				autoheight: true,
				select: true,
				on: {
					onItemClick: function (id, e, node) {
						var currentdate = new Date();
						var datetime = currentdate.getDate() + "." + (currentdate.getMonth() + 1) + "."
													 + currentdate.getFullYear() + " "	+ currentdate.getHours() + ":" + currentdate.getMinutes();
						var filename = "vtv datatable " + datetime;
						var item = this.getItem(id);
						console.log(item.value);
						if(item.value === _("To XLSX")) {
							webix.toExcel($$("events"), {filename: filename});
							webix.message({
								type: "info",
								text: (_("Export to") + " XLSX")
							});
						}
						else if(item.value === _("To PDF")) {
							webix.toPDF($$("events"), {filename: filename, autowidth:true });
							webix.message({
								type: "info",
								text: (_("Export to") + " PDF")
							});
						}
						else if(item.value === _("To CSV")) {
							webix.toCSV($$("events"), {filename: filename});
							webix.message({
								type: "info",
								text: (_("Export to") + " CSV")
							});
						}
					}
				}
			}
		};

		function getLogs(start, end) {
			var _methodName = "getLogs";
			webix.ajax().post(ip, {"method": _methodName, "user": User, "params": {"start": start, "end": end}},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							$$("events").clearAll();
							data.params.forEach(function (item, i, arr) {
								item.source = _(item.source);
								item.name = _(item.name);
							});
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

		function saveLogs(name) {
			var _methodName = "saveLogs";
			webix.ajax().post(ip, {"method": _methodName, "user": User, "params": {"name": name}},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							webix.message({type: "info", text: _("Saved to ") + _(data.params.message)});
						}
						else {
							webix.message({
								type: "error",
								text: _(data.params.message)
							});
						}
					}
					else {
						webix.message({
							type: "error",
							text: _(data.params.message)
						});
					}
				});
		}

		const download = {
			view: "window",
			css:theme,
			id: win1_download,
			height: 600,
			width: 410,
			move: true,
			head: {
				view: "toolbar", margin: -4, cols: [
					{ view: "label", label: _("Download data"), width: 370 },
					{ view: "label",
						template: function (obj) {
							var html = "<div class='del_element'>";
							return html + "</div>";
						},
						click: function () { $$(win1_download).hide(); }
					},
				]
			},
			body: {
				rows: [
					{
						view: "form", scroll: false, width: 500, elements: [
							{cols: [
								{
									view: "datepicker",
									label: _("Start date"),
									timepicker: false,
									labelWidth: 150,
									width: 285,
									name: "start_date",
									stringResult: true,
									format: "%d %M %Y"
								},
								{
									view: "datepicker",
									type:"time",
									width: 85,
									name: "start_time",
									stringResult: true,
									format: "%H:%i"
								},
								{}
							]},
							{cols: [
								{
									view: "datepicker",
									timepicker: false,
									label: _("End date"),
									labelWidth: 150,
									width: 285,
									name: "end_date",
									stringResult: true,
									format: "%d %M %Y"
								},
								{
									view: "datepicker",
									type:"time",
									width: 85,
									name: "end_time",
									stringResult: true,
									format: "%H:%i"
								},
								{}
							]},
							{
								view: "button", type: "form", value: _("Download data"), click: function () {
									var startDate = this.getParentView().getValues().start_date;
									var startTime = this.getParentView().getValues().start_time;
									if (startTime === '' && startDate !== '') {
										startTime = '00:00'
									}
									if (startTime !== '' && startDate === '') {
										startTime = ''
									}
									var endDate = this.getParentView().getValues().end_date;
									var endTime = this.getParentView().getValues().end_time;
									if (endTime === '' && endDate !== '') {
										endTime = '23:59'
									}
									if (endTime !== '' && endDate === '') {
										endTime = ''
									}
									var start = startDate.split(' ')[0] + ' ' + startTime;
									if (start === ' ') {
										start = ''
									}
									var end = endDate.split(' ')[0] + ' ' + endTime;
									if (end === ' ') {
										end = ''
									}
									getLogs(start, end);
								}
							}
						]
					},
					{
						view: "toolbar", margin: -4, cols: [
							{
								view: "button", id: close_download, value: _("Close"), click: function () {
									$$(win1_download).hide();
								}
							}
						]
					}]
			}
		};

		const upload = {
			view: "window",
			css:theme,
			id: win1_upload,
			height: 600,
			width: 327,
			move: true,
			head: {
				view: "toolbar", margin: -4, cols: [
					{ view: "label", label: _("Upload data"), width: 280 },
					{ view: "label",
						template: function (obj) {
							var html = "<div class='del_element'>";
							return html + "</div>";
						},
						click: function () { $$(win1_upload).hide(); }
					},
				]
			},
			body: {
				rows: [
					{
						view: "form", scroll: false, width: 320, elements: [
							{
								label: _("Filename"), labelWidth: 100, view: "text", minWidth: 60, height: 30, name: "log_filename",
							},
							{
								view: "button", type: "form", value: _("Save data"), click: function () {
									var name = this.getParentView().getValues().log_filename;
									saveLogs(name);
								}
							}
						]
					},
					{
						view: "toolbar", margin: -4, cols: [
							{
								view: "button", value: _("Close"), click: function () {
									$$(win1_upload).hide();
								}
							}
						]
					}]
			}
		};

		const main = {
			rows: [
				{height: 5},
				{
					id: "uploadAPI",
					hidden: true,
					view: "uploader",
					upload: ip + '/upload/logs',
					on: {
						onBeforeFileAdd: function (item) {
							var type = item.type.toLowerCase();
							if (type !== "dump") {
								webix.message(_("Only .DUMP files are supported"));
								return false;
							}
						},
						onFileUploadError: function (item) {
							webix.alert(_("Error during file upload"));
						},
						onFileUpload: function (file, response) {
							var today = new Date();
							var dd = today.getDate();
							var mm = today.getMonth(); //January is 0!
							var yyyy = today.getFullYear();
							if (mm === 0) {
								yyyy = yyyy - 1;
								mm = 12;
							}
							if (dd < 10) dd = "0" + dd;
							if (mm < 10) mm = "0" + mm;
							var current_date = yyyy + "-" + mm + "-" + dd + ' 00:00';
							webix.message(_("Upload successful"));
							getLogs(current_date, '');
						}
					},
					apiOnly: true
				},
				{
					view: "toolbar", css: theme,
					elements: [
						{
							view: "icon", tooltip: _("Export table to xlsx format"), hidden: !access.printing,
							icon: "wxi wxi-xlsx", popup: exportPopup
						},
						{
							view: "icon", tooltip: _("Print table"), hidden: !access.printing,
							icon: "wxi wxi-print", click: function () {
								webix.print($$("events"), {mode:"landscape", fit:"data", docHeader:_("Events"), docFooter: _("Events")});
							}
						},
						{},
						{
							view: "button",
							type: "image",
							label: _("Download"),
							autowidth: true,
							image: "sources/styles/download.svg",
							popup:download,
						},
						{
							view: "button",
							type: "image",
							hidden: !access.save_events,
							label: _("Upload"),
							autowidth: true,
							image: "sources/styles/upload.svg",
							on: {
								onItemClick: function (id) {
									$$("uploadAPI").show();
									$$("uploadAPI").fileDialog(this);
									$$("uploadAPI").hide();
								}
							}
						},
						{},
						{
							view: "button",
							type: "image",
							hidden: !access.save_events,
							label: _("_Save"),
							autowidth: true,
							image: "sources/styles/download.svg",
							popup:upload
						},
						{width: 3},
						{width: 3}
					]
				},
				{height: 5},
				Events
			]
		};

		return { type: "wide", cols: [main] };
	}

	init(){
		const _ = this.app.getService("locale")._;
		const ip = this.app.config.remoteHOST;
		const User = this.app.config.user;
		const Type = "archive";

		function getLogs(start, end) {
			var _methodName = "getLogs";
			webix.ajax().post(ip, {"method": _methodName, "user": User, "params": {"start": start, "end": end}},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							$$("events").clearAll();
							data.params.forEach(function (item, i, arr) {
								item.source = _(item.source);
								item.name = _(item.name);
							});
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

		function daysInMonth(month, year) {
			return new Date(year, month, 0).getDate();
		}

		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth(); //January is 0!
		var yyyy = today.getFullYear();
		if (mm === 0) {
			yyyy = yyyy - 1;
			mm = 12;
		}
		var daysInPreviousMonth = daysInMonth(mm, yyyy);
		if (daysInPreviousMonth < dd) dd = daysInPreviousMonth;
		else {
			if (dd < 10) dd = "0" + dd;
		}
		if (mm < 10) mm = "0" + mm;
		var current_date = yyyy + "-" + mm + "-" + dd + ' 00:00';

		getLogs(current_date, '');
	}
}

import {JetView} from "webix-jet";

export default class DynamicVerification extends JetView {
	config () {
		const _ = this.app.getService("locale")._;
		const theme = this.app.config.theme;
		const User = this.app.config.user;
		const ip = this.app.config.remoteHOST;
		const referenceView = this;
		const ids = this.app.config.ids;
		const info = $$('mainTop').$scope.app.config.globals.hardware;
		const company = $$('mainTop').$scope.app.config.globals.organizationName;

		var dataForPrint = [];
		var lastID = 1;

		var kleimo;
		var last_verification_id = 1;
		var verification_data_for_table = [];
		var heigth_for_verification_journal = 60;

		var dt1 = "dtsss" + ids.dt1;
		var win1_reports = "win02ss" + ids.dt1;
		var win_verification = "win1_verification_dynamic" + ids.dt1;
		var table_for_verification = "verification_table_for_verification_dynamic" + ids.dt1;
		var zvo_representative = "zvo_representative_" + ids.dt1;
		var goveverifier = "goveverifier_" + ids.dt1;
		var company_representative = "company_representative_" + ids.dt1;
		var dynamic_verification_table_for_print = "dynamic_verification_table_for_print" + ids.dt1;
		var for_print_dynamic = "for_print_dynamic" + ids.dt1;
		var button_print = "button_printer" + ids.dt1;
		ids.dt1 = ids.dt1 + 1;
		newv => this.app.config.ids = ids;

		function getKleimo () {
			var _methodName = "getKleimo";
			webix.ajax().post(
				ip, {"method": _methodName, "user": User, "params": []},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === "ok") {
							kleimo = data.params;
						}
					}
				});
		}

		function setLastVerification () {
			var _methodName = 'setLastVerification';
			webix.ajax().post(ip,
				{"method": _methodName, "user": User, "params": {"date": new Date()}},
				function (text, xml, xhr) {
					var _data = JSON.parse(text);
					if (_data.method === _methodName) {
						if (_data.answer === 'ok') {
							webix.message({type: "info", text: _(_data.params.message)})
						}
					}
				})
		}

		function getVerificationArchive () {
			var _methodName = 'getVerificationArchive';
			webix.ajax().post(ip,
				{"method": _methodName, "user": User, "params": ["dynamic"]},
				function (text, xml, xhr) {
					var data = JSON.parse(text);
					console.log(data);
					if (data.method === _methodName) {
						if (data.answer === 'ok') {
							verification_data_for_table = data.params.verifications;
							var _id = 0;
							verification_data_for_table.forEach(function (item, i, arr) {
								heigth_for_verification_journal += 40;
								if (item.id === null || item.id === "" || item.id === undefined || isNaN(item.id)) _id = 0;
								else _id = item.id;
								if (last_verification_id < _id) last_verification_id = _id + 1;
							});
						}
					}
				})
		}

		function setVerificationArchive () {
			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth() + 1; //January is 0!
			var yyyy = today.getFullYear();
			var _date = "";
			if (dd < 10) dd = "0" + dd;
			if (mm < 10) mm = "0" + mm;
			_date = yyyy + "-" + mm + "-" + dd;
			kleimo = kleimo[0];
			kleimo = parseInt(kleimo);

			//id verification_date weigher_person verification_person owner_person stamp weighing_type
			var params = {
				id: last_verification_id,
				verification_date: _date,
				weigher_person: $$(zvo_representative).getValue(),
				verification_person: $$(goveverifier).getValue(),
				owner_person: $$(company_representative).getValue(),
				stamp: kleimo,
				weighing_type: "dynamic"
			};

			var _methodName = 'setVerificationArchive';
			webix.ajax().post(ip,
				{"method": _methodName, "user": User, "params": params},
				function (text, xml, xhr) {
					var _data = JSON.parse(text);
					console.log(_data);
					if (_data.method === _methodName) {
						if (_data.answer === 'ok') {
							webix.message({type: "info", text: _(_data.params.message)})
						}
					}
				})
		}

		function saveTrain (showErrors) {
			var flag = true;
			$$('dynamic_verification_table').eachRow(function (_row) {
				const record = $$('dynamic_verification_table').getItem(_row);
				if (record.id < 6) {
					if (record.real_weight === 0 || record.measured_weight === 0) flag = false;
				}
			});
			if (flag) {
				var temp = $$("_#ofTrain").getValue();
				temp = parseInt(temp);
				$$('dynamic_verification_table').eachRow(function (_row) {
					const record = $$('dynamic_verification_table').getItem(_row);
					record.id = lastID;
					lastID += 1;
					if (record._number !== 'Σ') {
						var speed = record.speed;
						record.speed = speed.toFixed(2);
					}
					record.train_number = temp;
					dataForPrint.push(record);
				});
				temp += 1;
				$$("_#ofTrain").setValue(temp);
				$$('dynamic_verification_table').clearAll();
				$$('dynamic_verification_table').parse([
					{
						"id": 1,
						"_number": 1,
						"time": "00:00:00",
						"real_weight": 0,
						"measured_weight": 0,
						"speed": 0,
						"imprecisionKG": 0,
						"imprecisionPercent": 0,
					},
					{
						"id": 2,
						"_number": 2,
						"time": "00:00:00",
						"real_weight": 0,
						"measured_weight": 0,
						"speed": 0,
						"imprecisionKG": 0,
						"imprecisionPercent": 0,
					},
					{
						"id": 3,
						"_number": 3,
						"time": "00:00:00",
						"real_weight": 0,
						"measured_weight": 0,
						"speed": 0,
						"imprecisionKG": 0,
						"imprecisionPercent": 0,
					},
					{
						"id": 4,
						"_number": 4,
						"time": "00:00:00",
						"real_weight": 0,
						"measured_weight": 0,
						"speed": 0,
						"imprecisionKG": 0,
						"imprecisionPercent": 0,
					},
					{
						"id": 5,
						"_number": 5,
						"time": "00:00:00",
						"real_weight": 0,
						"measured_weight": 0,
						"speed": 0,
						"imprecisionKG": 0,
						"imprecisionPercent": 0,
					},
					{
						"id": 6,
						"_number": "Σ",
						"time": "00:00:00",
						"real_weight": 0,
						"measured_weight": 0,
						"speed": 0,
						"imprecisionKG": 0,
						"imprecisionPercent": 0,
					}]);
				webix.message({
					type: "info",
					text: _("Information of train is saved")
				})
			}
			else if (showErrors) webix.message({
				type: "error",
				text: _("Verification for these wagons is not complete")
			})

		}

		var data = [
			{
				"id": 1,
				"time": "00:00:00",
				"name": 1,
				"real_weight": 0,
				"measured_weight": 0,
				"imprecisionKG": 0,
				"imprecisionPercent": 0
			},
			{
				"id": 2,
				"time": "00:00:00",
				"name": 2,
				"real_weight": 0,
				"measured_weight": 0,
				"imprecisionKG": 0,
				"imprecisionPercent": 0
			},
			{
				"id": 3,
				"time": "00:00:00",
				"name": "Sum",
				"real_weight": 0,
				"measured_weight": 0,
				"imprecisionKG": 0,
				"imprecisionPercent": 0
			}
		];
		var started = false; // начата ли поверка

		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth() + 1; //January is 0!
		if (dd < 10) dd = "0" + dd;
		if (mm < 10) mm = "0" + mm;
		var current_date = dd + "." + mm + "." + today.getFullYear() + _("yyyy");

		const verification_journal_dynamic = {
			view: "window",
			css: theme,
			id: win_verification,
			height: 400,
			width: 800,
			move: true,
			head: {
				view: "toolbar", margin: -4, cols: [
					{view: "label", label: _("Verification journal"), width: 760},
					{
						view: "label",
						template: function (obj) {
							var html = "<div class='del_element'>";
							return html + "</div>";
						},
						click: function () {
							$$(win_verification).hide();
						}
					},
				]
			},
			body: {
				view: "scrollview", scroll: "y", body: {
					rows: [
						{
							view: "form", elements: [
								{
									cols: [
										{},
										{
											rows: [
												{
													view: "datatable",
													id: table_for_verification,
													editable: true,
													height: 270,
													width: 900,
													resizeColumn: {headerOnly: true},
													select: false,
													scroll: true,
													navigation: true,
													hover: "myhover",
													columns: [
														{
															id: "id",
															header: _("_number"),
															adjust: true,
															sort: "int"
														},
														{
															id: "verification_date",
															header: _("date"),
															adjust: true,
															sort: "int"
														},
														{
															id: "weigher_person",
															header: _("zvo_representative"),
															adjust: true,
															sort: "int",
														},
														{
															id: "verification_person",
															header: _("verificator"),
															adjust: true,
															sort: "int",
														},
														{
															id: "owner_person",
															header: _("company_representative"),
															adjust: true,
															sort: "int",
														},
														{
															id: "stamp",
															header: _("kleimo"),
															adjust: true,
														},
														{
															id: "weighing_type",
															header: _("weighing_type"),
															adjust: "header",
														}
													]
												}
											]
										},
										{},
									]
								}
							]
						}]
				}
			}
		}

		const popup = {
			view: "window",
			css: theme,
			id: win1_reports,
			height: 690,
			width: 1160,
			move: true,
			head: {
				view: "toolbar", margin: -4, cols: [
					{view: "label", label: _("Verification report"), width: 1120},
					{
						view: "label",
						template: function (obj) {
							var html = "<div class='del_element'>";
							return html + "</div>";
						},
						click: function () {
							$$(win1_reports).hide();
						}
					},
				]
			},
			body: {
				view: "scrollview", id: for_print_dynamic, scroll: "y", body: {
					rows: [
						{
							view: "form", elements: [
								{
									cols: [
										{},
										{
											rows: [

												{
													cols: [
														{},
														{
															view: "label",
															label: (_("Verification report from ") + current_date),
															width: 350
														},
														{}
													]
												},
												{height: 40},
												{
													cols: [
														{label: _("Organization:"), view: "label", width: 120},
														{view: "text", width: 574, height: 30, value: company},
														{},
													]
												},
												{
													hidden: true, cols: [
														{label: _("Weighing place:"), view: "label", width: 120},
														{view: "text", width: 200, height: 30},
														{},
													]
												},
												{
													cols: [
														{label: _("Type of weights"), view: "label", width: 160},
														{view: "text", width: 140, height: 30, value: info.typeOfScales},
														{width: 10},
														{label: _("Serial #"), view: "label", width: 160},
														{view: "text", width: 100, height: 30, value: info.serialNumber},
														{width: 10},
														{label: _("NPV"), view: "label", width: 50},
														{view: "text", width: 70, height: 30, value: ""},
														{}
													]
												},
												{
													view: "datatable",
													id: dynamic_verification_table_for_print,
													editable: true,
													width: 600,
													height: 270,
													resizeColumn: {headerOnly: true},
													select: false,
													scroll: false,
													navigation: false,
													hover: "myhover",
													data: data,
													columns: [
														{id: "id", header: "#", adjust: true, sort: "int", hidden: true},
														{id: "train_number", header: _("#ofTrain"), adjust: true, sort: "int"},
														{id: "_number", header: _("_number"), adjust: true, sort: "int"},
														{id: "real_weight", header: _("real_weight"), adjust: true},
														{
															id: "measured_weight",
															header: _("measured_weight"),
															adjust: true
														},
														{id: "speed", header: _("speed"), adjust: true},
														{
															id: "direction",
															header: _("direction"),
															css: "status",
															sort: "text",
															width: 45,
															adjust: true,
															template: data => {
																let icon = "";
																if (data.direction === true) {
																	icon = "arrow-right";
																	return `<span class='webix_icon wxi wxi-${icon} ${data.status}'></span>`;
																}
																else if (data.direction === false) {
																	icon = "arrow-left";
																	return `<span class='webix_icon wxi wxi-${icon} ${data.status}'></span>`;
																}
																else return "";
															}
														},
														{
															id: "imprecisionPercent",
															header: _("infelicity%"),
															adjust: true
														}
													],
												},
												{},
												{
													cols:
														[
															{label: _("ZVO Representative"), view: "label", width: 280},
															{id: zvo_representative, label: "", view: "label", width: 280},
															{label: _("Sign:"), view: "label", width: 100},
															{
																label: "________________________________________________________________________",
																view: "label",
																width: 300
															},
															{}
														]
												},
												{
													cols:
														[
															{
																label: _("Company Representative"),
																view: "label",
																width: 280
															},
															{
																id: company_representative,
																label: "",
																view: "label",
																width: 280
															},
															{label: _("Sign:"), view: "label", width: 100},
															{
																label: "________________________________________________________________________",
																view: "label",
																width: 300
															},
															{}
														]
												},
												{
													cols:
														[
															{label: _("Gov.verifier"), view: "label", width: 280},
															{id: goveverifier, label: "", view: "label", width: 280},
															{label: _("Sign:"), view: "label", width: 100},
															{
																label: "________________________________________________________________________",
																view: "label",
																width: 300
															},
															{}
														]
												},
											]
										},
										{}
									]
								},
								{
									view: "button",
									type: "form",
									value: _("Print"),
									id: button_print,
									click: function () {
										$$(button_print).hide();
										webix.print($$(for_print_dynamic), {
											mode: "landscape",
											fit: "data",
											docHeader: "",
											docFooter: ""
										});
										$$(button_print).show();
										$$(win1_reports).hide();
									}
								}
							]
						}]
				}
			}
		};

		function tableParseForVerificationJournal (obj, height) {
			setTimeout(function () {
				$$(table_for_verification).clearAll();
				$$(table_for_verification).parse(obj);
				$$(table_for_verification).define("height", height);
				$$(table_for_verification).resize();
			}, 1000);
		}

		function tableParse (obj, height) {
			setTimeout(function () {
				$$(dynamic_verification_table_for_print).define("height", height);
				$$(dynamic_verification_table_for_print).resize();
				$$(dynamic_verification_table_for_print).clearAll();
				$$(dynamic_verification_table_for_print).parse(obj);
				$$(zvo_representative).setValue($$("_zvo_representative").getValue());
				$$(goveverifier).setValue($$("_gov_verifier").getValue());
				$$(company_representative).setValue($$("_company_representative").getValue());
			}, 1000);
		}

		getKleimo();
		getVerificationArchive();

		return {
			view: "scrollview", id: "dynamic-verification", hidden: true, scroll: "y", body: {
				view: "form", elementsConfig: {labelPosition: "top"},
				rules: {
					$all: webix.rules.isNotEmpty
				},
				elements: [
					{
						rows: [
							{
								cols: [
									{
										cols: [{width: 5}, {
											rows: [
												{
													view: "button", value: _("Verification archive"),
													autowidth: true, popup: verification_journal_dynamic,
													click: function () {
														tableParseForVerificationJournal(verification_data_for_table, heigth_for_verification_journal);
													}
												},
												{}
											]
										}, {}]
									},
									{
										rows: [
											{
												cols: [
													{},
													{label: _("Verification date"), view: "label", width: 120},
													{id: "lastVerification2", view: "text", width: 100},
													{}
												]
											},
											{height: 10},
											{
												cols:
													[
														{label: _("ZVO Representative"), view: "label", width: 280},
														{
															id: "_zvo_representative",
															view: "text",
															width: 300,
															height: 40
														},
														{}
													]
											},
											{
												cols:
													[
														{
															label: _("Company Representative"),
															view: "label",
															width: 280
														},
														{
															id: "_company_representative",
															view: "text",
															width: 300,
															height: 40
														},
														{}
													]
											},
											{
												cols:
													[
														{label: _("Gov.verifier"), view: "label", width: 280},
														{id: "_gov_verifier", view: "text", width: 300, height: 40},
														{}
													]
											},
											{height: 10},
											{
												cols:
													[
														{},
														{
															label: _("# of train"),
															view: "label",
															width: 130
														},
														{
															id: "_#ofTrain",
															value: 1,
															view: "text",
															width: 40,
															readonly: true
														},
														{}
													]
											},
											{height: 10},
											{
												view: "datatable",
												id: "dynamic_verification_table",
												editable: true,
												resizeColumn: {headerOnly: true},
												width: 800,
												scroll: false,
												height: 258,
												select: "row",
												data: [
													{
														"id": 1,
														"_number": 1,
														"time": "00:00:00",
														"real_weight": 0,
														"measured_weight": 0,
														"speed": 0,
														"imprecisionKG": 0,
														"imprecisionPercent": 0,
													},
													{
														"id": 2,
														"_number": 2,
														"time": "00:00:00",
														"real_weight": 0,
														"measured_weight": 0,
														"speed": 0,
														"imprecisionKG": 0,
														"imprecisionPercent": 0,
													},
													{
														"id": 3,
														"_number": 3,
														"time": "00:00:00",
														"real_weight": 0,
														"measured_weight": 0,
														"speed": 0,
														"imprecisionKG": 0,
														"imprecisionPercent": 0,
													},
													{
														"id": 4,
														"_number": 4,
														"time": "00:00:00",
														"real_weight": 0,
														"measured_weight": 0,
														"speed": 0,
														"imprecisionKG": 0,
														"imprecisionPercent": 0,
													},
													{
														"id": 5,
														"_number": 5,
														"time": "00:00:00",
														"real_weight": 0,
														"measured_weight": 0,
														"speed": 0,
														"imprecisionKG": 0,
														"imprecisionPercent": 0,
													},
													{
														"id": 6,
														"_number": "Σ",
														"time": "00:00:00",
														"real_weight": 0,
														"measured_weight": 0,
														"speed": 0,
														"imprecisionKG": 0,
														"imprecisionPercent": 0,
													}],
												navigation: true,
												hover: "myhover",
												columns: [
													{id: "id", header: "#", adjust: true, sort: "int", hidden: true},
													{id: "_number", header: _("_number"), adjust: true, sort: "int"},
													{
														id: "time",
														header: "time",
														adjust: true,
														sort: "int",
														hidden: true
													},
													{
														id: "real_weight", header: _("real_weight"), adjust: true,
														editor: "text", format: function (value) {
															return webix.i18n.intFormat(value);
														},
														editParse: function (value) {
															return webix.Number.parse(value, {
																groupSize: webix.i18n.groupSize,
																groupDelimiter: webix.i18n.groupDelimiter
															});
														},
														editFormat: function (value) {
															return webix.i18n.intFormat(value);
														}
													},
													{
														id: "measured_weight",
														header: _("measured_weight"),
														adjust: true,
														format: function (value) {
															return webix.i18n.intFormat(value);
														},
														editParse: function (value) {
															return webix.Number.parse(value, {
																groupSize: webix.i18n.groupSize,
																groupDelimiter: webix.i18n.groupDelimiter
															});
														},
														editFormat: function (value) {
															return webix.i18n.intFormat(value);
														}
													},
													{
														id: "speed", header: _("speed, kM/H"), adjust: true,
														format: function (value) {
															return webix.i18n.numberFormat(value);
														},
														editParse: function (value) {
															return webix.Number.parse(value, {
																groupSize: webix.i18n.groupSize,
																groupDelimiter: webix.i18n.groupDelimiter,
																decimalSize: webix.i18n.decimalSize,
																decimalDelimiter: webix.i18n.decimalDelimiter
															});
														},
														editFormat: function (value) {
															return webix.i18n.numberFormat(value);
														}
													},
													{
														id: "direction",
														header: _("direction"),
														css: "status",
														sort: "text",
														width: 45,
														adjust: true,
														template: data => {
															let icon = "";
															if (data.direction === true) {
																icon = "arrow-right";
																return `<span class='webix_icon wxi wxi-${icon} ${data.status}'></span>`;
															}
															else if (data.direction === false) {
																icon = "arrow-left";
																return `<span class='webix_icon wxi wxi-${icon} ${data.status}'></span>`;
															}
															else return "";
														}
													},
													{
														id: "imprecisionPercent",
														header: _("infelicity%"),
														adjust: true,
														template: function (obj) {
															if (obj.imprecisionPercent === null || obj.imprecisionPercent === "" || obj.imprecisionPercent === undefined || isNaN(obj.imprecisionPercent)) return "";
															else return obj['imprecisionPercent'];
														}
													}]
											},
											{
												view: "icon", tooltip: _("Go to table view settings"), hidden: true,
												css: "add_element", click: function () {
													var last_id = $$("dynamic_verification_table").getLastId() + 1;
													$$("dynamic_verification_table").add({
														"id": last_id,
														"time": "00:00:00",
														"real_weight": 0,
														"measured_weight": 0,
														"speed": 0,
														"imprecisionKG": 0,
														"imprecisionPercent": 0
													});
												}
											},
											{height: 10},
											{
												cols: [
													{},
													{
														view: "button",
														value: _("Start verification"),
														width: 200,
														type: "form",
														id: "verification_starter_btn_dynamic",
														click: function () {
															if (this.data.value === _("Start verification")) {
																var flag = true;
																$$('dynamic_verification_table').eachRow(function (_row) {
																	const record = $$('dynamic_verification_table').getItem(_row);
																	if (record.id < 6) {
																		if (record.real_weight === 0) flag = false;
																	}
																});
																if (flag) {
																	referenceView.app.callEvent("setExchange=nothing");
																	const configuration = referenceView.app.config.configuration;
																	if (configuration.weighing_allowed) {
																		referenceView.app.callEvent("setConnection=verification.dynamic");
																		referenceView.app.callEvent("connection");
																		$$('verification_starter_btn_dynamic').setValue(_("Stop verification"));
																		started = true;
																	}
																	else webix.message({
																		type: "error",
																		text: _("Weighing is not allowed")
																	})
																}
																else webix.message({
																	type: "error",
																	text: _("Enter the real weights for the wagons first")
																})
															}
															else {
																started = false;
																$$('verification_starter_btn_dynamic').setValue(_("Start verification"));
																referenceView.app.callEvent("setExchange=nothing");
															}
														}
													},
													{width: 10},
													{
														view: "button", value: _("Next train"),
														width: 200, type: "form", id: "next_train_btn",
														click: function () {
															saveTrain(true);
														}
													},
													{}
												]
											},
											{},
										]
									},
									{minWidth: 5},
								]
							},
              {height: 10},
							{
								cols: [
									{},
									{
										view: "button", value: _("Get verification document"),
										autowidth: true, type: "form", popup: popup,
										click: function () {
											var heigth = 40, i = 0;
											console.log(dataForPrint);
											saveTrain(false);
											tableParse(dataForPrint, heigth * lastID);
										}
									},
									{}
								]
							}
						]
					}
				]
			}
		}
	}

	init () {
		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth() + 1; //January is 0!
		var yyyy = today.getFullYear();
		if (dd < 10) dd = "0" + dd;
		if (mm < 10) mm = "0" + mm;
		var current_date = dd + "-" + mm + "-" + yyyy;
		$$('lastVerification2').setValue(current_date);
	}

}